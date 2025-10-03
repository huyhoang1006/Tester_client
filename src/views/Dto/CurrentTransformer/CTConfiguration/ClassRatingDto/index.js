import { UnitSymbol } from "@/views/Enum/UnitSymbol";
class ClassRatingDto {
    constructor() {
        this.mrid = '';
        this.app = 'chooseApp';
        this.class = '';
        this.wr = {mrid: '', value: '', unit:UnitSymbol.ohm};
        this.kx = '';
        this.re20lsn = '';
        this.k = '';
        this.fs = '';
        this.kssc = '';
        this.ktd = '';
        this.duty = '';
        this.vb = '';
        this.alf = '';
        this.ts = '';
        this.ek = '';
        this.le = '';
        this.e1 = '';
        this.le1 = '';
        this.val = '';
        this.lal = '';
        this.t1 = '';
        this.tal1 = '';
        this.tp = '';
        this.tpts = '';
        this.vk = '';
        this.lk = '';
        this.vk1 = '';
        this.lk1 = '';
        this.rated_burden = {mrid: '', value: '', unit:UnitSymbol.VA};
        this.extended_burden = false;
        this.burden = {mrid: '', value: '', unit:UnitSymbol.VA};
        this.burdenCos = '';
        this.operatingBurden = {mrid: '', value: '', unit:UnitSymbol.VA};
        this.operatingBurdenCos = '';
    }
}

export default ClassRatingDto;