import TelephoneNumber from '@/views/Cim/TelephoneNumber';
import StreetAddress from '@/views/Cim/StreetAddress';
import TownDetail from '@/views/Cim/TownDetail';
import StreetDetail from '@/views/Cim/StreetDetail';    
import Attachment from '@/views/Entity/Attachment';
import EletronicAddress from '@/views/Cim/ElectronicAddress';
import Organisation from '@/views/Cim/Organisation';
import User from '@/views/Entity/User/index'

class OrganisationEntity {
    constructor() {
        this.organisation = new Organisation();
        this.electronicAddress = new EletronicAddress();
        this.telephoneNumber = new TelephoneNumber();
        this.streetAddress = new StreetAddress();
        this.townDetail = new TownDetail();
        this.streetDetail = new StreetDetail();
        this.attachment = new Attachment();
        this.configurationEvent = []
        this.positionPoints = []
        this.user = new User();
    }
}

export default OrganisationEntity;