import IdentifiedObject from '../IdentifiedObject';
import Manufacturer from "../Manufacturer";
import Length from "../Length";
import Mass from "../Mass";
class ProductAssetModel extends IdentifiedObject {
    constructor() {
        super()
                this.catalogueNumber = null;
                this.manufacturer = new Manufacturer();
                this.corporateStandardKind = null; // e.g., "standard", "custom"
                this.drawingNumber = null; // Version of the corporate standard
                this.instructionManual = null; // Type of equipment (e.g., transformer, switch)
                this.modelNumber = null; // Name of the product asset model
                this.modelVersion = null; // Unique identifier for the product asset model
                this.overallLength = new Length(); // Overall length of the product asset model
                this.styleNumber = null; // Style number of the product asset model
                this.weightTotal = new Mass(); // Type of the product asset model (e.g., electrical, mechanical)
                this.manufacturer = new Manufacturer(); // Manufacturer of the product asset model
    }
}

export default ProductAssetModel;