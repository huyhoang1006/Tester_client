import Bushing from '@/views/Cim/Bushing';
import oldBushingInfo from '@/views/Cim/oldBushingInfo';
class BushingAssetEntity {
    constructor() {
        this.bushing = new Bushing();
        this.oldBushingInfo = new oldBushingInfo()
    }
}

export default BushingAssetEntity;