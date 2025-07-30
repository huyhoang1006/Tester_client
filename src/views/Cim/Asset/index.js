import IdentifiedObject from "../IdentifiedObject";
class Asset extends IdentifiedObject {
    constructor() {
        super();
        this.acceptance_test = null; // Name of the asset
        this.critical = null; // Type of the asset (e.g., transformer, switch)
        this.electronic_address = null; // Operational status of the asset
        this.initial_condition = null; // Geographical location of the asset
        this.initial_loss_of_life = null; // Date when the asset was installed
        this.in_use_date = null; // Date when the asset was manufactured
        this.in_use_state = null; // Date when the asset was last inspected
        this.kind = null; // Date when the asset was purchased
        this.lifecycle_date = null; // Date when the asset was received
        this.lifecycle_state = null; // Date when the asset was removed
        this.lot_number = null; // Date when the asset was retired
        this.position = null; // Manufacturer of the asset
        this.retired_reason = null; // Model of the asset
        this.serial_number = null; // Version of the asset
        this.status = null; // Status of the asset (e.g., operational, maintenance)
        this.type = null; // Time when the status was last updated
        this.utc_number = null; // Unique identifier for the asset
        this.asset_info = null; // Usage of the asset (e.g., residential, commercial)
        this.product_asset_model = null; // Description of the asset
        this.location = null; // Associated location of the asset
        this.country_of_origin = null; // Associated country of origin of the asset
    }
}

export default Asset;