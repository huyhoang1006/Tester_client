import  Asset from '../Asset/index.js';
class Bushing extends Asset {
    constructor() {
        super();
        this.terminal = null // e.g., "volt"
        this.moving_contact = null // Numerical value of the voltage
        this.fixed_contact = null // e.g., "kilo", "mega" for scaling the value
    }
}
export default Bushing;
