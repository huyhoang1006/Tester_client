import CurrentFlow from "../CurrentFlow";
import Voltage from "../Voltage";
/**
 * CREATE TABLE "current_transformer_info" (
	"mrid"	TEXT NOT NULL,
	"accuracy_class"	TEXT,
	"accuracy_limit"	TEXT,
	"core_count"	INTEGER,
	"ct_class"	TEXT,
	"knee_point_current"	TEXT,
	"knee_point_voltage"	TEXT,
	"max_ratio"	TEXT,
	"nominal_ratio"	TEXT,
	"primary_fls_rating"	TEXT,
	"primary_ratio"	TEXT,
	"rated_current"	TEXT,
	"secondary_fls_rating"	TEXT,
	"secondary_ratio"	TEXT,
	"tertiary_fls_rating"	TEXT,
	"tertiary_ratio"	TEXT,
	"usage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("accuracy_limit") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("knee_point_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("knee_point_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("max_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("nominal_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("primary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("primary_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("secondary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("secondary_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("tertiary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("tertiary_ratio") REFERENCES "ratio"("mrid")
);
 */
class CurrentTransformerInfo {
    constructor() {
        this.mRID = null;
                this.accuracyClass = null;
                this.accuracyLimit = null;
                this.coreCount = null;
                this.ctClass = null;
                this.kneePointCurrent = new CurrentFlow();
                this.kneePointVoltage = new Voltage();
                this.maxRatio = null;
                this.nominalRatio = null;
                this.primaryFlsRating = null;
                this.primaryRatio = null;
                this.ratedCurrent = new CurrentFlow();
                this.secondaryFlsRating = null;
                this.secondaryRatio = null;
                this.tertiaryFlsRating = null;
                this.tertiaryRatio = null;
                this.usage = null;
    }
}

export default CurrentTransformerInfo;