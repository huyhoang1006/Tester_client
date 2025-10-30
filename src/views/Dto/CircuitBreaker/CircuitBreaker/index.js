class circuitBreakerDto {
    constructor() {
        this.numberOfPhases = '';
        this.interruptersPerPhase = '';
        this.poleOperation = '';
        this.hasPIR = '';
        this.pirValue = {
            mrid: '',
            value: '',
            unit: ''
        };
        this.hasGradingCapacitors = '';
        this.capacitorValue = {
            mrid: '',
            value: '',
            unit: ''
        };
        this.interruptingMedium = '';
        this.tankType = '';
    }
}

export default circuitBreakerDto;