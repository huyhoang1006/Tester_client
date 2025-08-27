import IdentifiedObject from "../IdentifiedObject";

class TestStandard extends IdentifiedObject {
    constructor() {
        super();
        this.test_method = null; // Test ID
        this.test_standard_astm = null; // Test Name
        this.test_standard_cigre = null; // Test Description
        this.test_standard_din = null; // Test ID
        this.test_standard_doble = null; // Test Name
        this.test_standard_epa = null; // Test Description
        this.test_standard_iec = null; // Test ID
        this.test_standard_ieee = null; // Test Name
        this.test_standard_iso = null; // Test Description
        this.test_standard_laborelec = null; // Test ID
        this.test_standard_tappi = null; // Test Name
        this.test_standard_ukministry_of_defence = null; // Test Description
        this.test_standard_wep = null; // Test Name
        this.test_variant = null; // Test Description
    }
}
export default TestStandard;
