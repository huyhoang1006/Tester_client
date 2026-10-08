'use strict'

import axios from 'axios'
import {execFile} from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {app} from 'electron'

const HELPER_RELATIVE_PATH = path.join('extra_binaries', 'at-license', 'lccinspector.exe')
const FINGERPRINT_ORDER = ['DEFAULT', 'Disk', 'MAC', 'IP']
const LICENSE_STORE_VERSION = 1
const LICENSE_STORE_FILE = 'online-license.json'
const REQUEST_TIMEOUT_MS = 15000
const STORAGE_CONTEXT = 'ATDigitalTester/online-license/v1'
const ACTIVATION_REQUIRED_CODES = new Set([
    'NO_MACHINE',
    'NO_MACHINES',
    'MACHINE_SCOPE_REQUIRED',
    'FINGERPRINT_SCOPE_REQUIRED',
    'FINGERPRINT_SCOPE_MISMATCH'
])

const unique = values => [...new Set(values.filter(Boolean).map(value => path.resolve(value)))]

const createLicenseError = (message, code, details = {}) => {
    const error = new Error(message)
    error.code = code
    Object.assign(error, details)
    return error
}

export const getInspectorCandidates = () => unique([
    process.env.AT_LICENSE_INSPECTOR_PATH,
    path.join(process.resourcesPath || '', HELPER_RELATIVE_PATH),
    path.join(app.getAppPath(), HELPER_RELATIVE_PATH),
    path.join(process.cwd(), HELPER_RELATIVE_PATH)
])

export const findInspectorPath = () => {
    const inspectorPath = getInspectorCandidates().find(candidate => fs.existsSync(candidate))
    if (!inspectorPath) {
        throw createLicenseError('AT License fingerprint helper is not installed', 'FINGERPRINT_HELPER_NOT_FOUND')
    }
    return inspectorPath
}

const extractJson = stdout => {
    const start = stdout.indexOf('{')
    const end = stdout.lastIndexOf('}')
    if (start < 0 || end < start) {
        throw createLicenseError('AT License fingerprint helper returned invalid output', 'FINGERPRINT_OUTPUT_INVALID')
    }

    try {
        return JSON.parse(stdout.slice(start, end + 1))
    } catch (cause) {
        throw createLicenseError('AT License fingerprint report is not valid JSON', 'FINGERPRINT_OUTPUT_INVALID', {cause})
    }
}

const normalizeFingerprints = report => {
    if (!report || !Array.isArray(report.fingerprints)) return []
    return report.fingerprints
        .filter(item => item && item.status === 'ok' && typeof item.value === 'string' && item.value.trim())
        .map(item => ({
            strategy: String(item.strategy || 'UNKNOWN'),
            strategyId: Number.isFinite(Number(item.strategyId)) ? Number(item.strategyId) : null,
            value: item.value.trim()
        }))
}

export const selectFingerprint = report => {
    const fingerprints = normalizeFingerprints(report)
    for (const strategy of FINGERPRINT_ORDER) {
        const match = fingerprints.find(item => item.strategy === strategy)
        if (match) return match
    }
    return fingerprints[0] || null
}

const executeInspector = inspectorPath => new Promise((resolve, reject) => {
    execFile(inspectorPath, ['--json'], {
        windowsHide: true,
        timeout: 15000,
        maxBuffer: 2 * 1024 * 1024
    }, (error, stdout, stderr) => {
        if (error) {
            reject(createLicenseError(
                stderr.trim() || error.message || 'Could not generate device fingerprint',
                error.killed ? 'FINGERPRINT_HELPER_TIMEOUT' : 'FINGERPRINT_HELPER_FAILED'
            ))
            return
        }
        resolve(extractJson(stdout))
    })
})

export const getDeviceFingerprint = async () => {
    const inspectorPath = findInspectorPath()
    const report = await executeInspector(inspectorPath)
    const selected = selectFingerprint(report)
    if (!selected) {
        throw createLicenseError('No valid device fingerprint was generated', 'FINGERPRINT_NOT_AVAILABLE')
    }

    return {
        project: report.project || null,
        fingerprint: selected.value,
        strategy: selected.strategy,
        strategyId: selected.strategyId,
        fingerprints: normalizeFingerprints(report)
    }
}

const getDefaultConfig = () => ({
    serverUrl: process.env.VUE_APP_LICENSE_SERVER_URL || process.env.APP_LICENSE_SERVER_URL || '',
    productId: process.env.VUE_APP_LICENSE_PRODUCT_ID || process.env.APP_LICENSE_PRODUCT_ID || ''
})

const normalizeServerUrl = value => {
    const input = String(value || '').trim()
    if (!input) return ''

    let parsed
    try {
        parsed = new URL(input)
    } catch (cause) {
        throw createLicenseError('License server URL is invalid', 'LICENSE_CONFIG_INVALID', {cause})
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw createLicenseError('License server URL must use HTTP or HTTPS', 'LICENSE_CONFIG_INVALID')
    }

    parsed.search = ''
    parsed.hash = ''
    return parsed.toString().replace(/\/$/, '')
}

export const normalizeOnlineLicenseConfig = input => ({
    serverUrl: normalizeServerUrl(input && input.serverUrl),
    productId: String((input && input.productId) || '').trim()
})

const requireOnlineLicenseConfig = input => {
    const config = normalizeOnlineLicenseConfig(input)
    if (!config.serverUrl || !config.productId) {
        throw createLicenseError(
            'License server URL and product ID are required',
            'LICENSE_CONFIG_REQUIRED',
            {config}
        )
    }
    return config
}

const getStorePath = () => path.join(app.getPath('userData'), 'license', LICENSE_STORE_FILE)

const readStoredLicense = () => {
    const storePath = getStorePath()
    if (!fs.existsSync(storePath)) return null

    try {
        const record = JSON.parse(fs.readFileSync(storePath, 'utf8'))
        if (!record || record.version !== LICENSE_STORE_VERSION) {
            throw new Error('Unsupported license storage version')
        }
        return record
    } catch (cause) {
        throw createLicenseError('Stored license information is invalid', 'LICENSE_STORAGE_INVALID', {cause})
    }
}

const writeStoredLicense = record => {
    const storePath = getStorePath()
    fs.mkdirSync(path.dirname(storePath), {recursive: true})
    fs.writeFileSync(storePath, JSON.stringify(record, null, 2), {encoding: 'utf8', mode: 0o600})
}

const deriveStorageKey = fingerprint => crypto
    .createHash('sha256')
    .update(`${STORAGE_CONTEXT}\0${fingerprint}`, 'utf8')
    .digest()

const encryptLicenseKey = (licenseKey, fingerprint) => {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', deriveStorageKey(fingerprint), iv)
    cipher.setAAD(Buffer.from(STORAGE_CONTEXT, 'utf8'))
    const encrypted = Buffer.concat([cipher.update(licenseKey, 'utf8'), cipher.final()])
    return {
        iv: iv.toString('base64'),
        tag: cipher.getAuthTag().toString('base64'),
        value: encrypted.toString('base64')
    }
}

const decryptLicenseKey = (secret, fingerprint) => {
    try {
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            deriveStorageKey(fingerprint),
            Buffer.from(secret.iv, 'base64')
        )
        decipher.setAAD(Buffer.from(STORAGE_CONTEXT, 'utf8'))
        decipher.setAuthTag(Buffer.from(secret.tag, 'base64'))
        return Buffer.concat([
            decipher.update(Buffer.from(secret.value, 'base64')),
            decipher.final()
        ]).toString('utf8')
    } catch (cause) {
        throw createLicenseError(
            'Stored license key cannot be read on this device',
            'LICENSE_STORAGE_DEVICE_MISMATCH',
            {cause}
        )
    }
}

const LICENSE_API_PATH = '/v1'

const createHttpClient = (config, licenseKey) => axios.create({
    baseURL: config.serverUrl,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `License ${licenseKey}`
    }
})

const mapHttpError = error => {
    if (error && error.code && String(error.code).startsWith('LICENSE_')) return error

    if (!error || !error.response) {
        return createLicenseError(
            'Cannot connect to the license server. An internet connection is required.',
            'LICENSE_SERVER_UNREACHABLE',
            {cause: error}
        )
    }

    const body = error.response.data || {}
    const firstError = Array.isArray(body.errors) ? body.errors[0] : null
    const message = (firstError && (firstError.detail || firstError.title))
        || body.message
        || `License server rejected the request (${error.response.status})`
    return createLicenseError(message, (firstError && firstError.code) || 'LICENSE_SERVER_REJECTED', {
        httpStatus: error.response.status,
        serverResponse: body
    })
}

const validateLicenseKey = async ({config, licenseKey, fingerprint, machineId}) => {
    const client = createHttpClient(config, licenseKey)
    const scope = {
        product: config.productId,
        fingerprint
    }
    if (machineId) scope.machine = machineId

    try {
        const response = await client.post(`${LICENSE_API_PATH}/licenses/actions/validate-key`, {
            meta: {
                key: licenseKey,
                scope
            }
        })
        const body = response.data || {}
        const attributes = (body.data && body.data.attributes) || {}
        return {
            valid: body.meta && body.meta.valid === true,
            code: (body.meta && body.meta.code) || null,
            detail: (body.meta && body.meta.detail) || null,
            licenseId: (body.data && body.data.id) || null,
            licenseStatus: attributes.status || null,
            expiresAt: attributes.expiry || attributes.expires || attributes.expiresAt || null
        }
    } catch (error) {
        throw mapHttpError(error)
    }
}

const findMachine = async ({config, licenseKey, fingerprint, licenseId}) => {
    const client = createHttpClient(config, licenseKey)
    try {
        const response = await client.get(`${LICENSE_API_PATH}/machines`, {
            params: {fingerprint, license: licenseId}
        })
        const machines = Array.isArray(response.data && response.data.data) ? response.data.data : []
        return machines[0] || null
    } catch (error) {
        throw mapHttpError(error)
    }
}

const createMachine = async ({config, licenseKey, fingerprint, licenseId}) => {
    const client = createHttpClient(config, licenseKey)
    try {
        const response = await client.post(`${LICENSE_API_PATH}/machines`, {
            data: {
                type: 'machines',
                attributes: {
                    fingerprint,
                    name: os.hostname(),
                    hostname: os.hostname(),
                    platform: `${process.platform}/${process.arch}`,
                    metadata: {
                        application: 'AT Digital Tester',
                        version: app.getVersion()
                    }
                },
                relationships: {
                    license: {
                        data: {type: 'licenses', id: licenseId}
                    }
                }
            }
        })
        return response.data && response.data.data
    } catch (error) {
        const mapped = mapHttpError(error)
        if (mapped.httpStatus === 422) {
            const existing = await findMachine({config, licenseKey, fingerprint, licenseId})
            if (existing) return existing
        }
        throw mapped
    }
}

const ensureMachine = async params => {
    const existing = await findMachine(params)
    if (existing) return existing
    return createMachine(params)
}

const pingMachine = async ({config, licenseKey, machineId}) => {
    if (!machineId) return
    const client = createHttpClient(config, licenseKey)
    try {
        await client.post(`${LICENSE_API_PATH}/machines/${encodeURIComponent(machineId)}/actions/ping-heartbeat`, {
            meta: {}
        })
    } catch (error) {
        const mapped = mapHttpError(error)
        // Heartbeat is optional for many policies. Validation remains authoritative.
        if (![403, 404, 405, 422].includes(mapped.httpStatus)) throw mapped
    }
}

const publicConfig = config => ({
    serverUrl: config.serverUrl,
    productId: config.productId
})

const invalidValidationError = validation => createLicenseError(
    validation.detail || 'This license is not valid for this device',
    validation.code || 'LICENSE_INVALID',
    {validation}
)

export const activateOnlineLicense = async payload => {
    const config = requireOnlineLicenseConfig(payload)
    const licenseKey = String((payload && payload.licenseKey) || '').trim()
    if (!licenseKey) {
        throw createLicenseError('License key is required', 'LICENSE_KEY_REQUIRED')
    }

    const device = await getDeviceFingerprint()
    const params = {config, licenseKey, fingerprint: device.fingerprint}
    const initialValidation = await validateLicenseKey(params)

    if (!initialValidation.valid && !ACTIVATION_REQUIRED_CODES.has(initialValidation.code)) {
        throw invalidValidationError(initialValidation)
    }
    if (!initialValidation.licenseId) {
        throw createLicenseError('License server did not return a license ID', 'LICENSE_RESPONSE_INVALID')
    }

    const machine = await ensureMachine({...params, licenseId: initialValidation.licenseId})
    if (!machine || !machine.id) {
        throw createLicenseError('License server did not return a machine ID', 'LICENSE_RESPONSE_INVALID')
    }

    const activatedParams = {...params, machineId: machine.id}
    await pingMachine(activatedParams)
    const validation = await validateLicenseKey(activatedParams)
    if (!validation.valid) throw invalidValidationError(validation)

    writeStoredLicense({
        version: LICENSE_STORE_VERSION,
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy,
        licenseId: validation.licenseId || initialValidation.licenseId,
        machineId: machine.id,
        secret: encryptLicenseKey(licenseKey, device.fingerprint),
        activatedAt: new Date().toISOString()
    })

    return {
        licensed: true,
        status: 'valid',
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy,
        licenseId: validation.licenseId || initialValidation.licenseId,
        machineId: machine.id,
        licenseStatus: validation.licenseStatus,
        expiresAt: validation.expiresAt,
        checkedAt: new Date().toISOString()
    }
}

export const checkOnlineLicense = async () => {
    const stored = readStoredLicense()
    const config = requireOnlineLicenseConfig((stored && stored.config) || getDefaultConfig())
    const device = await getDeviceFingerprint()

    if (!stored || !stored.secret) {
        return {
            licensed: false,
            status: 'activation_required',
            code: 'LICENSE_ACTIVATION_REQUIRED',
            config: publicConfig(config),
            fingerprint: device.fingerprint,
            fingerprintStrategy: device.strategy
        }
    }
    if (stored.fingerprint !== device.fingerprint) {
        return {
            licensed: false,
            status: 'device_changed',
            code: 'LICENSE_DEVICE_CHANGED',
            message: 'This device fingerprint has changed. Activate the application again.',
            config: publicConfig(config),
            fingerprint: device.fingerprint,
            fingerprintStrategy: device.strategy
        }
    }

    const licenseKey = decryptLicenseKey(stored.secret, device.fingerprint)
    const params = {
        config,
        licenseKey,
        fingerprint: device.fingerprint,
        machineId: stored.machineId
    }
    await pingMachine(params)
    const validation = await validateLicenseKey(params)

    if (!validation.valid) {
        return {
            licensed: false,
            status: 'invalid',
            code: validation.code || 'LICENSE_INVALID',
            message: validation.detail || 'This license is not valid for this device',
            config: publicConfig(config),
            fingerprint: device.fingerprint,
            fingerprintStrategy: device.strategy,
            licenseId: stored.licenseId,
            machineId: stored.machineId,
            checkedAt: new Date().toISOString()
        }
    }

    return {
        licensed: true,
        status: 'valid',
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy,
        licenseId: validation.licenseId || stored.licenseId,
        machineId: stored.machineId,
        licenseStatus: validation.licenseStatus,
        expiresAt: validation.expiresAt,
        checkedAt: new Date().toISOString()
    }
}

export const getOnlineLicenseSetup = async () => {
    const stored = readStoredLicense()
    const config = normalizeOnlineLicenseConfig((stored && stored.config) || getDefaultConfig())
    const device = await getDeviceFingerprint()
    return {
        configured: Boolean(config.serverUrl && config.productId),
        activated: Boolean(stored && stored.secret),
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy
    }
}

export const clearOnlineLicense = () => {
    const storePath = getStorePath()
    if (fs.existsSync(storePath)) fs.unlinkSync(storePath)
    return {cleared: true}
}
