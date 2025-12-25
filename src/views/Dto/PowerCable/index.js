import { UnitSymbol } from "@/views/Enum/UnitSymbol";
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";
import Attachment from "@/views/Flatten/Attachment";
import PropertiesDto from "./Properties";


class PowerCableDTO {
  constructor() {
    this.mrid = null;
    this.properties = new PropertiesDto();
    this.attachment = new Attachment();
    this.oldCableInfoId = ''
    this.assetInfoId = ''
    this.productAssetModelId = ''
    this.lifecycleDateId = ''
    this.locationId = '';
    this.assetPsrId = ''
    this.psrId = ''
    this.attachmentId = ''

    this.configsData = {
      phases: { mrid: '', value: '', unit: 'string' }, // 1 | 3
      cores: { mrid: '', value: '', unit: 'string' },  // Single | Multiple
    };

    this.ratingsData = {
      rated_voltage: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V },
      max_voltage: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V },
      rated_frequency: { mrid: '', value: '', unit: UnitSymbol.Hz },
      shortcircuit: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.A },
      rated_duration: { mrid: '', value: '', unit: UnitSymbol.s }
    };

    this.layersData = {
      conductor: false,
      conductor_shield: false,
      insulation: false,
      insulation_screen: false,
      sheath: false,
      sheath_reinforcing: false,
      concentric_neutral: false,
      armour_bedding: false,
      armour: false,
      oversheath: false,
    };



    this.othersData = {
      insulation_method: { mrid: '', value: '', unit: 'string' },
      bonding_type: { mrid: '', value: '', unit: 'string' },
      install_location: { mrid: '', value: '', unit: 'string' },
      cable_length: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.m }, // km
    };

    this.datasData = {
      conductor: {
        conductor_size: { mrid: '', value: '', unit: UnitSymbol.squareMilliMeter },
        conductor_class: { mrid: '', value: '', unit: 'string' },
        conductor_count: { mrid: '', value: '', unit: 'string' },
        conductor_material: { mrid: '', value: '', unit: 'string' },
        conductor_material_custom: { mrid: '', value: '', unit: 'string' },
        conductor_type: { mrid: '', value: '', unit: 'string' },
        conductor_type_custom: { mrid: '', value: '', unit: 'string' },
        conductor_diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
      },
      insulation: {
        insulation_type: { mrid: '', value: '', unit: 'string' },
        insulation_type_custom: { mrid: '', value: '', unit: 'string' },
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
        insulation_operating: { mrid: '', value: '', unit: UnitSymbol.degC }, // °C
      },
      sheath_reinforcing: {
        material: { mrid: '', value: '', unit: 'string' },
        material_custom: { mrid: '', value: '', unit: 'string' },
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
        width: { mrid: '', value: '', unit: UnitSymbol.mm },
        lengthOfLay: { mrid: '', value: '', unit: UnitSymbol.mm },
        numOfTapes: { mrid: '', value: '', unit: 'string' },
      },
      armour: {
        material: { mrid: '', value: '', unit: 'string' },
        material_custom: { mrid: '', value: '', unit: 'string' },
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
        layerOfTapes: { mrid: '', value: '', unit: 'string' },
        layerOfTapes_custom: { mrid: '', value: '', unit: 'string' },
        crossSectional: { mrid: '', value: '', unit: UnitSymbol.squareMilliMeter },
      },
      conductor_shield: {
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
      },
      insulation_screen: {
        material: { mrid: '', value: '', unit: 'string' },
        material_custom: { mrid: '', value: '', unit: 'string' },
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
      },
      concentric_neutral: {
        material: { mrid: '', value: '', unit: 'string' },
        material_custom: { mrid: '', value: '', unit: 'string' },
        construction: { mrid: '', value: '', unit: 'string' },
        construction_custom: { mrid: '', value: '', unit: 'string' },
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
        area: { mrid: '', value: '', unit: UnitSymbol.squareMilliMeter },
        lengthOfLay: { mrid: '', value: '', unit: UnitSymbol.mm },
        numOfWires: { mrid: '', value: '', unit: 'string' },
      },
      oversheath: {
        material: { mrid: '', value: '', unit: 'string' },
        material_custom: { mrid: '', value: '', unit: 'string' },
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
      },
      sheath: {
        multicore: { mrid: '', value: '', unit: '' },
        sheath_type: { mrid: '', value: '', unit: 'string' },
        sheath_type_custom: { mrid: '', value: '', unit: 'string' },
        construction: { mrid: '', value: '', unit: 'string' },
        construction_custom: { mrid: '', value: '', unit: 'string' },
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
      },
      armour_bedding: {
        material: { mrid: '', value: '', unit: 'string' },
        material_custom: { mrid: '', value: '', unit: 'string' },
        thickness: { mrid: '', value: '', unit: UnitSymbol.mm },
        diameter: { mrid: '', value: '', unit: UnitSymbol.mm },
      },

      jointsData: {
        mrid: '',
        rated_u: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V },
        rated_current: { mrid: '', value: '', unit: UnitSymbol.A },
        category: { mrid: '', value: '', unit: 'string' },
        construction: { mrid: '', value: '', unit: 'string' },
        service_condition: { mrid: '', value: '', unit: 'string' },
      },
      terminalsData: {
        mrid: '',
        rated_u: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V },
        bil: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V },
        bsl: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V },
        type: { mrid: '', value: '', unit: 'string' },
        connector_type: { mrid: '', value: '', unit: 'string' },
        service_condition: { mrid: '', value: '', unit: 'string' },
        class: { mrid: '', value: '', unit: 'string' },
      },
      sheathLimitsData: {
        mrid: '',
        rated_voltage_ur: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V },
        max_continuous_operating_voltage: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V },
        nominal_discharge_current: { mrid: '', value: '', unit: UnitSymbol.A },
        high_current_impulse_withstand: { mrid: '', value: '', unit: 'string' },
        long_duration_current_impulse_withstand: { mrid: '', value: '', unit: 'string' },
        short_circuit_withstand: { mrid: '', value: '', unit: 'string' },
      },
    };
  }
}

export default PowerCableDTO;
