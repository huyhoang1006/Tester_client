class PotentialTransformerTable {
    constructor() {
        this.mrid = null;                             // TEXT NOT NULL, PK
        this.name = null;                             // TEXT
        this.usr_formula = null;                      // TEXT
        this.rated_burden = null;      // FK -> apparent_power(mrid)
        this.rated_power_factor = null;               // REAL (number)
        this.usr_rated_voltage = null;       // FK -> voltage(mrid)
        this.potential_transformer_info_id = null; // FK -> potential_transformer_info(mrid)
    }
}
export default PotentialTransformerTable;