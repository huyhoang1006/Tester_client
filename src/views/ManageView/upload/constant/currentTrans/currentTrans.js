const currentTrans = {
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
                value: "show",
                label : "Show"
            },
            {
                value: "standard",
                label : "Standard"
            },
            {
                value: "rated_frequency",
                label : "Rating rated frequency"
            },
            {
                value: "rated_frequency_custom",
                label : "Rating rated frequency custom"
            },
            {
                value: "ratedFactorArr",
                label : "Rating factor (RF)"
            },
            {
                value: "ratedFactorArrData",
                label : "Rating factor (RF) data"
            },
        ],
        label : "Ratings"
    },
    config : {
        columnAddr : [
            {
                value : 'cores',
                label : "Cores"
            },
            {
                value : 'dataCT',
                label : "Data config"
            }
        ],
        label : "Configuration"
    }

}
export default currentTrans