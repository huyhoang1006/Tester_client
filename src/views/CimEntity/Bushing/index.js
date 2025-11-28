import  Asset from '../Asset/index.js';
class Bushing extends Asset {
    constructor() {
        super();
                this.terminal = null; // e.g., "volt"
                this.movingContact = null; // Numerical value of the voltage
                this.fixedContact = null; // e.g., "kilo", "mega" for scaling the value
    }
}
export default Bushing;
