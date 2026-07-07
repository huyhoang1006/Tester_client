import Asset from "../../Cim/Asset";
import ProductAssetModel from "../../Cim/ProductAssetModel";
import LifecycleDate from "../../Cim/LifecycleDate";
import TestingEquipmentInfo from "../TestingEquipmentInfo";
import Attachment from "../Attachment";
import UserIdentifiedObject from "../UserIdentifiedObject";

// Entity tổng hợp toàn bộ thông tin của 1 testing equipment.
// Khớp shape mà insertTestingEquipmentEntity / getTestingEquipmentEntity dùng:
//   { asset, testingEquipment, softwareLicenses[], calibrations[], repairs[], accessories[] }
// Các mảng chứa item theo shape: SoftwareLicense / CalibrationRecord / RepairRecord / AccessoryTestingEquipment
class TestingEquipmentEntity {
    constructor() {
        this.asset = new Asset();                       // Cim/Asset (asset.mrid === testingEquipment.mrid)
        this.productAssetModel = new ProductAssetModel(); // manufacturer / model_number
        this.lifecycleDate = new LifecycleDate();         // manufactured_date / purchase_date
        this.testingEquipment = new TestingEquipmentInfo();
        this.attachment = new Attachment();               // 1 record, path = JSON [{path}]
        this.userIdentifiedObject = new UserIdentifiedObject(); // link user <-> thiết bị

        this.softwareLicenses = [];  // [ SoftwareLicense ]
        this.calibrations = [];      // [ CalibrationRecord ]
        this.repairs = [];           // [ RepairRecord ] (activity_record type='Repair')
        this.accessories = [];       // [ AccessoryTestingEquipment ]
    }
}

export default TestingEquipmentEntity;
