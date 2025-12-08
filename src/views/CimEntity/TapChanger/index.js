import AssetInfo from '../AssetInfo';
import Voltage from "../Voltage";
import CurrentFlow from "../CurrentFlow";
import Frequency from "../Frequency";
import ApparentPower from "../ApparentPower";
import Percent from "../Percent";       // Import thêm
import AngleDegrees from "../AngleDegrees"; // Import thêm (Class bạn mới tạo)

class TapChanger extends AssetInfo {
    constructor() {
        super();
        this.bil = new Voltage();
        this.ctRating = new CurrentFlow();
        this.ctRatio = null; // DB là REAL, để null hoặc số
        this.frequency = new Frequency();
        this.highStep = null;
        this.isTcul = null; // Sửa new Boolean()
        this.lowStep = null;
        this.neutralStep = new Voltage();
        this.ptRatio = null; // DB là REAL
        this.ratedApparentPower = new ApparentPower();
        this.ratedCurrent = new CurrentFlow();
        this.ratedVoltage = new Voltage();
        this.stepPhaseIncrement = new AngleDegrees(); // Sửa
        this.stepVoltageIncrement = new Percent(); // DB: step_voltage_increment -> percent
    }
}
export default TapChanger;