/**
 * 	"mrid"	TEXT NOT NULL,
    "tap_count"	INTEGER,
    "common_tap"	INTEGER,
    "core_application"	TEXT,
    "core_class"	TEXT,
    "fs"	TEXT,
    "alf"	TEXT,
    "winding_resistance"	TEXT,
    "ts"	TEXT,
    "ek"	TEXT,
    "e1"	TEXT,
    "ie"	TEXT,
    "ie1"	TEXT,
    "kssc"	TEXT,
    "val"	TEXT,
    "tp"	TEXT,
    "iai"	TEXT,
    "k"	TEXT,
    "ktd"	TEXT,
    "duty"	TEXT,
    "kx"	TEXT,
    "current_transformer_info_id"	TEXT,
    "ex"	TEXT,
    "vb"	TEXT,
    "vk"	TEXT,
    "vk1"	TEXT,
    "ik"	TEXT,
    "ik1"	TEXT,
    "ratio_error"	TEXT,
    "core_index"	TEXT,
    PRIMARY KEY("mrid"),
    FOREIGN KEY("current_transformer_info_id") REFERENCES "current_transformer_info"("mrid"),
    FOREIGN KEY("ratio_error") REFERENCES "percent"("mrid"),
    FOREIGN KEY("vb") REFERENCES "voltage"("mrid"),
    FOREIGN KEY("winding_resistance") REFERENCES "resistance"("mrid")
 */

class CtCoreInfo {
    constructor() {
        this.mrid = null;
        this.tap_count = null;
        this.common_tap = null;
        this.core_application = null;
        this.core_class = null;
        this.fs = null;
        this.alf = null;
        this.winding_resistance = null;
        this.ts = null;
        this.ek = null;
        this.e1 = null;
        this.ie = null;
        this.ie1 = null;
        this.kssc = null;
        this.val = null;
        this.tp = null;
        this.iai = null;
        this.k = null;
        this.ktd = null;
        this.duty = null;
        this.kx = null;
        this.current_transformer_info_id = null;
        this.ex = null;
        this.vb = null;
        this.vk = null;
        this.vk1 = null;
        this.ik = null;
        this.ik1 = null;
        this.ratio_error = null;
        this.core_index = null;
    }
}

export default CtCoreInfo;