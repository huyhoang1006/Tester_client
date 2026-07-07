class PropertiesDto {
    constructor() {
        this.mrid = '';
        this.name = '';
        this.type = '';
        this.kind = 'Testing equipment';
        this.serial_no = '';
        this.manufacturer = '';
        this.model = '';
        this.manufacturer_year = '';
        this.asset_tag = '';
        this.status = 'Available';
        this.country_of_origin = '';
        this.purchase_date = '';
        this.comment = '';
        this.is_accessory = 0;      // 0 = máy chính, 1 = thiết bị đi kèm (accessory)
    }
}

export default PropertiesDto;
