'use strict'

import axios from 'axios'
import {execFile} from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {app, BrowserWindow} from 'electron'
import * as notificationEntityFunc from '@/function/entity/notification'

const HELPER_RELATIVE_PATH = path.join('extra_binaries', 'at-license', 'lccinspector.exe')
const FINGERPRINT_ORDER = ['Disk', 'DEFAULT', 'MAC', 'IP']
const LICENSE_STORE_VERSION = 3
const SUPPORTED_LICENSE_STORE_VERSIONS = new Set([1, 2, LICENSE_STORE_VERSION])
const LICENSE_STORE_FILE = 'online-license.json'
const REQUEST_TIMEOUT_MS = 15000
const STORAGE_CONTEXT = 'ATDigitalTester/online-license/v1'
const VALIDATION_CACHE_CONTEXT = 'ATDigitalTester/license-validation-cache/v1'
const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000
const GRACE_WARNING_MS = 5 * 24 * 60 * 60 * 1000
const LICENSE_SERVER_URL = 'http://103.163.118.212:30840'
const LICENSE_PRODUCT_ID = '907e544d-bdd1-40b2-98f5-f69144ad4531'
const ACTIVATION_REQUIRED_CODES = new Set([
    'NO_MACHINE',
    'NO_MACHINES',
    'MACHINE_SCOPE_REQUIRED',
    'FINGERPRINT_SCOPE_REQUIRED',
    'FINGERPRINT_SCOPE_MISMATCH'
])
const BLOCKED_LICENSE_STATUSES = new Set([
    'expired',
    'revoked',
    'suspended',
    'inactive',
    'overdue'
])

const unique = values => [...new Set(values.filter(Boolean).map(value => path.resolve(value)))]

const notifyNotificationChanged = data => {
    BrowserWindow.getAllWindows()
        .filter(browserWindow => !browserWindow.isDestroyed())
        .forEach(browserWindow => browserWindow.webContents.send('notification-created', data))
}

const saveLicenseNotification = async notification => {
    try {
        const result = await notificationEntityFunc.upsertLicenseNotification(notification)
        notifyNotificationChanged(result.data)
    } catch (_) {
        // A notification storage failure must not change the license decision.
    }
}

const resolveLicenseNotifications = async () => {
    try {
        const result = await notificationEntityFunc.resolveLicenseNotifications()
        if (result.changed) notifyNotificationChanged(null)
    } catch (_) {
        // A notification storage failure must not change the license decision.
    }
}

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

export const selectFingerprint = (report, preferredStrategy = null) => {
    const fingerprints = normalizeFingerprints(report)
    const strategies = preferredStrategy
        ? [preferredStrategy, ...FINGERPRINT_ORDER.filter(strategy => strategy !== preferredStrategy)]
        : FINGERPRINT_ORDER
    for (const strategy of strategies) {
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

export const getDeviceFingerprint = async (preferredStrategy = null) => {
    const inspectorPath = findInspectorPath()
    const report = await executeInspector(inspectorPath)
    const selected = selectFingerprint(report, preferredStrategy)
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
    serverUrl: LICENSE_SERVER_URL,
    productId: LICENSE_PRODUCT_ID
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
        if (!record || !SUPPORTED_LICENSE_STORE_VERSIONS.has(record.version)) {
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

const validationCachePayload = record => ({
    fingerprint: String(record.fingerprint || ''),
    serverFingerprint: String(record.serverFingerprint || ''),
    licenseId: record.licenseId || null,
    machineId: record.machineId || null,
    licenseStatus: record.licenseStatus || null,
    expiresAt: record.expiresAt || null,
    lastValidatedAt: record.lastValidatedAt || null,
    lastObservedAt: record.lastObservedAt || null
})

const signValidationCache = (record, fingerprint) => crypto
    .createHmac('sha256', deriveStorageKey(fingerprint))
    .update(VALIDATION_CACHE_CONTEXT, 'utf8')
    .update('\0', 'utf8')
    .update(JSON.stringify(validationCachePayload(record)), 'utf8')
    .digest('base64')

const hasValidValidationSignature = (record, fingerprint) => {
    if (!record || !record.validationSignature) return false
    try {
        const expected = Buffer.from(signValidationCache(record, fingerprint), 'base64')
        const actual = Buffer.from(record.validationSignature, 'base64')
        return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
    } catch (_) {
        return false
    }
}

const parseDateMs = value => {
    if (!value) return null
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? parsed : null
}

const isExpiredAt = (expiresAt, now = Date.now()) => {
    const expiryMs = parseDateMs(expiresAt)
    return expiryMs !== null && expiryMs <= now
}

const isBlockedLicenseStatus = status => BLOCKED_LICENSE_STATUSES.has(
    String(status || '').trim().toLowerCase()
)

const isGraceEligibleError = error => error && [
    'LICENSE_SERVER_UNREACHABLE',
    'LICENSE_SERVICE_UNAVAILABLE'
].includes(error.code)

const buildSignedRecord = (record, fingerprint) => {
    const signed = {...record}
    signed.validationSignature = signValidationCache(signed, fingerprint)
    return signed
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
    if (error.response.status >= 500 || [408, 429].includes(error.response.status)) {
        return createLicenseError(
            'The license service is temporarily unavailable.',
            'LICENSE_SERVICE_UNAVAILABLE',
            {httpStatus: error.response.status, serverResponse: body, cause: error}
        )
    }
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

const publicConfig = config => ({
    serverUrl: config.serverUrl,
    productId: config.productId
})

const invalidValidationError = validation => createLicenseError(
    validation.detail || 'This license is not valid for this device',
    validation.code || 'LICENSE_INVALID',
    {validation}
)

const getServerFingerprint = stored => String(
    (stored && (stored.serverFingerprint || stored.fingerprint)) || ''
).trim()

const migrateLegacyStoredLicense = ({stored, config, licenseKey, device}) => {
    if (!stored || stored.version === LICENSE_STORE_VERSION) return stored

    const migratedAt = new Date().toISOString()
    const lastValidatedAt = stored.lastValidatedAt || migratedAt
    const migrated = buildSignedRecord({
        version: LICENSE_STORE_VERSION,
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy,
        serverFingerprint: getServerFingerprint(stored),
        licenseId: stored.licenseId,
        machineId: stored.machineId,
        licenseStatus: stored.licenseStatus || 'active',
        expiresAt: stored.expiresAt || null,
        secret: encryptLicenseKey(licenseKey, device.fingerprint),
        activatedAt: stored.activatedAt || migratedAt,
        lastValidatedAt,
        lastObservedAt: stored.lastObservedAt || lastValidatedAt,
        migratedAt
    }, device.fingerprint)
    writeStoredLicense(migrated)
    return migrated
}

const getBlockedValidation = validation => {
    const status = String(validation.licenseStatus || '').trim().toLowerCase()
    const code = String(validation.code || '').trim().toUpperCase()
    if (status === 'expired' || code.includes('EXPIRED') || isExpiredAt(validation.expiresAt)) {
        return {
            code: 'LICENSE_EXPIRED',
            status: 'expired',
            message: 'This license has expired. Enter a valid license key to continue.'
        }
    }
    if (isBlockedLicenseStatus(status)) {
        return {
            code: `LICENSE_${status.toUpperCase()}`,
            status,
            message: `This license is ${status}. Contact the system administrator.`
        }
    }
    for (const blockedStatus of ['REVOKED', 'SUSPENDED', 'INACTIVE', 'OVERDUE']) {
        if (code.includes(blockedStatus)) {
            return {
                code: `LICENSE_${blockedStatus}`,
                status: blockedStatus.toLowerCase(),
                message: `This license is ${blockedStatus.toLowerCase()}. Contact the system administrator.`
            }
        }
    }
    return null
}

const persistSuccessfulValidation = async ({stored, config, device, validation}) => {
    const validatedAt = new Date().toISOString()
    const updated = buildSignedRecord({
        ...stored,
        version: LICENSE_STORE_VERSION,
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy,
        serverFingerprint: getServerFingerprint(stored),
        licenseId: validation.licenseId || stored.licenseId,
        licenseStatus: validation.licenseStatus || 'active',
        expiresAt: validation.expiresAt || stored.expiresAt || null,
        lastValidatedAt: validatedAt,
        lastObservedAt: validatedAt
    }, device.fingerprint)
    writeStoredLicense(updated)
    await resolveLicenseNotifications()
    return updated
}

const createCachedLicenseResult = async ({stored, config, device}) => {
    const common = {
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy,
        licenseId: stored.licenseId,
        machineId: stored.machineId,
        licenseStatus: stored.licenseStatus,
        expiresAt: stored.expiresAt,
        lastValidatedAt: stored.lastValidatedAt,
        checkedAt: new Date().toISOString()
    }
    if (!hasValidValidationSignature(stored, device.fingerprint)) {
        return {
            ...common,
            licensed: false,
            status: 'cache_invalid',
            code: 'LICENSE_CACHE_INVALID',
            message: 'Stored license validation data is invalid. Connect to the license service again.'
        }
    }

    const blocked = getBlockedValidation(stored)
    if (blocked) return {...common, ...blocked, licensed: false}

    const now = Date.now()
    const lastValidatedMs = parseDateMs(stored.lastValidatedAt)
    const lastObservedMs = parseDateMs(stored.lastObservedAt)
    if (lastObservedMs !== null && now + (5 * 60 * 1000) < lastObservedMs) {
        return {
            ...common,
            licensed: false,
            status: 'revalidation_required',
            code: 'LICENSE_REVALIDATION_REQUIRED',
            message: 'The system clock changed. Connect to the license service to validate the license again.'
        }
    }
    if (lastValidatedMs === null) {
        return {
            ...common,
            licensed: false,
            status: 'revalidation_required',
            code: 'LICENSE_REVALIDATION_REQUIRED',
            message: 'Online license validation is required.'
        }
    }

    const graceExpiresMs = lastValidatedMs + GRACE_PERIOD_MS
    const graceRemainingMs = graceExpiresMs - now
    if (graceRemainingMs <= 0) {
        const message = 'Online license validation is required. The license service is down, please contact system admin.'
        await saveLicenseNotification({
            kind: 'expired',
            name: 'Online license validation required',
            message,
            type: 'error'
        })
        return {
            ...common,
            licensed: false,
            status: 'revalidation_required',
            code: 'LICENSE_REVALIDATION_REQUIRED',
            message
        }
    }

    const graceDaysRemaining = Math.max(1, Math.ceil(graceRemainingMs / (24 * 60 * 60 * 1000)))
    const warning = graceRemainingMs <= GRACE_WARNING_MS
        ? `Please connect to the internet within ${graceDaysRemaining} day(s) to validate the license.`
        : null
    if (warning) {
        await saveLicenseNotification({
            kind: 'warning',
            name: 'License validation reminder',
            message: warning,
            type: 'warning'
        })
    }
    const updated = buildSignedRecord({
        ...stored,
        lastObservedAt: new Date(now).toISOString()
    }, device.fingerprint)
    writeStoredLicense(updated)

    return {
        ...common,
        licensed: true,
        status: 'grace',
        usingCache: true,
        warning,
        graceDaysRemaining,
        graceExpiresAt: new Date(graceExpiresMs).toISOString()
    }
}

export const activateOnlineLicense = async payload => {
    const config = requireOnlineLicenseConfig(getDefaultConfig())
    const licenseKey = String((payload && payload.licenseKey) || '').trim()
    if (!licenseKey) {
        throw createLicenseError('License key is required', 'LICENSE_KEY_REQUIRED')
    }

    const device = await getDeviceFingerprint()
    const params = {config, licenseKey, fingerprint: device.fingerprint}
    const initialValidation = await validateLicenseKey(params)

    const initialBlocked = getBlockedValidation(initialValidation)
    if (initialBlocked) {
        throw createLicenseError(initialBlocked.message, initialBlocked.code, {validation: initialValidation})
    }
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
    const validation = await validateLicenseKey(activatedParams)
    const blocked = getBlockedValidation(validation)
    if (blocked) throw createLicenseError(blocked.message, blocked.code, {validation})
    if (!validation.valid) throw invalidValidationError(validation)

    const activatedAt = new Date().toISOString()
    const stored = buildSignedRecord({
        version: LICENSE_STORE_VERSION,
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy,
        serverFingerprint: device.fingerprint,
        licenseId: validation.licenseId || initialValidation.licenseId,
        machineId: machine.id,
        licenseStatus: validation.licenseStatus || 'active',
        expiresAt: validation.expiresAt || null,
        secret: encryptLicenseKey(licenseKey, device.fingerprint),
        activatedAt,
        lastValidatedAt: activatedAt,
        lastObservedAt: activatedAt
    }, device.fingerprint)
    writeStoredLicense(stored)
    await resolveLicenseNotifications()

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
        lastValidatedAt: activatedAt,
        checkedAt: activatedAt,
        usingCache: false
    }
}

export const checkOnlineLicense = async () => {
    const stored = readStoredLicense()
    const config = requireOnlineLicenseConfig(getDefaultConfig())
    const preferredStrategy = stored && stored.fingerprintStrategy
        ? stored.fingerprintStrategy
        : null
    const device = await getDeviceFingerprint(preferredStrategy)

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
    if (stored.version !== 1 && stored.fingerprint !== device.fingerprint) {
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

    const storageFingerprint = stored.fingerprint
    const licenseKey = decryptLicenseKey(stored.secret, storageFingerprint)
    const effectiveStored = migrateLegacyStoredLicense({stored, config, licenseKey, device})
    const params = {
        config,
        licenseKey,
        fingerprint: getServerFingerprint(effectiveStored),
        machineId: effectiveStored.machineId
    }
    let validation
    try {
        validation = await validateLicenseKey(params)
    } catch (error) {
        if (isGraceEligibleError(error)) {
            return createCachedLicenseResult({stored: effectiveStored, config, device})
        }
        throw error
    }

    const blocked = getBlockedValidation(validation)
    if (blocked) {
        return {
            ...blocked,
            licensed: false,
            config: publicConfig(config),
            fingerprint: device.fingerprint,
            fingerprintStrategy: device.strategy,
            licenseId: validation.licenseId || effectiveStored.licenseId,
            machineId: effectiveStored.machineId,
            licenseStatus: validation.licenseStatus,
            expiresAt: validation.expiresAt,
            checkedAt: new Date().toISOString()
        }
    }

    if (!validation.valid) {
        return {
            licensed: false,
            status: 'invalid',
            code: validation.code || 'LICENSE_INVALID',
            message: validation.detail || 'This license is not valid for this device',
            config: publicConfig(config),
            fingerprint: device.fingerprint,
            fingerprintStrategy: device.strategy,
            licenseId: effectiveStored.licenseId,
            machineId: effectiveStored.machineId,
            checkedAt: new Date().toISOString()
        }
    }

    const updated = await persistSuccessfulValidation({
        stored: effectiveStored,
        config,
        device,
        validation
    })

    return {
        licensed: true,
        status: 'valid',
        config: publicConfig(config),
        fingerprint: device.fingerprint,
        fingerprintStrategy: device.strategy,
        licenseId: updated.licenseId,
        machineId: updated.machineId,
        licenseStatus: updated.licenseStatus,
        expiresAt: updated.expiresAt,
        lastValidatedAt: updated.lastValidatedAt,
        checkedAt: updated.lastValidatedAt,
        usingCache: false
    }
}

export const getOnlineLicenseSetup = async () => {
    const stored = readStoredLicense()
    const config = normalizeOnlineLicenseConfig(getDefaultConfig())
    const preferredStrategy = stored && stored.fingerprintStrategy
        ? stored.fingerprintStrategy
        : null
    const device = await getDeviceFingerprint(preferredStrategy)
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
