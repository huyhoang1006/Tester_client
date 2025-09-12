import PropertiesDto from './Properties';
import Attachment from "@/views/Entity/Attachment";
class CircuitBreakerDto {
    constructor() {
        this.properties = new PropertiesDto();
        this.attachment = new Attachment();
        this.numberOfPhases = '';

        this.interruptersPerPhase = '';

        this.poleOperation = '';

        this.hasPIR = '';

        this.pirValue = '';

        this.hasGradingCapacitors = '';

        this.capacitorValue = '';

        this.interruptingMedium = '';

        this.tankType = '';

        this.ratedVoltageLL = '';

        this.ratedCurrent = '';

        this.ratedShortCircuitBreakingCurrent = '';

        this.shortCircuitNominalDuration = '';

        this.ratedInsulationLevel = '';

        this.ratedInterruptingTime = '';

        this.interruptingDutyCycle = '';

        this.ratedPowerAtClosing = '';

        this.ratedPowerAtOpening = '';

        this.ratedPowerAtMotorCharge = '';

        this.ratedFrequency = '';

        this.nominalTotalTravel = '';

        this.dampingTime = '';

        this.nozzleLength = '';

        this.totalWeightWithGas = '';

        this.weightOfGas = '';

        this.volumeOfGas = '';

        this.ratedGasPressure = '';

        this.ratedGasTemperature = '';
    }
}

export default CircuitBreakerDto;