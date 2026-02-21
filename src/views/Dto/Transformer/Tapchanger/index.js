import AssetPsr from "@/views/Cim/AssetPsr";
class TapChangersDto {
    constructor() {
        this.mrid = '';
        this.mode = '';
        this.serial_no = '';
        this.manufacturer = '';
        this.manufacturer_type = '';
        this.winding = '';
        this.tap_scheme = '';
        this.no_of_taps = '0';
        this.productAssetModelId = ''
        this.assetId = ''
        this.assetPsr = new AssetPsr()
        this.ratioTapchangerTableId = ''
        this.voltage_table = [];
    }
}
export default TapChangersDto;