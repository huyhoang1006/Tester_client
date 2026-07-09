import PropertiesDto from './Properties';

class TestingEquipmentDto {
    constructor() {
        this.mrid = '';
        this.assetInfoId = '';
        this.attachmentId = '';
        this.productAssetModelId = '';   // -> product_asset_model.mrid (manufacturer/model)
        this.lifecycleDateId = '';       // -> lifecycle_date.mrid (manufactured date)
        this.inUseDateId = '';           // -> in_use_date.mrid (in-use date)
        this.userId = '';                // -> user.user_id (người tạo/sở hữu)
        this.userIdentifiedObjectId = ''; // -> user_identified_object.mrid (link user <-> thiết bị)
        this.user = null;                // thông tin user hiện tại (để upsert vào bảng user nếu chưa có)

        // Overview / identification
        this.properties = new PropertiesDto();

        // Tab collections (each item follows its own sub-DTO shape)
        this.calibration = [];
        this.licenses = [];
        this.repairs = [];
        this.usage = [];
        this.accessories = [];
        this.attachments = [];
    }
}

export default TestingEquipmentDto;
