'use strict'


import ExcelJS from 'exceljs'


export const readExcel3pha1cap = async (file_Path) => {
    var workbook = new ExcelJS.Workbook();
    var data = {
        Asset: {
            other_category: '',
            rated_power: "",
            phase: '',
            rated_frequency: '',
            vector_group: "",
            insulation_medium: "",
            cooling_class: "",
            insulation_class: "",
            mode: "detc",
            NumOfTap: "",
            serial_no: '',
            rate_voltage_LL_prim: "",
            current_ratings_prim: "",
            rate_voltage_LL_sec: "",
            current_ratings_sec: "",
            voltage_regulation_prim: ""
        },
        Job: {
            name: "",
            test_date: "",
            ambient_condition: "",
            testing_method: "",
            standard: "",
            tested_by: "",
            approved_by: ""
        },
        Test: {
            general_ins: "",
            Insulation_Resistance: {
                measure: '',
                table: [
                    {
                        measured_position: "",
                        r15s: "",
                        r60s: "",
                        kht: "",
                        assessment: ""
                    },
                    {
                        measured_position: "",
                        r15s: "",
                        r60s: "",
                        kht: "",
                        assessment: ""
                    },
                    {
                        measured_position: "",
                        r15s: "",
                        r60s: "",
                        kht: "",
                        assessment: ""
                    }
                ]
            },
            ratio_prim_sec: {
                table: [
                    {
                        tap: 1,
                        phase: "AB/ab",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 1,
                        phase: "BC/bc",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 1,
                        phase: "AC/ca",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 2,
                        phase: "AB/ab",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 2,
                        phase: "BC/bc",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 2,
                        phase: "AC/ac",
                        hv1: "34",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 3,
                        phase: "AB/ab",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 3,
                        phase: "BC/bc",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 3,
                        phase: "AC/ac",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 4,
                        phase: "AB/ab",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 4,
                        phase: "BC/bc",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 4,
                        phase: "AC/ac",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 5,
                        phase: "AB/ab",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 5,
                        phase: "BC/bc",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    },
                    {
                        tap: 5,
                        phase: "AC/ac",
                        hv1: "",
                        lv: "",
                        nominal_ratio: "",
                        v_ratio: "",
                        ratio_dev: "",
                        assessment: ""
                    }
                ]
            },
            winding_resistance_prim: {
                winding_temperature: "",
                measurement_of_winding: "",
                table: [
                    {
                        voltage_table_id: "Pokq1j",
                        tap: 1,
                        phase: "AB",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "Pokq1j",
                        tap: 1,
                        phase: "BC",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "Pokq1j",
                        tap: 1,
                        phase: "CA",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "UccQ16",
                        tap: 2,
                        phase: "AB",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "UccQ16",
                        tap: 2,
                        phase: "BC",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "UccQ16",
                        tap: 2,
                        phase: "CA",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    }, {
                        voltage_table_id: "JnZR1B",
                        tap: 3,
                        phase: "AB",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "JnZR1B",
                        tap: 3,
                        phase: "BC",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "JnZR1B",
                        tap: 3,
                        phase: "CA",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "9WKMtq",
                        tap: 4,
                        phase: "AB",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "9WKMtq",
                        tap: 4,
                        phase: "BC",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "9WKMtq",
                        tap: 4,
                        phase: "CA",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "qBnolI",
                        tap: 5,
                        phase: "AB",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "qBnolI",
                        tap: 5,
                        phase: "BC",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        voltage_table_id: "qBnolI",
                        tap: 5,
                        phase: "CA",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                ]
            },
            winding_resistance_sec: {
                winding_temperature: "",
                measurement_of_winding: "",
                table: [
                    {
                        tap: "",
                        phase: "AB",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        tap: "",
                        phase: "BC",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    },
                    {
                        tap: "",
                        phase: "AC",
                        r_meas: "",
                        r_corr: "",
                        error_between_phase: "",
                        mean_value: "",
                        assessment: ""
                    }
                ]
            },
            MeasurementOfNoLoad: {
                no_load_loss: {
                    result: "",
                    standard: "",
                    assessment: ""
                },
                no_load_current: {
                    result: "",
                    standard: "",
                    assessment: ""
                }
            },
            MeasurementOfShortCircuit: {
                load_loss: {
                    result: "",
                    standard: "",
                    assessment: ""
                },
                short_circuit_impedance: {
                    result: "",
                    standard: "",
                    assessment: ""
                }
            },
            EnergyEfficiency: {
                hv1: {
                    e50: "",
                    standard: "",
                    assessment: ""
                },
                hv2: {
                    e50: "",
                    standard: "",
                    assessment: ""
                }
            },
            InducedAcVoltageTests: {
                dataList: [
                    {
                        terminal: "",
                        ratedVoltage: "",
                        Lv: {
                            terminal: "",
                            testedVoltage: ""
                        },
                        Hv: {
                            terminal: "",
                            testedVoltage: ""
                        },
                        assessment: ""
                    }
                ]
            },
            MeasurementOfOil: {
                table: {
                    type_oil: "",
                    elecGap: "",
                    assessment: ""
                }
            },
            DimensionWeight: {
                table: {
                    dimension: {
                        a: "",
                        b: "",
                        c: "",
                        n: ""
                    },
                    weight: {
                        oil: "",
                        active: "",
                        total: ""
                    }
                }
            },
            SeparateSourceAc: {
                hv: {
                    test_voltage: "",
                    assessment: ""
                },
                lv: {
                    test_voltage: "",
                    assessment: ""
                }
            },
            TestingInstruments: {
                dataList: [
                    { no: "", testingInstrument: "", type_ins: "" },
                    { no: "", testingInstrument: "", type_ins: "" },
                    { no: "", testingInstrument: "", type_ins: "" },
                    { no: "", testingInstrument: "", type_ins: "" },
                    { no: "", testingInstrument: "", type_ins: "" },
                    { no: "", testingInstrument: "", type_ins: "" }
                ]
            }

        }
    }
    await workbook.xlsx.readFile(file_Path)
    const worksheets = workbook.worksheets
    let wsName = ''
    const wsTarget = 'BBTN'
    worksheets.forEach(worksheet => {
        if (worksheet.name.trim() === wsTarget || worksheet.name.trim().includes(wsTarget)) {
            wsName = worksheet.name
        }
    });
    const worksheet = workbook.getWorksheet(wsName);
    data.Asset.other_category = worksheet.getCell('H14').text
    data.Asset.rated_power = worksheet.getCell('K15').text
    data.Asset.phase = worksheet.getCell('K16').text
    data.Asset.rated_frequency = worksheet.getCell('K17').text
    data.Asset.vector_group = worksheet.getCell('K18').text
    data.Asset.insulation_medium = worksheet.getCell('K19').text
    data.Asset.cooling_class = worksheet.getCell('K20').text
    data.Asset.insulation_class = worksheet.getCell('K21').text
    data.Asset.NumOfTap = worksheet.getCell('K22').text
    data.Asset.serial_no = worksheet.getCell('Z15').text
    data.Asset.rate_voltage_LL_prim = worksheet.getCell('Z16').text
    data.Asset.current_ratings_prim = worksheet.getCell('Z17').text
    data.Asset.rate_voltage_LL_sec = worksheet.getCell('Z18').text
    data.Asset.current_ratings_sec = worksheet.getCell('Z19').text
    data.Asset.voltage_regulation_prim = worksheet.getCell('Z20').text

    data.Job.test_date = worksheet.getCell('K24').text
    data.Job.ambient_condition = worksheet.getCell('N26').text
    data.Job.testing_method = worksheet.getCell('M38').text
    data.Job.standard = worksheet.getCell('M39').text
    data.Job.tested_by = worksheet.getCell('E52').text
    data.Job.approved_by = worksheet.getCell('S52').text
    data.Job.name = worksheet.getCell('N10').text

    //General inspection
    data.Test.general_ins = worksheet.getCell('B54').text

    //Insulation_Resistance
    data.Test.Insulation_Resistance.measure = worksheet.getCell('C56').text
    data.Test.Insulation_Resistance.table[0].measured_position = worksheet.getCell('E59').text
    data.Test.Insulation_Resistance.table[1].measured_position = worksheet.getCell('E60').text
    data.Test.Insulation_Resistance.table[2].measured_position = worksheet.getCell('E61').text
    data.Test.Insulation_Resistance.table[0].r15s = worksheet.getCell('R59').text
    data.Test.Insulation_Resistance.table[1].r15s = worksheet.getCell('R60').text
    data.Test.Insulation_Resistance.table[2].r15s = worksheet.getCell('R61').text
    data.Test.Insulation_Resistance.table[0].r60s = worksheet.getCell('V59').text
    data.Test.Insulation_Resistance.table[1].r60s = worksheet.getCell('V60').text
    data.Test.Insulation_Resistance.table[2].r60s = worksheet.getCell('V61').text
    data.Test.Insulation_Resistance.table[0].kht = worksheet.getCell('Z59').text
    data.Test.Insulation_Resistance.table[1].kht = worksheet.getCell('Z60').text
    data.Test.Insulation_Resistance.table[2].kht = worksheet.getCell('Z61').text

    //ratio prim/sec
    data.Test.ratio_prim_sec.table[0].hv1 = worksheet.getCell('F68').text
    data.Test.ratio_prim_sec.table[1].hv1 = worksheet.getCell('F68').text
    data.Test.ratio_prim_sec.table[2].hv1 = worksheet.getCell('F68').text
    data.Test.ratio_prim_sec.table[3].hv1 = worksheet.getCell('F69').text
    data.Test.ratio_prim_sec.table[4].hv1 = worksheet.getCell('F69').text
    data.Test.ratio_prim_sec.table[5].hv1 = worksheet.getCell('F69').text
    data.Test.ratio_prim_sec.table[6].hv1 = worksheet.getCell('F70').text
    data.Test.ratio_prim_sec.table[7].hv1 = worksheet.getCell('F70').text
    data.Test.ratio_prim_sec.table[8].hv1 = worksheet.getCell('F70').text
    data.Test.ratio_prim_sec.table[9].hv1 = worksheet.getCell('F71').text
    data.Test.ratio_prim_sec.table[10].hv1 = worksheet.getCell('F71').text
    data.Test.ratio_prim_sec.table[11].hv1 = worksheet.getCell('F71').text
    data.Test.ratio_prim_sec.table[12].hv1 = worksheet.getCell('F72').text
    data.Test.ratio_prim_sec.table[13].hv1 = worksheet.getCell('F72').text
    data.Test.ratio_prim_sec.table[14].hv1 = worksheet.getCell('F72').text

    data.Test.ratio_prim_sec.table[0].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[1].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[2].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[3].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[4].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[5].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[6].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[7].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[8].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[9].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[10].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[11].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[12].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[13].lv = worksheet.getCell('J70').text
    data.Test.ratio_prim_sec.table[14].lv = worksheet.getCell('J70').text

    data.Test.ratio_prim_sec.table[0].nominal_ratio = worksheet.getCell('N68').text
    data.Test.ratio_prim_sec.table[1].nominal_ratio = worksheet.getCell('N68').text
    data.Test.ratio_prim_sec.table[2].nominal_ratio = worksheet.getCell('N68').text
    data.Test.ratio_prim_sec.table[3].nominal_ratio = worksheet.getCell('N69').text
    data.Test.ratio_prim_sec.table[4].nominal_ratio = worksheet.getCell('N69').text
    data.Test.ratio_prim_sec.table[5].nominal_ratio = worksheet.getCell('N69').text
    data.Test.ratio_prim_sec.table[6].nominal_ratio = worksheet.getCell('N70').text
    data.Test.ratio_prim_sec.table[7].nominal_ratio = worksheet.getCell('N70').text
    data.Test.ratio_prim_sec.table[8].nominal_ratio = worksheet.getCell('N70').text
    data.Test.ratio_prim_sec.table[9].nominal_ratio = worksheet.getCell('N71').text
    data.Test.ratio_prim_sec.table[10].nominal_ratio = worksheet.getCell('N71').text
    data.Test.ratio_prim_sec.table[11].nominal_ratio = worksheet.getCell('N71').text
    data.Test.ratio_prim_sec.table[12].nominal_ratio = worksheet.getCell('N72').text
    data.Test.ratio_prim_sec.table[13].nominal_ratio = worksheet.getCell('N72').text
    data.Test.ratio_prim_sec.table[14].nominal_ratio = worksheet.getCell('N72').text

    data.Test.ratio_prim_sec.table[0].ratio_dev = worksheet.getCell('R68').text
    data.Test.ratio_prim_sec.table[1].ratio_dev = worksheet.getCell('V68').text
    data.Test.ratio_prim_sec.table[2].ratio_dev = worksheet.getCell('Z68').text
    data.Test.ratio_prim_sec.table[3].ratio_dev = worksheet.getCell('R69').text
    data.Test.ratio_prim_sec.table[4].ratio_dev = worksheet.getCell('V69').text
    data.Test.ratio_prim_sec.table[5].ratio_dev = worksheet.getCell('Z69').text
    data.Test.ratio_prim_sec.table[6].ratio_dev = worksheet.getCell('R70').text
    data.Test.ratio_prim_sec.table[7].ratio_dev = worksheet.getCell('V70').text
    data.Test.ratio_prim_sec.table[8].ratio_dev = worksheet.getCell('Z70').text
    data.Test.ratio_prim_sec.table[9].ratio_dev = worksheet.getCell('R71').text
    data.Test.ratio_prim_sec.table[10].ratio_dev = worksheet.getCell('V71').text
    data.Test.ratio_prim_sec.table[11].ratio_dev = worksheet.getCell('Z71').text
    data.Test.ratio_prim_sec.table[12].ratio_dev = worksheet.getCell('R72').text
    data.Test.ratio_prim_sec.table[13].ratio_dev = worksheet.getCell('V72').text
    data.Test.ratio_prim_sec.table[14].ratio_dev = worksheet.getCell('Z72').text

    // winding resistance prim
    data.Test.winding_resistance_prim.winding_temperature = worksheet.getCell('M74').text
    data.Test.winding_resistance_prim.table[0].r_meas = worksheet.getCell('E78').text
    data.Test.winding_resistance_prim.table[1].r_meas = worksheet.getCell('J78').text
    data.Test.winding_resistance_prim.table[2].r_meas = worksheet.getCell('O78').text
    data.Test.winding_resistance_prim.table[3].r_meas = worksheet.getCell('E79').text
    data.Test.winding_resistance_prim.table[4].r_meas = worksheet.getCell('J79').text
    data.Test.winding_resistance_prim.table[5].r_meas = worksheet.getCell('O79').text
    data.Test.winding_resistance_prim.table[6].r_meas = worksheet.getCell('E80').text
    data.Test.winding_resistance_prim.table[7].r_meas = worksheet.getCell('J80').text
    data.Test.winding_resistance_prim.table[8].r_meas = worksheet.getCell('O80').text
    data.Test.winding_resistance_prim.table[9].r_meas = worksheet.getCell('E81').text
    data.Test.winding_resistance_prim.table[10].r_meas = worksheet.getCell('J81').text
    data.Test.winding_resistance_prim.table[11].r_meas = worksheet.getCell('O81').text
    data.Test.winding_resistance_prim.table[12].r_meas = worksheet.getCell('E82').text
    data.Test.winding_resistance_prim.table[13].r_meas = worksheet.getCell('J82').text
    data.Test.winding_resistance_prim.table[14].r_meas = worksheet.getCell('O82').text

    data.Test.winding_resistance_prim.table[0].mean_value = worksheet.getCell('T78').text
    data.Test.winding_resistance_prim.table[3].mean_value = worksheet.getCell('T79').text
    data.Test.winding_resistance_prim.table[6].mean_value = worksheet.getCell('T80').text
    data.Test.winding_resistance_prim.table[9].mean_value = worksheet.getCell('T81').text
    data.Test.winding_resistance_prim.table[12].mean_value = worksheet.getCell('T82').text

    data.Test.winding_resistance_prim.table[0].error_between_phase = worksheet.getCell('Y78').text
    data.Test.winding_resistance_prim.table[3].error_between_phase = worksheet.getCell('Y79').text
    data.Test.winding_resistance_prim.table[6].error_between_phase = worksheet.getCell('Y80').text
    data.Test.winding_resistance_prim.table[9].error_between_phase = worksheet.getCell('Y81').text
    data.Test.winding_resistance_prim.table[12].error_between_phase = worksheet.getCell('Y82').text

    // winding resistance sec
    data.Test.winding_resistance_sec.winding_temperature = data.Test.winding_resistance_prim.winding_temperature
    data.Test.winding_resistance_sec.table[0].r_meas = worksheet.getCell('B87').text
    data.Test.winding_resistance_sec.table[1].r_meas = worksheet.getCell('I87').text
    data.Test.winding_resistance_sec.table[2].r_meas = worksheet.getCell('N87').text
    data.Test.winding_resistance_sec.table[0].mean_value = worksheet.getCell('S87').text
    data.Test.winding_resistance_sec.table[1].mean_value = worksheet.getCell('S87').text
    data.Test.winding_resistance_sec.table[2].mean_value = worksheet.getCell('S87').text
    data.Test.winding_resistance_sec.table[0].error_between_phase = worksheet.getCell('X87').text
    data.Test.winding_resistance_sec.table[1].error_between_phase = worksheet.getCell('X87').text
    data.Test.winding_resistance_sec.table[2].error_between_phase = worksheet.getCell('X87').text

    // Measurement of no-load loss and current
    data.Test.MeasurementOfNoLoad.no_load_loss.result = worksheet.getCell('O92').text
    data.Test.MeasurementOfNoLoad.no_load_loss.standard = worksheet.getCell('T92').text
    data.Test.MeasurementOfNoLoad.no_load_loss.assessment = worksheet.getCell('Y92').text
    data.Test.MeasurementOfNoLoad.no_load_current.result = worksheet.getCell('O93').text
    data.Test.MeasurementOfNoLoad.no_load_current.standard = worksheet.getCell('T93').text
    data.Test.MeasurementOfNoLoad.no_load_current.assessment = worksheet.getCell('Y93').text

    //Measurement of short-circuit impedance and load loss at 75°C
    data.Test.MeasurementOfShortCircuit.load_loss.result = worksheet.getCell('O98').text
    data.Test.MeasurementOfShortCircuit.load_loss.standard = worksheet.getCell('T98').text
    data.Test.MeasurementOfShortCircuit.load_loss.assessment = worksheet.getCell('Y98').text
    data.Test.MeasurementOfShortCircuit.short_circuit_impedance.result = worksheet.getCell('O99').text
    data.Test.MeasurementOfShortCircuit.short_circuit_impedance.standard = worksheet.getCell('T99').text
    data.Test.MeasurementOfShortCircuit.short_circuit_impedance.assessment = worksheet.getCell('Y99').text

    //Energy Efficiency
    data.Test.EnergyEfficiency.hv1.e50 = worksheet.getCell('O103').text
    data.Test.EnergyEfficiency.hv1.standard = worksheet.getCell('T103').text
    data.Test.EnergyEfficiency.hv1.assessment = worksheet.getCell('Y103').text

    // InducedAcVoltageTests
    data.Test.InducedAcVoltageTests.dataList[0].terminal = worksheet.getCell('B116').text
    data.Test.InducedAcVoltageTests.dataList[0].ratedVoltage = worksheet.getCell('F116').text
    data.Test.InducedAcVoltageTests.dataList[0].Lv.terminal = worksheet.getCell('J116').text
    data.Test.InducedAcVoltageTests.dataList[0].Lv.testedVoltage = worksheet.getCell('N116').text
    data.Test.InducedAcVoltageTests.dataList[0].Hv.terminal = worksheet.getCell('R116').text
    data.Test.InducedAcVoltageTests.dataList[0].Hv.testedVoltage = worksheet.getCell('V116').text
    data.Test.InducedAcVoltageTests.dataList[0].assessment = worksheet.getCell('Z116').text

    //Measurement of breakdown voltage of oil
    data.Test.MeasurementOfOil.table.type_oil = worksheet.getCell('B120').text
    data.Test.MeasurementOfOil.table.elecGap = worksheet.getCell('L120').text
    data.Test.MeasurementOfOil.table.assessment = worksheet.getCell('V120').text

    // dimension and weight
    data.Test.DimensionWeight.table.dimension.a = worksheet.getCell('B125').text
    data.Test.DimensionWeight.table.dimension.b = worksheet.getCell('F125').text
    data.Test.DimensionWeight.table.dimension.c = worksheet.getCell('J125').text
    data.Test.DimensionWeight.table.dimension.n = worksheet.getCell('N125').text
    data.Test.DimensionWeight.table.weight.oil = worksheet.getCell('R125').text
    data.Test.DimensionWeight.table.weight.active = worksheet.getCell('V125').text
    data.Test.DimensionWeight.table.weight.total = worksheet.getCell('Z125').text

    //SeparateSourceAc
    data.Test.SeparateSourceAc.hv.test_voltage = worksheet.getCell('M108').text
    data.Test.SeparateSourceAc.hv.assessment = worksheet.getCell('W108').text
    data.Test.SeparateSourceAc.lv.test_voltage = worksheet.getCell('M109').text
    data.Test.SeparateSourceAc.lv.assessment = worksheet.getCell('W109').text

    //TestingInstruments
    data.Test.TestingInstruments.dataList[0].testingInstrument = worksheet.getCell('B128').text
    data.Test.TestingInstruments.dataList[1].testingInstrument = worksheet.getCell('B129').text
    data.Test.TestingInstruments.dataList[2].testingInstrument = worksheet.getCell('B130').text
    data.Test.TestingInstruments.dataList[3].testingInstrument = worksheet.getCell('B131').text
    data.Test.TestingInstruments.dataList[4].testingInstrument = worksheet.getCell('B132').text
    data.Test.TestingInstruments.dataList[5].testingInstrument = worksheet.getCell('B133').text

    data.Test.TestingInstruments.dataList[0].type_ins = worksheet.getCell('T128').text
    data.Test.TestingInstruments.dataList[1].type_ins = worksheet.getCell('T129').text
    data.Test.TestingInstruments.dataList[2].type_ins = worksheet.getCell('T130').text
    data.Test.TestingInstruments.dataList[3].type_ins = worksheet.getCell('T131').text
    data.Test.TestingInstruments.dataList[4].type_ins = worksheet.getCell('T132').text
    data.Test.TestingInstruments.dataList[5].type_ins = worksheet.getCell('T133').text

    return data
}

export const importAsset3pha1cap = async (location_id, data, conection) => {

    const voltage_rating = [{
        winding: "Prim",
        voltage_ll: {
            value: data_split(data.rate_voltage_LL_prim)[0].toString(),
            unit: data_split(data.rate_voltage_LL_prim)[1].toString()
        },
        voltage_ln: {
            value: "",
            unit: "kV"
        },
        insul_level_ll: {
            value: "",
            unit: "kV"
        },
        comment: data.insulation_class
    }, {
        winding: "Sec",
        voltage_ll: {
            value: data_split(data.rate_voltage_LL_sec)[0].toString(),
            unit: data_split(data.rate_voltage_LL_sec)[1].toString()
        },
        voltage_ln: {
            value: "",
            unit: "kV"
        },
        insul_level_ll: {
            value: "",
            unit: "kV"
        },
        comment: data.insulation_class
    }]

    const vector_group = {
        prim: "",
        sec: {
            I: "",
            Value: ""
        },
        tert: {
            I: "",
            Value: "",
            accessibility: ""
        }
    }
    const max_short_circuit_current_ka = {
        value: "",
        unit: "kA"
    }
    const base_power = {
        value: "",
        unit: "MVA"
    }
    const base_voltage = {
        value: "",
        unit: "kV"
    }

    const winding = {
        prim: "Copper",
        sec: "Copper",
        tert: "Copper"
    }

    const power_ratings = [{
        rated_power:
        {
            value: data_split(data.rated_power)[0],
            unit: data_split(data.rated_power)[1]
        },
        cooling_class: data.cooling_class,
        temp_rise_wind: ""
    }]

    const current_ratings = [{
        prim: {
            value: data_split(data.current_ratings_prim)[0],
            unit: data_split(data.current_ratings_prim)[1]
        },
        sec: {
            value: data_split(data.current_ratings_sec)[0],
            unit: data_split(data.current_ratings_sec)[1]
        },
        tert: {
            value: "",
            unit: "A"
        }
    }]
    const voltage_regulation = [{
        winding: "Prim",
        voltage_regulation: data.voltage_regulation_prim
    }]

    return new Promise((resolve, reject) => {
        conection.run('INSERT INTO assets(location_id, asset, asset_type, serial_no, manufacturer, manufacturer_type, manufacturing_year,' +
            'asset_system_code, apparatus_id, feeder, date_of_warehouse_receipt, date_of_delivery, date_of_production_order, comment, ' +
            'phases, vector_group, vector_group_custom, unsupported_vector_group, rated_frequency, voltage_ratings, voltage_regulation, power_ratings, current_ratings,' +
            'max_short_circuit_current_ka, max_short_circuit_current_s, ref_temp, prim_sec, prim_tert, sec_tert, base_power, base_voltage,' +
            'zero_percent, category, status, tank_type, insulation_medium, insulation_weight, insulation_volume, total_weight, winding )' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [location_id,
                "Transformer", "Two-winding", data.serial_no, "", "", "",
                "", "", "", "", "", "", "",
                data.phase, JSON.stringify(vector_group), data.vector_group, "", data_split(data.rated_frequency)[0], JSON.stringify(voltage_rating), JSON.stringify(voltage_regulation), JSON.stringify(power_ratings), JSON.stringify(current_ratings),
                JSON.stringify(max_short_circuit_current_ka), "", "75", "[]", "[]", "[]", JSON.stringify(base_power), JSON.stringify(base_voltage),
                "", data.other_category, "", "", data.insulation_medium, "", "", "", JSON.stringify(winding)
            ], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const importJob3pha1cap = async (asset_id, data, conection) => {
    return new Promise((resolve, reject) => {
        conection.run('INSERT INTO jobs(asset_id, name, work_order, creation_date, execution_date, tested_by, approved_by, approval_date, summary, ambient_condition, testing_method, standard)' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [asset_id,
                data.name, '', data.test_date, '', data.tested_by, data.approved_by, '', data.summary,
                data.ambient_condition, data.testing_method, data.standard
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const importHavecTapChangers = async (asset_id, data, conection) => {
    const tapChanger = {
        mode: 'detc',
        serial_no: '',
        manufacturer: '',
        manufacturer_type: '',
        winding: 'Prim',
        tap_scheme: '1...N',
        no_of_taps: '5',
        voltage_table: [
            { id: "Ov7wiI", tap: 1, voltage: data.table[0].hv1 },
            { id: "lbsmcN", tap: 2, voltage: data.table[3].hv1 },
            { id: "3NLrtf", tap: 3, voltage: data.table[6].hv1 },
            { id: "M9gQLe", tap: 4, voltage: data.table[9].hv1 },
            { id: "RPQJnC", tap: 5, voltage: data.table[12].hv1 }
        ]
    }
    return new Promise((resolve, reject) => {
        conection.run('INSERT INTO tap_changers(asset_id, mode, serial_no, manufacturer, manufacturer_type, winding, tap_scheme, no_of_taps, voltage_table)' +
            'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [asset_id, tapChanger.mode, tapChanger.serial_no, tapChanger.manufacturer, tapChanger.manufacturer_type, tapChanger.winding, tapChanger.tap_scheme, tapChanger.no_of_taps, JSON.stringify(tapChanger.voltage_table)], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}


//General inspection
const insert_general_inspection = async (job_id, data, conection) => {
    const general_ins_value = (arr) => {
        if (arr.includes('Pass')) {
            return 'Pass'
        }
        else {
            return 'Fail'
        }
    }
    const general_ins = {
        general_inspection: general_ins_value(data.general_ins)
    }
    await insert_test('1', 'General inspection', general_ins, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

//Insulation Resistance
const insert_Insulation_Resistance = async (job_id, data, conection) => {
    const Insulation_Resistance = {
        t: ins_resistance_value(data.Insulation_Resistance.measure)[0],
        megohmmeter: ins_resistance_value(data.Insulation_Resistance.measure)[1],
        table: [
            {
                measured_position: data.Insulation_Resistance.table[0].measured_position,
                r15s: data.Insulation_Resistance.table[0].r15s,
                r60s: data.Insulation_Resistance.table[0].r60s,
                kht: data.Insulation_Resistance.table[0].kht,
                assessment: ""
            },
            {
                measured_position: data.Insulation_Resistance.table[1].measured_position,
                r15s: data.Insulation_Resistance.table[1].r15s,
                r60s: data.Insulation_Resistance.table[1].r60s,
                kht: data.Insulation_Resistance.table[1].kht,
                assessment: ""
            },
            {
                measured_position: data.Insulation_Resistance.table[2].measured_position,
                r15s: data.Insulation_Resistance.table[2].r15s,
                r60s: data.Insulation_Resistance.table[2].r60s,
                kht: data.Insulation_Resistance.table[2].kht,
                assessment: ""
            }
        ]
    }

    await insert_test('2', 'Insulation Resistance', Insulation_Resistance, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)

}

//ratio prim/sec
const insert_ratio_prim_sec = async (job_id, data, conection) => {
    const ratio_prim_sec = {
        table: [
            {
                tap: 1,
                phase: "AB/ab",
                hv1: data.ratio_prim_sec.table[0].hv1,
                lv: data.ratio_prim_sec.table[0].lv,
                nominal_ratio: data.ratio_prim_sec.table[0].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[0].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[0].ratio_dev,
                assessment: data.ratio_prim_sec.table[0].assessment
            },
            {
                tap: 1,
                phase: "BC/bc",
                hv1: data.ratio_prim_sec.table[1].hv1,
                lv: data.ratio_prim_sec.table[1].lv,
                nominal_ratio: data.ratio_prim_sec.table[1].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[1].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[1].ratio_dev,
                assessment: data.ratio_prim_sec.table[1].assessment
            },
            {
                tap: 1,
                phase: "AC/ac",
                hv1: data.ratio_prim_sec.table[2].hv1,
                lv: data.ratio_prim_sec.table[2].lv,
                nominal_ratio: data.ratio_prim_sec.table[2].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[3].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[2].ratio_dev,
                assessment: data.ratio_prim_sec.table[2].assessment
            },
            {
                tap: 2,
                phase: "AB/ab",
                hv1: data.ratio_prim_sec.table[3].hv1,
                lv: data.ratio_prim_sec.table[3].lv,
                nominal_ratio: data.ratio_prim_sec.table[3].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[3].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[3].ratio_dev,
                assessment: data.ratio_prim_sec.table[3].assessment
            },
            {
                tap: 2,
                phase: "BC/bc",
                hv1: data.ratio_prim_sec.table[4].hv1,
                lv: data.ratio_prim_sec.table[4].lv,
                nominal_ratio: data.ratio_prim_sec.table[4].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[4].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[4].ratio_dev,
                assessment: data.ratio_prim_sec.table[4].assessment
            },
            {
                tap: 2,
                phase: "AC/ac",
                hv1: data.ratio_prim_sec.table[5].hv1,
                lv: data.ratio_prim_sec.table[5].lv,
                nominal_ratio: data.ratio_prim_sec.table[5].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[5].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[5].ratio_dev,
                assessment: data.ratio_prim_sec.table[5].assessment
            },
            {
                tap: 3,
                phase: "AB/ab",
                hv1: data.ratio_prim_sec.table[6].hv1,
                lv: data.ratio_prim_sec.table[6].lv,
                nominal_ratio: data.ratio_prim_sec.table[6].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[6].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[6].ratio_dev,
                assessment: data.ratio_prim_sec.table[6].assessment
            },
            {
                tap: 3,
                phase: "BC/bc",
                hv1: data.ratio_prim_sec.table[7].hv1,
                lv: data.ratio_prim_sec.table[7].lv,
                nominal_ratio: data.ratio_prim_sec.table[7].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[7].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[7].ratio_dev,
                assessment: data.ratio_prim_sec.table[7].assessment
            },
            {
                tap: 3,
                phase: "AC/ac",
                hv1: data.ratio_prim_sec.table[8].hv1,
                lv: data.ratio_prim_sec.table[8].lv,
                nominal_ratio: data.ratio_prim_sec.table[8].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[8].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[8].ratio_dev,
                assessment: data.ratio_prim_sec.table[8].assessment
            },
            {
                tap: 4,
                phase: "AB/ab",
                hv1: data.ratio_prim_sec.table[9].hv1,
                lv: data.ratio_prim_sec.table[9].lv,
                nominal_ratio: data.ratio_prim_sec.table[9].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[9].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[9].ratio_dev,
                assessment: data.ratio_prim_sec.table[9].assessment
            },
            {
                tap: 4,
                phase: "BC/bc",
                hv1: data.ratio_prim_sec.table[10].hv1,
                lv: data.ratio_prim_sec.table[10].lv,
                nominal_ratio: data.ratio_prim_sec.table[10].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[10].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[10].ratio_dev,
                assessment: data.ratio_prim_sec.table[10].assessment
            },
            {
                tap: 4,
                phase: "AC/ac",
                hv1: data.ratio_prim_sec.table[11].hv1,
                lv: data.ratio_prim_sec.table[11].lv,
                nominal_ratio: data.ratio_prim_sec.table[11].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[11].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[11].ratio_dev,
                assessment: data.ratio_prim_sec.table[11].assessment
            },
            {
                tap: 5,
                phase: "AB/ab",
                hv1: data.ratio_prim_sec.table[12].hv1,
                lv: data.ratio_prim_sec.table[12].lv,
                nominal_ratio: data.ratio_prim_sec.table[12].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[12].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[12].ratio_dev,
                assessment: data.ratio_prim_sec.table[12].assessment
            },
            {
                tap: 5,
                phase: "BC/bc",
                hv1: data.ratio_prim_sec.table[13].hv1,
                lv: data.ratio_prim_sec.table[13].lv,
                nominal_ratio: data.ratio_prim_sec.table[13].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[13].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[13].ratio_dev,
                assessment: data.ratio_prim_sec.table[13].assessment
            },
            {
                tap: 5,
                phase: "AC/ac",
                hv1: data.ratio_prim_sec.table[14].hv1,
                lv: data.ratio_prim_sec.table[14].lv,
                nominal_ratio: data.ratio_prim_sec.table[14].nominal_ratio,
                v_ratio: data.ratio_prim_sec.table[14].v_ratio,
                ratio_dev: data.ratio_prim_sec.table[14].ratio_dev,
                assessment: data.ratio_prim_sec.table[14].assessment
            }
        ]
    }
    await insert_test('3', 'Ratio prim/sec', ratio_prim_sec, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection) 
}

//DC winding resistance Prim
const insert_winding_resistance_prim = async (job_id, data, conection) => {
    const winding_resistance_prim = {
        winding_temperature: ins_resistance_value(data.winding_resistance_prim.winding_temperature)[0],
        measurement_of_winding: "",
        table: [
            {
                voltage_table_id: "Pokq1j",
                tap: 1,
                phase: "AB",
                r_meas: data.winding_resistance_prim.table[0].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[0].error_between_phase,
                mean_value: data.winding_resistance_prim.table[0].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "Pokq1j",
                tap: 1,
                phase: "BC",
                r_meas: data.winding_resistance_prim.table[1].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[1].error_between_phase,
                mean_value: data.winding_resistance_prim.table[1].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "Pokq1j",
                tap: 1,
                phase: "CA",
                r_meas: data.winding_resistance_prim.table[2].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[2].error_between_phase,
                mean_value: data.winding_resistance_prim.table[2].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "UccQ16",
                tap: 2,
                phase: "AB",
                r_meas: data.winding_resistance_prim.table[3].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[3].error_between_phase,
                mean_value: data.winding_resistance_prim.table[3].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "UccQ16",
                tap: 2,
                phase: "BC",
                r_meas: data.winding_resistance_prim.table[4].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[4].error_between_phase,
                mean_value: data.winding_resistance_prim.table[4].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "UccQ16",
                tap: 2,
                phase: "CA",
                r_meas: data.winding_resistance_prim.table[5].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[5].error_between_phase,
                mean_value: data.winding_resistance_prim.table[5].mean_value,
                assessment: ""
            }, {
                voltage_table_id: "JnZR1B",
                tap: 3,
                phase: "AB",
                r_meas: data.winding_resistance_prim.table[6].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[6].error_between_phase,
                mean_value: data.winding_resistance_prim.table[6].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "JnZR1B",
                tap: 3,
                phase: "BC",
                r_meas: data.winding_resistance_prim.table[7].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[7].error_between_phase,
                mean_value: data.winding_resistance_prim.table[7].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "JnZR1B",
                tap: 3,
                phase: "CA",
                r_meas: data.winding_resistance_prim.table[8].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[8].error_between_phase,
                mean_value: data.winding_resistance_prim.table[8].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "9WKMtq",
                tap: 4,
                phase: "AB",
                r_meas: data.winding_resistance_prim.table[9].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[9].error_between_phase,
                mean_value: data.winding_resistance_prim.table[9].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "9WKMtq",
                tap: 4,
                phase: "BC",
                r_meas: data.winding_resistance_prim.table[10].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[10].error_between_phase,
                mean_value: data.winding_resistance_prim.table[10].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "9WKMtq",
                tap: 4,
                phase: "CA",
                r_meas: data.winding_resistance_prim.table[11].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[11].error_between_phase,
                mean_value: data.winding_resistance_prim.table[11].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "qBnolI",
                tap: 5,
                phase: "AB",
                r_meas: data.winding_resistance_prim.table[12].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[12].error_between_phase,
                mean_value: data.winding_resistance_prim.table[12].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "qBnolI",
                tap: 5,
                phase: "BC",
                r_meas: data.winding_resistance_prim.table[13].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[13].error_between_phase,
                mean_value: data.winding_resistance_prim.table[13].mean_value,
                assessment: ""
            },
            {
                voltage_table_id: "qBnolI",
                tap: 5,
                phase: "CA",
                r_meas: data.winding_resistance_prim.table[14].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_prim.table[14].error_between_phase,
                mean_value: data.winding_resistance_prim.table[14].mean_value,
                assessment: ""
            },
        ]
    }
    await insert_test('4', 'DC winding resistance Prim', winding_resistance_prim, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

    // DC winding resistance sec
const insert_winding_resistance_sec = async (job_id, data, conection) => {
    const winding_resistance_sec = {
        winding_temperature: ins_resistance_value(data.winding_resistance_sec.winding_temperature)[0],
        measurement_of_winding: "",
        table: [
            {
                tap: "",
                phase: "ab",
                r_meas: data.winding_resistance_sec.table[0].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_sec.table[0].error_between_phase,
                mean_value: data.winding_resistance_sec.table[0].mean_value,
                assessment: ""
            },
            {
                tap: "",
                phase: "bc",
                r_meas: data.winding_resistance_sec.table[1].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_sec.table[1].error_between_phase,
                mean_value: data.winding_resistance_sec.table[1].mean_value,
                assessment: ""
            },
            {
                tap: "",
                phase: "ca",
                r_meas: data.winding_resistance_sec.table[2].r_meas,
                r_corr: "",
                error_between_phase: data.winding_resistance_sec.table[2].error_between_phase,
                mean_value: data.winding_resistance_sec.table[2].mean_value,
                assessment: ""
            }
        ]
    }
    await insert_test('5', 'DC winding resistance sec', winding_resistance_sec, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

// Measurement of no-load loss and current
const insert_MeasurementOfNoLoad = async (job_id, data, conection) => {
    const MeasurementOfNoLoad = {
        no_load_loss: {
            result: data.MeasurementOfNoLoad.no_load_loss.result,
            standard: data.MeasurementOfNoLoad.no_load_loss.standard,
            assessment: getAssessment(data.MeasurementOfNoLoad.no_load_loss.assessment)
        },
        no_load_current: {
            result: data.MeasurementOfNoLoad.no_load_current.result,
            standard: data.MeasurementOfNoLoad.no_load_current.standard,
            assessment: getAssessment(data.MeasurementOfNoLoad.no_load_current.assessment)
        }
    }
    await insert_test('6', 'Measurement of no-load loss and current', MeasurementOfNoLoad, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

// Measurement of short-circuit impedance and load loss at 75ºC
const insert_MeasurementOfShortCircuit = async (job_id, data, conection) => {
    const MeasurementOfShortCircuit = {
        load_loss: {
            result: data.MeasurementOfShortCircuit.load_loss.result,
            standard: data.MeasurementOfShortCircuit.load_loss.standard,
            assessment: getAssessment(data.MeasurementOfShortCircuit.load_loss.assessment)
        },
        short_circuit_impedance: {
            result: data.MeasurementOfShortCircuit.short_circuit_impedance.result,
            standard: data.MeasurementOfShortCircuit.short_circuit_impedance.standard,
            assessment: getAssessment(data.MeasurementOfShortCircuit.short_circuit_impedance.assessment)
        }
    }
    await insert_test('7', 'Measurement of short-circuit impedance and load loss at 75ºC', MeasurementOfShortCircuit, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

// Energy Efficiency
const insert_EnergyEfficiency = async (job_id, data, conection) => {
    const EnergyEfficiency = {
        hv1: {
            e50: data.EnergyEfficiency.hv1.e50,
            standard: data.EnergyEfficiency.hv1.standard,
            assessment: getAssessment(data.EnergyEfficiency.hv1.assessment)
        },
        hv2: {
            e50: "",
            standard: "",
            assessment: ""
        }
    }
    await insert_test('8', 'Energy efficiency', EnergyEfficiency, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

//InducedAcVoltageTests
const insert_InducedAcVoltageTests = async (job_id, data, conection) => {
    const InducedAcVoltageTests = {
        dataList: [
            {
                terminal: data.InducedAcVoltageTests.dataList[0].terminal,
                ratedVoltage: data.InducedAcVoltageTests.dataList[0].ratedVoltage,
                Lv: {
                    terminal: data.InducedAcVoltageTests.dataList[0].Lv.terminal,
                    testedVoltage: data.InducedAcVoltageTests.dataList[0].Lv.testedVoltage
                },
                Hv: {
                    terminal: data.InducedAcVoltageTests.dataList[0].Hv.terminal,
                    testedVoltage: data.InducedAcVoltageTests.dataList[0].Hv.testedVoltage
                },
                assessment: getAssessment(data.InducedAcVoltageTests.dataList[0].assessment)
            }
        ]
    }
    await insert_test('9', 'Induced AC voltage tests', InducedAcVoltageTests, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

//Measurement of breakdown voltage of oil
const insert_MeasurementOfOil = async (job_id, data, conection) => {
    const MeasurementOfOil = {
        table: {
            type_oil: data.MeasurementOfOil.table.type_oil,
            elecGap: data.MeasurementOfOil.table.elecGap,
            assessment: data.MeasurementOfOil.table.assessment
        }
    }

    await insert_test('10', 'Measurement of breakdown voltage of oil', MeasurementOfOil, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

//Dimension and Weight
const insert_DimensionWeight = async (job_id, data, conection) => {
    const DimensionWeight = {
        table: {
            dimension: {
                a: data.DimensionWeight.table.dimension.a,
                b: data.DimensionWeight.table.dimension.b,
                c: data.DimensionWeight.table.dimension.c,
                n: data.DimensionWeight.table.dimension.n
            },
            weight: {
                oil: data.DimensionWeight.table.weight.oil,
                active: data.DimensionWeight.table.weight.active,
                total: data.DimensionWeight.table.weight.total
            }
        }
    }

    await insert_test('11', 'Dimension, Weight', DimensionWeight, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

//SeparateSourceAc
const insert_SeparateSourceAc = async (job_id, data, conection) => {
    const SeparateSourceAc = {
        hv: {
            test_voltage: data.SeparateSourceAc.hv.test_voltage,
            assessment: getAssessment(data.SeparateSourceAc.hv.assessment)
        },
        lv: {
            test_voltage: data.SeparateSourceAc.lv.test_voltage,
            assessment: getAssessment(data.SeparateSourceAc.lv.assessment)
        }
    }
    await insert_test('14', 'Separate source AC withstand voltage tests', SeparateSourceAc, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)
}

//TestingInstruments
const insert_TestingInstruments = async (job_id, data, conection) => {
    const getNameTestIns = (arr) => {
        var matches = arr.match(/\(.*?\)/g).map(x => x.replace(/[()]/g, ""));
        return matches[0]
    }

    const getTypeTestIns = (arr) => {
        var y = arr.slice(arr.indexOf(":") + 1);
        var b = y.split(/(\s+)/).filter(function (e) { return e.trim().length > 0; })
        return b[0]
    }

    const TestingInstruments = {
        dataList: [
            {
                no: "1", testingInstrument: getNameTestIns(data.TestingInstruments.dataList[0].testingInstrument),
                type_ins: getTypeTestIns(data.TestingInstruments.dataList[0].type_ins)
            },
            {
                no: "2", testingInstrument: getNameTestIns(data.TestingInstruments.dataList[1].testingInstrument),
                type_ins: getTypeTestIns(data.TestingInstruments.dataList[1].type_ins)
            },
            {
                no: "3", testingInstrument: getNameTestIns(data.TestingInstruments.dataList[2].testingInstrument),
                type_ins: getTypeTestIns(data.TestingInstruments.dataList[2].type_ins)
            },
            {
                no: "4", testingInstrument: getNameTestIns(data.TestingInstruments.dataList[3].testingInstrument),
                type_ins: getTypeTestIns(data.TestingInstruments.dataList[3].type_ins)
            },
            {
                no: "5", testingInstrument: getNameTestIns(data.TestingInstruments.dataList[4].testingInstrument),
                type_ins: getTypeTestIns(data.TestingInstruments.dataList[4].type_ins)
            },
            {
                no: "6", testingInstrument: getNameTestIns(data.TestingInstruments.dataList[5].testingInstrument),
                type_ins: getTypeTestIns(data.TestingInstruments.dataList[5].type_ins)
            },
        ]
    }

    await insert_test('12', 'Testing instruments', TestingInstruments, conection)
    var testID = await getTestId(conection)
    await insert_job_test(job_id, testID, conection)

}



export const importTest3pha1cap = async (job_id, data, conection) => {

    await insert_general_inspection(job_id, data, conection)
    await insert_Insulation_Resistance(job_id, data, conection)
    await insert_ratio_prim_sec(job_id, data, conection)
    await insert_winding_resistance_prim(job_id, data, conection)
    await insert_winding_resistance_sec(job_id, data, conection)
    await insert_MeasurementOfNoLoad(job_id, data, conection)
    await insert_MeasurementOfShortCircuit(job_id, data, conection)
    await insert_EnergyEfficiency(job_id, data, conection)
    await insert_InducedAcVoltageTests(job_id, data, conection)
    await insert_MeasurementOfOil(job_id, data, conection)
    await insert_DimensionWeight(job_id, data, conection)
    await insert_SeparateSourceAc(job_id, data, conection)
    await insert_TestingInstruments(job_id, data, conection)

}

const getTestId = async (conection) => {
    return new Promise((resolve, reject) => {
        conection.get("SELECT last_insert_rowid() as id FROM tests", [], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const data_split = (arr) => {
    return arr.split(/(\s+)/).filter(function (e) { return e.trim().length > 0; })
}

const getAssessment = (arr) => {
    if (arr.toString().toUpperCase().includes("PASS") || arr.toString().toUpperCase().includes("ĐẠT")) {
        return 'Pass'
    }
    else if (arr.toString().toUpperCase().includes("FAIL") || arr.toString().toUpperCase().includes("KHÔNG ĐẠT")) {
        return 'Fail'
    }
    else {
        return ""
    }
}
const insert_test = async (type_id, name, data, conection) => {
    new Promise((resolve, reject) => {
        conection.run('INSERT INTO tests(type_id, name, data)' +
            'VALUES(?, ?, ?)',
            [type_id, name, JSON.stringify(data)],
            (err) => {
                if (err) reject(err)
                resolve(true)
            }
        )
    })
}

const insert_job_test = async (job_id, testID, conection) => {
    new Promise((resolve, reject) => {
        conection.run('INSERT INTO job_test(job_id, test_id)' +
            'VALUES(?, ?)',
            [job_id, testID.id],
            (err) => {
                if (err) reject(err)
                resolve(true)
            }
        )
    })
}

const ins_resistance_value = (arr) => {
    const regex = /[\d|,|.|e|E|\+]+/g;
    var matches = arr.match(regex);
    matches = matches.filter((item) => item !== 'e' && item !== ',')
    return (matches)
}