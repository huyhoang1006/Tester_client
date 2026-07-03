import PropertiesDto from './Properties/index.js';
import ReactorRatingDto from './Ratings/index.js';  
import ReactorOtherDto from './Others/index.js';
import Attachment from '@/views/Flatten/Attachment'
import ReactorConfigDto from './Configuration/index.js';
class ReactorDto{
    constructor() {
        this.properties = new PropertiesDto();
        this.reactorRating = new ReactorRatingDto();
        this.reactorOther = new ReactorOtherDto();
        this.config = new ReactorConfigDto();
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