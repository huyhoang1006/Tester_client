const disconnector = {
    properties : {
        columnAddr : [
            {
                value: "asset",
                label : "Asset"
            },
            {
                value: "asset_type",
                label : "Asset type"
            },
            {
                value: "serial_no",
                label : "Serial number"
            },
            {
                value: "manufacturer",
                label : "Manufacturer"
            },
            {
                value: "manufacturer_type",
                label : "Manufacturer type"
            },
            {
                value: "manufacturing_year",
                label : "Manufacturing year"
            },
            {
                value: "asset_system_code",
                label : "Asset system code"
            },
            {
                value: "apparatus_id",
                label : "Apparatus id"
            },
            {
                value: "feeder",
                label : "Feeder"
            },
            {
                value: "comment",
                label : "Comment"
            },
        ],
        label : "Properties"
    },
    ratings : {
        columnAddr : [
            {
                value: "rated_voltage",
                label : "Rated voltage"
            },
            {
                value: "rated_frequency",
                label : "Rated frequency"
            },
            {
                value: "rated_current",
                label : "Rated current"
            },
            {
                value: "shorTime_current",
                label : "Short time withstand current"
            },
            {
                value: "ratedDuration_current",
                label : "Rated duration of short circuit"
            },
            {
                value: "earth_poles",
                label : "to earth and between poles"
            },
            {
                value: "across_isolating",
                label : "across the isolating distance"
            },
        ],
        label : "Ratings"
    },

}
export default disconnector