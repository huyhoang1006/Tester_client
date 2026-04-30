/* eslint-disable */
import uuid from "@/utils/uuid";
export const buildEmptyTestRow = (columns) => {
    const row = {
        mrid: '', // mrid của cả row test
    }
    columns.forEach(col => {
        row[col.code] = {
            mrid: '',                // mrid của measurement
            value: "",                     // giá trị test (user nhập sau)
            unit: col.unit || "",
            type: col.type,
            measurement_id : col.mrid, // id của measurement
        }
    })

  return row
}

export const buildEmptyTestAssessment = (standardArr) => {
    const assessment = []
    for (const st of standardArr) {
        const standardObj = {
            mrid: st.mrid,
            name: st.name,
            type: st.type,
            edition: st.standard_edition,
            number: st.standard_number,
            code: st.code,
            records : []
        }
        for(const rc of st.record) {
             const row = {
                mrid: rc.mrid,
                description : rc.description || "",
                label : rc.label || "",
            }
            for(const col of st.columns) {
                row[col.code] = {
                    mrid: rc[col.code].mrid || '',                // mrid của measurement
                    value: rc[col.code].value || "",                     // giá trị test (user nhập sau)
                    unit: col.unit || "",
                    type: col.type,
                    measurement_id : col.mrid, // id của measurement
                }
            }
            standardObj.records.push(row)
        }
        assessment.push(standardObj)
    }
    return assessment  // ✅ trả về kết quả
}

export const buildEmptyTestCondition = (columns) => {
    const row = {
    }
    columns.forEach(col => {
        row[col.code] = {
            mrid: '',                // mrid của measurement
            value: "",                     // giá trị test (user nhập sau)
            unit: col.unit || "",
            type: col.type,
            measurement_id : col.mrid, // id của measurement
        }
    })

  return row
}

export const assessmentToValue = (assessment) => {
    if(assessment == 'Pass') {
        return 1
    } else if(assessment == 'Fail') {
        return 0
    }
}

export const conditionIndicatorToValue = (conditionIndicator) => {
    if(conditionIndicator == 'Good') {
        return 3
    } else if(conditionIndicator == 'Fair') {
        return 2
    } else if(conditionIndicator == 'Poor') {
        return 1
    } else if(conditionIndicator == 'Bad') {
        return 0
    }
}

const operatorMap = {
    '≥': '>=',
    '≤': '<=',
    '>': '>',
    '<': '<',
    '=': '===',
    '≠': '!==',
}

const getOperator = (symbol) => operatorMap[symbol] ?? '==='

export const compare = (value, description, threshold) => {
    const op = getOperator(description)

    switch (op) {
        case '>=': return value >= threshold
        case '<=': return value <= threshold
        case '>':  return value > threshold
        case '<':  return value < threshold
        case '===': return value === threshold
        case '!==': return value !== threshold
        default: return false
    }
}

export const traverseAndFillMrid = async (obj) => {
    if (Array.isArray(obj)) {
        for (const item of obj) {
            await traverseAndFillMrid(item);  // ✅ await đúng cách
        }
    } else if (obj !== null && typeof obj === "object") {
        if ("mrid" in obj) {
            if (!obj.mrid || obj.mrid === "") {
                obj.mrid = uuid.newUuid();
            }
        }
        for (const val of Object.values(obj)) {
            await traverseAndFillMrid(val);  // ✅ await đúng cách
        }
    }
    return obj;
}

export const changeTestStandard = async (id, type, testStandard) => {
    const typeToColumn = {
        astm: 'test_standard_astm',
        cigre: 'test_standard_cigre',
        din: 'test_standard_din',
        doble: 'test_standard_doble',
        epa: 'test_standard_epa',
        iec: 'test_standard_iec',
        ieee: 'test_standard_ieee',
        iso: 'test_standard_iso',
        laborelec: 'test_standard_laborelec',
        tappi: 'test_standard_tappi',
        ukministry_of_defence: 'test_standard_ukministry_of_defence',
        wep: 'test_standard_wep'
    }
    if(typeToColumn[type]) {
        testStandard[typeToColumn[type]] = id
    }
}