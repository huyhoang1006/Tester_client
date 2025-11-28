import PropertiesDto from './Properties/index.js';
import ReactorRatingDto from './Ratings/index.js';  
import ReactorOtherDto from './Others/index.js';
import Attachment from '@/views/Flatten/Attachment'
class ReactorDto{
    constructor() {
        this.properties = new PropertiesDto();
        this.reactorRating = new ReactorRatingDto();
        this.reactorOther = new ReactorOtherDto();
        this.mrid = '';
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
export default ReactorDto;