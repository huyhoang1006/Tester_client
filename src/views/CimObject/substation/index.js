import Substation from "@/views/CimEntity/Substation"
import StreetAddress from "@/views/CimEntity/StreetAddress"
import StreetDetail from "@/views/CimEntity/StreetDetail"
import TownDetail from "@/views/CimEntity/TownDetail"
import Location from "@/views/CimEntity/Location"
import EletronicAddress from "@/views/CimEntity/ElectronicAddress"
import TelephoneNumber from "@/views/CimEntity/TelephoneNumber"
import Person from "@/views/CimEntity/Person"
import PersonRole from "@/views/CimEntity/PersonRole"
import User from "@/views/Flatten/User"
import PersonSubstation from "@/views/Flatten/PersonSubstation"
import Attachment from "@/views/Flatten/Attachment"
import UserIdentifiedObject from "@/views/Flatten/UserIdentifiedObject"
import OrganisationLocation from "@/views/Flatten/OrganisationLocation"
import PsrType from "@/views/CimEntity/PsrType"
import OrganisationPerson from "@/views/Flatten/OrganisationPerson"
import OrganisationPsr from "@/views/Flatten/OrganisationPsr"

class SubstationCimObject {
    constructor() {
        this.name = null; // String
        this.mRID = null;
        this.aliasNames = null; // Array of String
        this.description = null; // String

        this.substation = new Substation();
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
        this.organisationPerson = new OrganisationPerson
        this.psrType = new PsrType
        this.organisationPsr = new OrganisationPsr
        this.configurationEvent = []


    }
}

export default SubstationCimObject;