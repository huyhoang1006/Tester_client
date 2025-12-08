import AssetInfo from "../AssetInfo";
import PowerTransformerInfo from "../PowerTransformerInfo";
import Mass from "../Mass";     // Import thêm
import Volume from "../Volume"; // Import thêm

class TransformerTankInfo extends AssetInfo {
    constructor() {
        super();
        this.powerTransformerInfo = new PowerTransformerInfo();
        this.insulationM = null; // Medium (String)
        this.insulationW = new Mass();   // Sửa
        this.insulationV = new Volume(); // Sửa
    }
}
export default TransformerTankInfo;