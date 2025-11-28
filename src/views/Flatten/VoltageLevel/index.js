import VoltageLevel from '@/views/Cim/VoltageLevel/index.js';
import BaseVoltage from '@/views/Cim/BaseVoltage';
class VoltageLevelEntity {
    constructor() {
        this.voltageLevel = new VoltageLevel();
        this.baseVoltage = new BaseVoltage();
        this.voltage = [];
    }
}

export default VoltageLevelEntity;
