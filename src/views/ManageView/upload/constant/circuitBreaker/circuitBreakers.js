const circuitBreakerData = {
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
    circuitBreaker : {
        columnAddr : [
            {
                value: "numberOfPhase",
                label : "Number of phase"
            },
            {
                value: "numberOfInterruptPhase",
                label : "Number of interrupt phase"
            },
            {
                value: "poleOperation",
                label : "Pole operation"
            },
            {
                value: "PreInsert",
                label : "Pre-insertion resistors (PIR)"
            },
            {
                value: "gradingCap",
                label : "Grading capacitors"
            },
            {
                value: "interruptMedium",
                label : "Interrupt medium"
            },
            {
                value: "tankType",
                label : "Tank type"
            },
            {
                value: "PIR",
                label : "PIR"
            },
            {
                value: "capacitorValue",
                label : "Capacitor value"
            }
        ],
        label : "Circuit breaker"
    },
    ratings : {
        columnAddr : [
            {
                value: "rated_frequency",
                label : "Rated frequency"
            },
            {
                value: "rated_frequency_custom",
                label : "Rated frequency custom value"
            },
            {
                value: "rated_voltage_ll",
                label : "Rated voltage-ll"
            },
            {
                value: "rated_current",
                label : "Rated current"
            },
            {
                value: "rated_shortcircuit",
                label : "Rated short-circuit breaking current"
            },
            {
                value: "shortcircuit_nominal",
                label : "Short-circuit nominal duration"
            },
            {
                value: "rated_insulation",
                label : "Rated insulation level (BIL)"
            },
            {
                value: "rated_interrupt",
                label : "Rated interrupting time"
            },
            {
                value: "interrupt_duty",
                label : "Interrupting duty cycle"
            },
            {
                value: "rated_power_closing",
                label : "Rated power at closing"
            },
            {
                value: "rated_power_open",
                label : "Rated power at opening"
            },
            {
                value: "rated_power_charge",
                label : "Rated power at motor charge"
            },
        ],
        label : "Ratings"
    },
    contactSys : {
        columnAddr : [
            {
                value: "nominalTravel",
                label : "Nominal total travel"
            },
            {
                value: "dampTime",
                label : "Damping time"
            },
            {
                value: "nozzleLen",
                label : "Nozzle length"
            },
        ],
        label : "Contact System"
    },
    others : {
        columnAddr : [
            {
                value: "totalWithgas",
                label : "Total Weight with gas"
            },
            {
                value: "weightGas",
                label : "Weight of gas"
            },
            {
                value: "VolumeGas",
                label : "Volume of gas"
            },
            {
                value: "Celsius",
                label : "Rated gas pressure celsius"
            },
            {
                value: "pa",
                label : "Rated gas pressure pa"
            }
        ],
        label : "Others"
    }
}
export default circuitBreakerData