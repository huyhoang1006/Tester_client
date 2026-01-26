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