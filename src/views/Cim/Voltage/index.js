class Voltage {
    constructor() {
        this.mrid = null
        this.unit = null // e.g., "volt"
        this.value = null // Numerical value of the voltage
        this.multiplier = null // e.g., "kilo", "mega" for scaling the value
    }
}

export default Voltage;