import PropertiesDto from './Properties/index.js';
import BushingDto from './Bushing/index.js';
import Attachment from '@/views/Entity/Attachment'
class BushingAssetDto {
    constructor() {
        this.properties = new PropertiesDto();
        this.bushing = new BushingDto();
        this.assetInfoId = ''
        this.productAssetModelId = '';
        this.lifecycleDateId = '';
        this.assetPsrId = '';
        this.psrId = '';
        this.attachmentId = '';
        this.attachment = new Attachment();
        this.locationId = '';
    }
}
export default BushingAssetDto;