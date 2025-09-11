import WireInfo from '../WireInfo';

class CableInfo extends WireInfo {
    constructor() {
        super();

        // Thuộc tính riêng của CableInfo
        this.construction_kind = null;       // CableConstructionKind
        this.diameter_over_core = null;      // Length
        this.diameter_over_insulation = null;// Length
        this.diameter_over_jacket = null;    // Length
        this.diameter_over_screen = null;    // Length
        this.is_strand_fill = null;          // Boolean
        this.nominal_temperature = null;     // Temperature
        this.outer_jacket_kind = null;       // CableOuterJacketKind
        this.sheath_as_neutral = null;       // Boolean
        this.shield_material = null;         // CableShieldMaterialKind

        // Các trường WireInfo đã có từ lớp cha (core_radius, r_dc, strand_count, …)
        // Các trường AssetInfo, IdentifiedObject cũng đã có từ lớp cha
    }
}

export default CableInfo;
