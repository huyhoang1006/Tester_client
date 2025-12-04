import WireInfo from '../WireInfo';
import Length from "../Length";
import Temperature from "../Temperature";

class CableInfo extends WireInfo {
    constructor() {
        super();

        // Thuộc tính riêng của CableInfo
                this.constructionKind = null; // CableConstructionKind
                this.diameterOverCore = new Length(); // Length
                this.diameterOverInsulation = new Length(); // Length
                this.diameterOverJacket = new Length(); // Length
                this.diameterOverScreen = new Length(); // Length
                this.isStrandFill = null; // Boolean
                this.nominalTemperature = new Temperature(); // Temperature
                this.outerJacketKind = null; // CableOuterJacketKind
                this.sheathAsNeutral = null; // Boolean
                this.shieldMaterial = null; // CableShieldMaterialKind

        // Các trường WireInfo đã có từ lớp cha (core_radius, r_dc, strand_count, …)
        // Các trường AssetInfo, IdentifiedObject cũng đã có từ lớp cha
    }
}

export default CableInfo;
