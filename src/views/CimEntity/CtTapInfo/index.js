import Percent from "../Percent";
/**
 * CREATE TABLE "ct_tap_info" (
	"mrid"	TEXT NOT NULL,
	"tap_name"	TEXT,
	"ipn"	TEXT,
	"isn"	TEXT,
	"in_use"	TEXT,
	"rated_burden"	TEXT,
	"burden"	TEXT,
	"extended_burden"	TEXT,
	"burden_power_factor"	TEXT,
	"operating_burden"	TEXT,
	"operating_burden_power_factor"	TEXT,
	"ct_core_info_id"	TEXT,
	"type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("burden") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("ct_core_info_id") REFERENCES "ct_core_info"("mrid"),
	FOREIGN KEY("ipn") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("isn") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("operating_burden") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("rated_burden") REFERENCES "apparent_power"("mrid")
);
 */

class CtTapInfo {
    constructor() {
        this.mRID = null;
                this.tapName = null;
                this.ipn = null;
                this.isn = null;
                this.inUse = null;
                this.ratedBurden = null;
                this.burden = null;
                this.extendedBurden = null;
                this.burdenPowerFactor = new Percent();
                this.operatingBurden = null;
                this.operatingBurdenPowerFactor = new Percent();
                this.ctCoreInfoId = null;
                this.type = null;
    }

}

export default CtTapInfo;