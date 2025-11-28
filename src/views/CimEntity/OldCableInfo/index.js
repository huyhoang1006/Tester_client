import Voltage from "../Voltage";
import Frequency from "../Frequency";
import CurrentFlow from "../CurrentFlow";
import Seconds from "../Seconds";
import Length from "../Length";
import Temperature from "../Temperature";
class OldCableInfo {
    constructor() {
        this.mRID = null
                this.ratedU = new Voltage();
                this.maxU = null;
                this.ratedFrequency = new Frequency();
                this.shortCircuitCurrent = new CurrentFlow();
                this.ratedDurationShortCircuit = new Seconds();
                this.installationMethod = null;
                this.bondingType = null;
                this.installLocation = null;
                this.length = new Length();
                this.conductorSize = null;
                this.conductorClass = null;
                this.conductorType = null;
                this.nominalConductorDiameter = new Length();
                this.conductorShieldThickness = new Length();
                this.diameterOverShield = new Length();
                this.sheathMulticore = null;
                this.sheathContruction = null;
                this.sheathThickness = new Length();
                this.diameterOverSheath = new Length();
                this.insulationMaxOperatingTemp = new Temperature();
                this.screenMaterial = null;
                this.screenThickness = new Length();
                this.armourBeddingMaterial = null;
                this.armourBeddingThickness = new Length();
                this.diameterBeddingOverArmour = new Length();
                this.sheathReinforcingMaterial = null;
                this.sheathReinforcingThickness = new Length();
                this.diameterOverSheathReinforcing = new Length();
                this.sheathReinforcingWidth = new Length();
                this.sheathReinforcingLengthLay = new Length();
                this.sheathReinforcingNoTape = null;
                this.armourMaterial = null;
                this.armourThickness = new Length();
                this.armourLayerTape = null;
                this.armourCrossSectionalAreaTap = null;
                this.jacketThickness = new Length();
                this.concentricThickness = new Length();
                this.concentricContruction = null;
                this.concentricMaterial = null;
                this.concentricLengthLay = new Length();
                this.concentricArea = null;
                this.concentricNoOfWires = null;
                this.cableInfoId = null;
                this.phaseCount = null;
                this.coreCount = null;
                this.sheathType = null;
                this.diameterOverArmour = new Length();

    }
}

export default OldCableInfo