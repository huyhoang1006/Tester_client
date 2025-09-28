/**
 * CREATE TABLE "old_current_transformer_info" (
	"mrid"	TEXT NOT NULL,
	"standard"	TEXT,
	"rated_frequency"	TEXT,
	"primary_winding_count"	INTEGER,
	"um_rms"	TEXT,
	"u_withstand_rms"	TEXT,
	"u_lightning_peak"	TEXT,
	"i_cth"	TEXT,
	"i_dynamic_peak"	TEXT,
	"ith_rms"	TEXT,
	"ith_duration"	TEXT,
	"system_voltage"	TEXT,
	"system_voltage_type"	TEXT,
	"bil"	TEXT,
	"rating_factor"	REAL,
	"rating_factor_temp"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("bil") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("i_cth") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("i_dynamic_peak") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("ith_duration") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("ith_rms") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "current_transformer_info"("mrid") on delete cascade,
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rating_factor_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("system_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("u_lightning_peak") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("u_withstand_rms") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("um_rms") REFERENCES "voltage"("mrid")
);
 */
import CurrentTransformerInfo from "../CurrentTransformerInfo";

class OldCurrentTransformerInfo extends CurrentTransformerInfo {
    constructor() {
        super();
        this.standard = null;
        this.rated_frequency = null;
        this.primary_winding_count = null;
        this.um_rms = null;
        this.u_withstand_rms = null;
        this.u_lightning_peak = null;
        this.i_cth = null;
        this.i_dynamic_peak = null;
        this.ith_rms = null;
        this.ith_duration = null;
        this.system_voltage = null;
        this.system_voltage_type = null;
        this.bil = null;
        this.rating_factor = null;
        this.rating_factor_temp = null;
    }

}

export default OldCurrentTransformerInfo;