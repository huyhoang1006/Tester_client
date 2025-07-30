class ZeroSequenceImpedanceTable {
    constructor() {
        this.mrid = null;
        this.transformer_end_id = null; // Reference to the power transformer info
        this.zero = null; // Base power in VA
        this.zero_sequence_impedance = null; // Zero sequence impedance in Ohms
    }
}
export default ZeroSequenceImpedanceTable;