import Bay from '@/views/CimEntity/Bay';

class BayCimObject {
    constructor() {
        this.name = null; // String
        this.mRID = null;
        this.aliasNames = null; // Array of String
        this.description = null; // String
        this.bay = new Bay();
    }
}

export default BayCimObject;