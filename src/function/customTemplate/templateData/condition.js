export const initCondition = async () => {
    const data = {
        condition : {
            top_oil_temperature :"",
            bottom_oil_temperature :"",
            winding_temperature :"",
            reference_temperature :"",
            ambient_temperature :"",
            humidity :"",
            weather :""
        },
        equipment : {
            model :"",
            serial_no :"",
            calibration_date :""
        },
        comment : ""
    }

    return data
}