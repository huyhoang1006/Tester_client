import Mass from "../Mass";
import Pressure from "../Pressure";
import Temperature from "../Temperature";
import Volume from "../Volume";
class BreakerOtherInfo {
    constructor() {
        this.mRID = null;
                this.breakerInfoId = null;
                this.totalWeightWithGas = new Mass();
                this.weightOfGas = new Mass();
                this.ratedGasPressure = new Pressure();
                this.ratedGasTemperature = new Temperature();
                this.volumeOfGas = new Volume();
    }
}

export default BreakerOtherInfo;