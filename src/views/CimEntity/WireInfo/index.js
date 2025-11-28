import AssetInfo from '../AssetInfo';
import Length from "../Length";
import CurrentFlow from "../CurrentFlow";
class WireInfo extends AssetInfo {
    constructor() {
        super();
                this.coreRadius = new Length(); // Length: bán kính lõi
                this.coreStrandCount = null; // Integer: số sợi trong lõi
                this.gmr = new Length(); // Length: geometric mean radius
                this.insulated = null; // Boolean: có cách điện không
                this.insulationMaterial = null; // WireInsulationKind
                this.insulationThickness = new Length(); // Length: độ dày cách điện
                this.material = null; // WireMaterialKind
                this.rAc = null; // ResistancePerLength: điện trở AC/đơn vị
                this.radius = new Length(); // Length: bán kính ngoài
                this.ratedCurrent = new CurrentFlow(); // CurrentFlow: dòng định mức
                this.rDc = null; // ResistancePerLength: điện trở DC/đơn vị
                this.sizeDescription = null; // String: mô tả kích thước
                this.strandCount = null; // Integer: số sợi dẫn
    }
}

export default WireInfo;