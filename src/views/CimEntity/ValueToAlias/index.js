import IdentifiedObject from "../IdentifiedObject";
import ValueAliasSet from "../ValueAliasSet";

class ValueToAlias extends IdentifiedObject {
    constructor() {
        super();
                this.value = null;
                this.valueAliasSet = new ValueAliasSet(); // Alias for the value
    }
}

export default ValueToAlias;