import BreakerInfo from '../BreakerInfo';
class OldBreakerInfo extends BreakerInfo {
    constructor() {
        super();
        this.phase_number = null;
        this.number_of_interrupters_per_phase = null;
        this.pole_operation = null;
        this.pir = null;
        this.pir_value = null;
        this.grading_capacitors = null;
        this.capacitor_value = null;
        this.interrupting_medium = null;
        this.tank_type = null;
    }
}
export default OldBreakerInfo;