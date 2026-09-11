import fs from 'fs'
import path from 'path'
import PizZip from 'pizzip'

const str = value => value === null || value === undefined ? '' : String(value).trim()

const measure = (value, unit = '') => ({
    value: value === null || value === undefined || Number.isNaN(value) ? '' : String(value),
    unit,
})

const readJsonEntry = (zip, fileName) => {
    const entry = zip.file(fileName)
    if (!entry) throw new Error(`CPXpert archive is missing ${fileName}`)
    try {
        return JSON.parse(entry.asText().replace(/^\uFEFF/, ''))
    } catch (error) {
        throw new Error(`Invalid JSON in ${fileName}: ${error.message}`)
    }
}

const tapName = (coreNumber, tapNumber) => `${coreNumber || 1}S${tapNumber}`

const firstResult = measurement => {
    const results = Array.isArray(measurement && measurement.results) ? measurement.results : []
    return results[0] || {}
}

const normalizeAssessment = value => {
    const text = str(value).toLowerCase()
    if (text === 'pass' || text === 'passed') return 'Pass'
    if (text === 'fail' || text === 'failed') return 'Fail'
    return ''
}

const normalizeCtAsset = raw => {
    const assetId = str(raw.assetid)
    const manufacturingYear = Number(raw.manufacturingyear) > 0
        ? String(raw.manufacturingyear)
        : ''
    const rawFields = {
        SerialNumber: measure(assetId),
        ApparatusId: measure(assetId),
        AssetSystemCode: measure(assetId),
        AssetType: measure('inductive'),
        Manufacturer: measure(''),
        ManufacturerType: measure(''),
        ManufacturingYear: measure(manufacturingYear),
        Phase: measure(raw.phase),
        NumberOfPhases: measure(raw.numberofphases),
        RatedFrequency: measure(raw.frequencyrated, 'Hz'),
        Standard: measure(raw.standard),
        Comment: measure('Imported from CPXpert'),
    }

    return {
        exportId: str(raw.id),
        type: 'CurrentTransformer',
        tag: str(raw.$type),
        serialNumber: assetId,
        manufacturer: '',
        manufacturerType: '',
        manufacturingYear,
        apparatusId: assetId,
        assetSystemCode: assetId,
        phase: str(raw.phase),
        comment: 'Imported from CPXpert',
        locationId: '',
        isGlobalAsset: true,
        raw: rawFields,
        components: [],
    }
}

const normalizeTransformerAsset = raw => {
    const serialNumber = str(raw.serialnumber)
    const manufacturingYear = Number(raw.manufacturingyear) > 0
        ? String(raw.manufacturingyear)
        : ''
    const windings = (Array.isArray(raw.windings) ? raw.windings : []).map((winding, index) => {
        const tapChanger = winding.detctapchanger || winding.oltctapchanger || null
        return {
            number: Number(winding.listindex) + 1 || index + 1,
            name: str(winding.name),
            accessibility: str(winding.accessibility),
            conductorMaterial: str(winding.conductormaterial),
            configuration: str(winding.configuration),
            phaseShift: str(winding.phaseshift),
            phases: str(winding.phases),
            voltageRated: measure(winding.voltagerated, 'V'),
            powerRatings: (Array.isArray(winding.powerratings) ? winding.powerratings : []).map(rating => ({
                listIndex: Number(rating.listindex) || 0,
                coolingClass: str(rating.coolingclass),
                currentRated: measure(rating.currentrated, 'A'),
                powerRated: measure(rating.powerrated, 'VA'),
            })),
            terminalNames: (Array.isArray(winding.terminals) ? winding.terminals : [])
                .map(terminal => str(terminal.name))
                .filter(Boolean),
            tapChanger: tapChanger ? {
                type: str(tapChanger.type),
                tapScheme: str(tapChanger.tapscheme),
                taps: (Array.isArray(tapChanger.tapentries) ? tapChanger.tapentries : []).map(tap => ({
                    listIndex: Number(tap.listindex) || 0,
                    name: str(tap.name),
                    voltageRated: measure(tap.voltagerated, 'V'),
                })),
            } : null,
        }
    })

    const rawFields = {
        SerialNumber: measure(serialNumber),
        ApparatusId: measure(serialNumber),
        ManufacturingYear: measure(manufacturingYear),
        Phase: measure(raw.phase),
        NumberOfPhases: measure(raw.numberofphases),
        RatedFrequency: measure(raw.frequencyrated, 'Hz'),
        VectorGroup: measure(raw.vectorgroup),
        InsulationMedium: measure(raw.insulationmedium),
        TankType: measure(raw.tanktype),
        Comment: measure('Imported from CPXpert'),
    }

    return {
        exportId: str(raw.id),
        type: 'Transformer',
        tag: str(raw.$type),
        serialNumber,
        manufacturer: '',
        manufacturerType: '',
        manufacturingYear,
        apparatusId: serialNumber,
        assetSystemCode: '',
        phase: str(raw.phase),
        comment: 'Imported from CPXpert',
        locationId: '',
        isGlobalAsset: true,
        raw: rawFields,
        transformerProfile: {
            numberOfPhases: str(raw.numberofphases),
            isAutotransformer: !!raw.isautotransformer,
            frequencyRated: measure(raw.frequencyrated, 'Hz'),
            vectorGroup: str(raw.vectorgroup),
            insulationMedium: str(raw.insulationmedium),
            tankType: str(raw.tanktype),
            usedCoolingClass: str(raw.usedcoolingclass),
            windings,
        },
        components: [],
    }
}

const buildCtConfigurationSource = rawAsset => {
    const cores = Array.isArray(rawAsset && rawAsset.cores) ? rawAsset.cores : []
    const measurements = []

    cores.forEach((core, coreIndex) => {
        const coreNumber = core.number || coreIndex + 1
        const winding = core.secondarywinding || {}
        const combinations = Array.isArray(winding.tapcombinations) ? winding.tapcombinations : []
        combinations.forEach(combination => {
            const type = str(combination.type).toLowerCase()
            measurements.push({
                coreNumber: String(coreNumber),
                firstTapName: tapName(coreNumber, combination.fromtap),
                secondTapName: tapName(coreNumber, combination.totap),
                nominalPrimaryCurrent: measure(combination.ratedcurrent, 'A'),
                nominalSecondaryCurrent: measure(winding.ratedcurrent, 'A'),
                isFull: type === 'full',
                isMain: type === 'full' || type === 'main',
                inUse: !!combination.inuse,
                points: [],
            })
        })
    })

    return { cores: String(cores.length), measurements }
}

const normalizeRatioTest = raw => ({
    exportId: str(raw.id),
    type: 'CTRatioVoltageTest',
    tag: str(raw.$type),
    name: 'CT ratio',
    assetId: str(raw.assetid),
    parentTestId: '',
    executionDate: str(raw.startdate),
    assessment: normalizeAssessment(raw.assessment),
    resultState: str(raw.state),
    testIndex: '',
    measurements: (raw.measurements || []).map(measurement => {
        const result = firstResult(measurement)
        const coreNumber = measurement.corenumber || 1
        return {
            coreNumber: String(coreNumber),
            firstTapName: tapName(coreNumber, measurement.fromtap),
            secondTapName: tapName(coreNumber, measurement.totap),
            phase: str(measurement.phase),
            ratio: measure(result.ratio),
            polarity: str(result.polarity),
            assessment: normalizeAssessment(measurement.assessment),
            measuredDate: str(measurement.measureddate),
        }
    }),
})

const normalizeWindingResistanceTest = raw => ({
    exportId: str(raw.id),
    type: 'CTWindingResistanceTest',
    tag: str(raw.$type),
    name: 'CT Winding resistance',
    assetId: str(raw.assetid),
    parentTestId: '',
    executionDate: str(raw.startdate),
    assessment: normalizeAssessment(raw.assessment),
    resultState: str(raw.state),
    testIndex: '',
    conditions: {
        windingTemperature: measure(raw.condition && raw.condition.temperature, 'C'),
        referenceTemperature: measure(raw.temperaturereference, 'C'),
        ambientTemperature: measure(raw.condition && raw.condition.temperature, 'C'),
        weather: str(raw.environmentalcondition && raw.environmentalcondition.weather),
    },
    measurements: (raw.measurements || []).map(measurement => {
        const result = firstResult(measurement)
        const coreNumber = measurement.corenumber || 1
        return {
            coreNumber: String(coreNumber),
            firstTapName: tapName(coreNumber, measurement.fromtap),
            secondTapName: tapName(coreNumber, measurement.totap),
            phase: str(measurement.phase),
            resistance: measure(result.resistance, 'Ω'),
            resistanceCorrected: measure(result.resistancecorrected, 'Ω'),
            assessment: normalizeAssessment(measurement.assessment),
            measuredDate: str(measurement.measureddate),
        }
    }),
})

const normalizeTransformerRatioTest = raw => {
    const measurements = []
    const sourceMeasurements = Array.isArray(raw.measurements) ? raw.measurements : []
    sourceMeasurements.forEach(measurement => {
        const results = Array.isArray(measurement.results) ? measurement.results : []
        results.forEach(result => {
            measurements.push({
                tap: measure(result.tap),
                phase: str(result.prefix || result.phase),
                voltagePrimary: measure(result.voltageprim, 'V'),
                voltageSecondary: measure(result.voltagesec, 'V'),
                nominalRatio: measure(result.voltagerationominal),
                measuredRatio: measure(result.voltageratiomeasured),
                ratioDeviation: measure(result.ratiodeviation, '%'),
                assessment: normalizeAssessment(result.assessment || measurement.assessment),
                measuredDate: str(measurement.measureddate || result.capturedate),
            })
        })
    })

    return {
        exportId: str(raw.id),
        type: 'TransformerRatioTest',
        tag: str(raw.$type),
        name: str(raw.name) || 'Ratio Prim/Sec',
        assetId: str(raw.assetid),
        parentTestId: '',
        executionDate: str(raw.startdate),
        assessment: normalizeAssessment(raw.assessment),
        resultState: str(raw.state),
        testIndex: '',
        windingInjected: str(raw.windinginjected),
        windingMeasured: str(raw.windingmeasured),
        measurements,
    }
}

const normalizeTransformerWindingResistanceTest = raw => {
    const winding = Number(raw.windingundertest) || 1
    const measurements = []
    const sourceMeasurements = Array.isArray(raw.measurements) ? raw.measurements : []
    sourceMeasurements.forEach(measurement => {
        const results = Array.isArray(measurement.results) ? measurement.results : []
        results.forEach(result => {
            measurements.push({
                tap: measure(result.tap),
                phase: str(result.phase),
                resistanceMeasured: measure(result.resistancemeasured, 'Ω'),
                resistanceCorrected: measure(result.resistancecorrected, 'Ω'),
                assessment: normalizeAssessment(result.assessment || measurement.assessment),
                measuredDate: str(result.capturedate || measurement.measureddate),
            })
        })
    })

    return {
        exportId: str(raw.id),
        type: `TransformerWindingResistance${winding}Test`,
        tag: str(raw.$type),
        name: str(raw.name) || `DC Winding resistance ${winding}`,
        assetId: str(raw.assetid),
        parentTestId: '',
        executionDate: str(raw.startdate),
        assessment: normalizeAssessment(raw.assessment),
        resultState: str(raw.state),
        testIndex: '',
        windingUnderTest: String(winding),
        conditions: {
            windingTemperature: measure(raw.transformercondition && raw.transformercondition.temperaturewinding, 'C'),
            referenceTemperature: measure(raw.temperaturereference, 'C'),
        },
        measurements,
    }
}

const TEST_READERS = {
    'CTRatioVoltage.CTRatioVoltageTest': normalizeRatioTest,
    'CTWindingResistance.CTWindingResistanceTest': normalizeWindingResistanceTest,
    'TRRatio.TRRatioTest': normalizeTransformerRatioTest,
    'DCWindingResistance.DCWindingResistanceTest': normalizeTransformerWindingResistanceTest,
}

const earliestDate = tests => tests
    .map(test => str(test.executionDate))
    .filter(Boolean)
    .sort()[0] || ''

/** Read a CPXpert ZIP/JSON project and normalize it to the existing PTM import model. */
export const readCpxpertArchive = filePath => {
    if (!filePath || !fs.existsSync(filePath)) throw new Error('CPXpert file does not exist')

    let zip
    try {
        zip = new PizZip(fs.readFileSync(filePath))
    } catch (error) {
        throw new Error(`Could not open CPXpert archive: ${error.message}`)
    }

    const project = readJsonEntry(zip, 'Project.json')
    const metadata = readJsonEntry(zip, 'Metadata.json')
    if (str(metadata.client).toLowerCase() !== 'cpxpert') {
        throw new Error('The selected file is not a CPXpert project')
    }

    const projectFiles = Array.isArray(project.files) ? project.files : []
    const assetRef = projectFiles.find(file => file.filekind === 'Asset')
    const jobRef = projectFiles.find(file => file.filekind === 'Job')
    if (!assetRef) throw new Error('CPXpert project does not contain an asset profile')
    if (!jobRef) throw new Error('CPXpert project does not contain a job')

    const rawAsset = readJsonEntry(zip, assetRef.fileref)
    const assetKind = str(rawAsset.kind).toLowerCase()
    if (assetKind !== 'currenttransformer' && assetKind !== 'transformer') {
        throw new Error(`CPXpert asset type "${rawAsset.kind || rawAsset.$type || 'unknown'}" is not supported yet`)
    }
    const rawJob = readJsonEntry(zip, jobRef.fileref)
    const tests = []
    const unsupportedTests = []

    projectFiles.filter(file => file.filekind === 'Test').forEach(file => {
        const rawTest = readJsonEntry(zip, file.fileref)
        const reader = TEST_READERS[file.type]
        if (reader) tests.push(reader(rawTest))
        else unsupportedTests.push({
            type: file.type,
            name: str(rawTest.testkind) || file.type,
        })
    })

    const asset = assetKind === 'transformer'
        ? normalizeTransformerAsset(rawAsset)
        : normalizeCtAsset(rawAsset)
    const date = earliestDate(tests)
    const jobName = path.basename(filePath, path.extname(filePath))

    return {
        source: 'cpxpert',
        sourceLabel: 'CPXpert',
        meta: {
            client: str(metadata.client),
            clientVersion: str(metadata.clientversion),
            cdmVersion: str(metadata.cdmversion),
        },
        job: {
            exportId: str(rawJob.id),
            name: jobName || 'Imported CPXpert job',
            status: '',
            creationDate: date,
            executionDate: date,
            approvalDate: '',
            tester: str(rawJob.testername),
            approvedBy: '',
            workOrder: '',
            comment: 'Imported from CPXpert',
            assetId: asset.exportId,
            jobAssetId: asset.exportId,
            locationId: '',
            conditions: {
                weather: str(rawJob.weather),
                unitLocation: str(rawJob.unitlocation),
            },
        },
        assets: [asset],
        substations: [],
        tests,
        unsupportedTests,
        ctConfigurationSource: buildCtConfigurationSource(rawAsset),
    }
}

export default { readCpxpertArchive }
