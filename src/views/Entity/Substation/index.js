import StreetAddress from "@/views/Cim/StreetAddress"
import StreetDetail from "@/views/Cim/StreetDetail"
import Substation from "@/views/Cim/Substation"
import TownDetail from "@/views/Cim/TownDetail"
import Location from "@/views/Cim/Location"
import EletronicAddress from "@/views/Cim/ElectronicAddress"
import TelephoneNumber from "@/views/Cim/TelephoneNumber"
import Person from "@/views/Cim/Person"
import PersonRole from "@/views/Cim/PersonRole"
import UserIdentifiedObject from "../UserIdentifiedObject"
import User from "../User"
import PersonSubstation from "../PersonSubstation"
import Attachment from "../Attachment"
import UserIdentifiedObject from "../UserIdentifiedObject"
import OrganisationLocation from "../OrganisationLocation"
import PsrType from "@/views/Cim/PsrType"

class SubstationEntity {
    constructor() {
        this.substation = new Substation
        this.streetDetail = new StreetDetail
        this.townDetail = new TownDetail
        this.streetAddress = new StreetAddress
        this.location = new Location
        this.electronicAddress = new EletronicAddress
        this.telephoneNumber = new TelephoneNumber
        this.person = new Person
        this.personRole = new PersonRole
        this.user = new User
        this.userIdentifiedObject = new UserIdentifiedObject
        this.personSubstation = new PersonSubstation
        this.attachment = new Attachment
        this.positionPoint = []
        this.userIdentifiedObject = new UserIdentifiedObject
        this.organisationLocation = new OrganisationLocation
        this.userIdentifiedObject = new UserIdentifiedObject
        this.personSubstation = new PersonSubstation
        this.organisationLocation = new OrganisationLocation
        this.psrType = new PsrType
    }
}
export default SubstationEntity