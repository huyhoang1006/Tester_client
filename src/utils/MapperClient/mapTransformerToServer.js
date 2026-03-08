export const mapTransformerEntityToServer = (entity) => {
    if (!entity) return null;

    const asset = entity.asset || {};
    const assetPsr = entity.assetPsr || {};
    const oldPowerTransformerInfo = entity.oldPowerTransformerInfo || {};
    const productAssetModel = entity.productAssetModel || {};
    const windingConfig = entity.winding_configuration || {};
    const ratings = entity.ratings || {};
    const impedances = entity.impedances || {};
    const tapChangers = entity.tap_changers || {};

    const serverData = {
        mRID: asset.mrid || null,
        name: asset.name || asset.apparatus_id || '',
        aliasName: asset.alias_name || '',
        description: asset.description || '',
        psrType: null,
        assetDatasheet: null,
        location: null,

        assetInfo: {
            mRID: oldPowerTransformerInfo.mrid || null,
            serialNo: asset.serial_number || '',
            apparatusId: asset.name || asset.apparatus_id || '',
            manufacturerName: asset.manufacturer || '',
            manufacturingYear: parseInt(asset.manufacturer_year) || null,
            countryName: asset.country_of_origin || '',
            description: asset.description || '',
            productAssetModel: productAssetModel.mrid ? {
                mRID: productAssetModel.mrid || null,
                modelNumber: productAssetModel.model_number || '',
                manufacturer: {
                    mRID: productAssetModel.manufacturer ? productAssetModel.manufacturer.mrid : null,
                    name: productAssetModel.manufacturer ? productAssetModel.manufacturer.name : ''
                }
            } : null
        },

        transformer: {
            id: assetPsr.psr_id || null,
            assetType: asset.type || 'AUTO',
            phases: windingConfig.phases || 'THREE',
            vectorGroup: windingConfig.vector_group || '',
            ratedFrequency: ratings.others?.frequency?.value || 50,
            ratedFrequencyUnit: ratings.others?.frequency?.unit || 'Hz',
            maxShortCircuitCurrent: ratings.others?.max_short_circuit_current?.value || null,
            maxShortCircuitCurrentUnit: ratings.others?.max_short_circuit_current?.unit || 'kA',
            duration: ratings.others?.short_circuit_duration?.value || null,
            durationUnit: ratings.others?.short_circuit_duration?.unit || 's',
            basePower: ratings.power?.[0]?.value || null,
            basePowerUnit: ratings.power?.[0]?.unit || 'MVA'
        },

        voltageRatings: [],

        powerRatings: [],

        shortCircuitImpedances: [],

        tapChanger: null,

        tapChangerVoltage: []
    };

    const windingTypes = ['prim', 'sec', 'tert'];
    for (const windingType of windingTypes) {
        const voltageData = ratings.voltage?.[windingType];
        if (voltageData) {
            serverData.voltageRatings.push({
                mRID: null,
                winding: windingType.toUpperCase(),
                voltageLL: null,
                voltageLLUnit: null,
                voltageLN: null,
                voltageLNUnit: null,
                insulLevelLL: voltageData.value || null,
                insulLevelLLUnit: voltageData.unit || 'kV',
                insulationClass: 'A',
                regulation: null
            });
        }
    }

    if (ratings.power && ratings.power.length > 0) {
        serverData.powerRatings = ratings.power.map(p => ({
            mRID: null,
            ratedPower: parseFloat(p.value) || null,
            ratedPowerUnit: p.unit || 'MVA',
            coolingClass: p.cooling_type || 'ONAN',
            tempRiseWind: null,
            currentRatingPrim: null,
            currentRatingPrimUnit: null,
            currentRatingSec: null,
            currentRatingSecUnit: null
        }));
    }

    const impTypes = ['prim_sec', 'prim_tert', 'sec_tert'];
    const impTypeMap = { 'prim_sec': 'PRIM_SEC', 'prim_tert': 'PRIM_TERT', 'sec_tert': 'SEC_TERT' };

    for (const impType of impTypes) {
        const impList = impedances[impType] || [];
        for (const imp of impList) {
            serverData.shortCircuitImpedances.push({
                mRID: imp.mrid || null,
                impedance: parseFloat(imp.short_circuit_impedances_uk?.value) || null,
                impedanceUnit: imp.short_circuit_impedances_uk?.unit || 'PERCENT',
                basePower: parseFloat(imp.base_power?.value) || null,
                basePowerUnit: imp.base_power?.unit || 'MVA',
                baseVoltage: parseFloat(imp.base_voltage?.value) || null,
                baseVoltageUnit: imp.base_voltage?.unit || 'kV',
                loadLoss: parseFloat(imp.load_losses_pk?.value) || null,
                loadLossUnit: imp.load_losses_pk?.unit || 'kW',
                type: impTypeMap[impType]
            });
        }
    }

    if (tapChangers && tapChangers.type) {
        serverData.tapChanger = {
            id: tapChangers.mrid || null,
            type: tapChangers.type || 'OLTC',
            serialNo: tapChangers.serial_no || '',
            manufacturerId: tapChangers.manufacturer_id || null,
            winding: tapChangers.winding || 'PRIM',
            tabScheme: tapChangers.tab_scheme || 'ONE_TO_THIRTYTHREE'
        };

        if (tapChangers.voltage_table && tapChangers.voltage_table.length > 0) {
            serverData.tapChangerVoltage = tapChangers.voltage_table.map((t, index) => ({
                mRID: t.mrid || null,
                tap: t.step || (index + 1),
                voltage: parseFloat(t.voltage?.value) || null,
                voltageUnit: t.voltage?.unit || 'V'
            }));
        }
    }

    return serverData;
};
