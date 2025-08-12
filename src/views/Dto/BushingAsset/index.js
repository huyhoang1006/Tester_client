import ProPropertiesDto from './Properties/index.js';
import BushingDto from './Bushing/index.js';
class BushingAssetDto {
    constructor() {
        this.properties = new ProPropertiesDto();
        this.bushing = new BushingDto();
    }
}
export default BushingAssetDto;