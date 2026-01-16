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

export const conditionIndicatorToValue = (indicator) => {
    switch (indicator) {
        case 'Good': return 3;
        case 'Fair': return 2;
        case 'Poor': return 1;
        case 'Bad': return 0;
        default: return null;
    }
}

export const assessmentToValue = (assessment) => {
    switch (assessment) {
        case 'Pass': return 1;
        case 'Fail': return 0;
        default: return null;
    }
}