<template> 
<div>
  <div class="export-view" style="gap: 10px;">
    <el-select v-model="exportTypeSelected" placeholder="Select" size="mini"></el-select>
    <el-button @click="addRow()" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">Add Row</el-button>
    <el-button @click="uploadPdfFile()" v-if="this.exportType === 'pdf'" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">PDF File</el-button>
    <el-button @click="uploadExcelFile()" v-if="this.exportType === 'excel'" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">Excel File</el-button>
    <el-button @click="uploadXmlFile()" v-if="this.exportType === 'xml'" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">XML File</el-button>
    <el-button @click="uploadWordFile()" v-if="this.exportType === 'word'" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">Word File</el-button>
    <el-button @click="removeRow()" type="danger" size="mini" style="margin-left: 10px;margin-right: 20px;">Delete</el-button>
    <el-button type="primary" size="mini" style="margin-left: 10px;margin-right: 20px;">Import</el-button>
    <el-button type="primary" size="mini" style="margin-left: 10px;margin-right: 20px;">Export</el-button>
    <el-button type="primary" size="mini" style="margin-left: 10px;margin-right: 20px;">Refresh</el-button>
  </div>
  <div> 
    <table border="1" cellpadding="8" width="100%" style="border-collapse: collapse; margin-top: 10px; table-layout: fixed;">
    <thead>
      <tr>
        <th>Code</th>
        <th>Category</th>
        <th>Feature</th>
        <th style="width: 50px;">
          <el-button @click="addRow()" size="mini" type="primary">
            <i class="fa-solid fa-plus"></i>
          </el-button>
        </th>
        <th style="width: 50px;">
          <el-button @click="clearAll" size="mini" type="danger">
            <i class="fa-solid fa-trash"></i>
          </el-button>
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row, index) in tableData" :key="index">
        <td>
          <el-input v-model="row.code" placeholder="Input" size="mini"></el-input>
        </td>
        
        <td>
        <el-select
          v-model="row.category"
          size="mini"
          style="width:100%"
          @change="() => {
          row.featureLevels = [{}] // khởi tạo level 0
          }"
        >
          <el-option
            v-for="c in categoryOptions"
            :key="c.value"
            :label="c.label"
            :value="c.value"
          />
        </el-select>
        </td>
        
        <td>
          <div
            v-for="(level, levelIndex) in row.featureLevels"
            :key="levelIndex"
            style="margin-bottom: 4px;"
          >
            <el-select
              v-model="level.key"
              size="mini"
              style="width:100%"
              placeholder="Select feature"
              @change="onFeatureLevelChange(row, levelIndex)"
            >
              <el-option
                v-for="opt in getFeatureOptionsByLevel(row, levelIndex)"
                :key="opt.key"
                :label="opt.label"
                :value="opt.key"
              />
            </el-select>
          </div>
        </td>

        <td>
          <el-button  @click="addRow(index)" type="primary" size="mini" style="width: 100%">
            <i class="fa-solid fa-plus"></i>
          </el-button>
        </td>
        <td>
          <el-button @click="removeRow(index)" type="danger" size="mini" style="width: 100%">
            <i class="fa-solid fa-trash"></i>
          </el-button>
        </td>
      </tr>
    </tbody>
    </table>
  </div>
</div>
</template> 
<script>
export default {
    name: 'ExportView',
    props: {
        exportType: {
            type: String,
            required: true
        }
    },
    data() {
      return {
        exportTypeSelected: '',
        categoryOptions: [
          {
            label: "Organisation",
            value: "OrgEntityToOrgDto"
          },
          {
            label: "Substation",
            value: "SubstationDto"
          },
          {
            label: "Voltage level",
            value: "VoltageLevelDto"
          },
          {
            label: "Bay",
            value: "Bay"
          },
          {
            label: "Asset",
            value: "Asset"
          }
        ],

        FEATURE_TREE : { 
          OrgEntityToOrgDto: {
            label: "Organisation",
            children: {
              name: {
                label: "Name",
                value: "name"
              },
              tax_code: {
                label: "Tax code",
                value: "tax_code"
              },
              street: {
                label: "Street",
                value: "street"
              },
              ward_or_commune: {
                label: "Ward / Commune",
                value: "ward_or_commune"
              },
              district_or_town: {
                label: "District / Town",
                value: "district_or_town"
              },
              city: {
                label: "City",
                value: "city"
              },
              state_or_province: {
                label: "State / Province",
                value: "state_or_province"
              },
              country: {
                label: "Country",
                value: "country"
              },
              phone_number: {
                label: "Phone number",
                value: "phone_number"
              },
              fax: {
                label: "Fax",
                value: "fax"
              },
              email: {
                label: "Email",
                value: "email"
              },
              comment: {
                label: "Comment",
                value: "comment"
              },
              positionPoints: {
                label: "Geo position",
                children: {
                  x: { label: "Position X", value: "x" },
                  y: { label: "Position Y", value: "y" },
                  z: { label: "Position Z", value: "z" }
                }
              }
            }
          },
          SubstationDto: {
            label: "Subtation",
            children: {
              name: { 
                label: "Name", 
                value: "name" 
              },
              type: { 
                label: "Substation", 
                value: "type" 
              },
              generation: { 
                label: "Generation", 
                value: "generation"
              },
              industry: { 
                label: "Industry", 
                value: "industry"
              },
              locationName: { 
                label: "Location name", 
                value: "locationName"
              },
              street:{ 
                label: "Street", 
                value: "street"
              },
              ward_or_commune: {
                label: "Ward/ Commune", 
                value: "ward_or_commune"
              },
              district_or_town: { 
                label: "District/ Town", 
                value: "district_or_town"
              },
              state_or_province: { 
                label: "State/ Province", 
                value: "state_or_province"
              },
              city: { 
                label: "City", 
                value: "city"
              },
              country: { 
                label: "Country", 
                value: "country"
              },
              personName: { 
                label: "Name", 
                value: "personName"
              },
              phoneNumber: { 
                label: "Phone number", 
                value: "phoneNumber"
              },
              fax: { 
                label: "Fax", 
                value: "fax"
              },
              email: { 
                label: "Email", 
                value: "email"
              },
              department: { 
                label: "Department", 
                value: "department"
              },
              position: { 
                label: "Position", 
                value: "position"
              },
              comment: { 
                label: "Comment", 
                value: "comment"
              },
              positionPoints: {
                label: "Geo position",
                children: {
                  x: { label: "Position X", value: "x" },
                  y: { label: "Position Y", value: "y" },
                  z: { label: "Position Z", value: "z" }
                }
              }
            }
          },
          VoltageLevelDto: {
            label: "Voltage Level",
            children: {
              name: {
                label: "Name",
                value: "name"
              },
              high_voltage_limit_value: {
                label: "High voltage limit",
                value: "high_voltage_limit_value",
                children: {
                  high_voltage_limit_unit: {
                    label: "High voltage limit unit",
                    value: "high_voltage_limit_unit"
                  },
                  high_voltage_limit_multiplier: {
                    label: "High voltage limit multiplier",
                    value: "high_voltage_limit_multiplier"
                  },
                }
              },
              low_voltage_limit_value: {
                label: "Low voltage limit", 
                value: "low_voltage_limit_value",
                children: {
                  low_voltage_limit_unit: {
                    label: "Low voltage limit unit",
                    value: "low_voltage_limit_unit"
                  },
                  low_voltage_limit_multiplier: {
                    label: "Low voltage limit multiplier",
                    value: "low_voltage_limit_multiplier"
                  },
                }
              },
              base_voltage_value: {
                label: "Base voltage",
                value: "base_voltage_value",
                children: {
                  base_voltage_unit: {
                    label: "Base voltage unit",
                    value: "base_voltage_unit"
                  },
                  base_voltage_multiplier: {
                    label: "Base voltage multiplier",
                    value: "base_voltage_multiplier"
                  }
                }
              },
              comment: {
                label: "Comment",
                value: "comment" 
              }
            }                            
          },
          Bay: {
            label: "Bay",
            children: {
              name: {
                label: "Name",
                value: "name"
              },
              breakerConfiguration: {
                label: "Breaker configuration",
                value: "breakerConfiguration"
              },
              busBarConfiguration: {
                label: "Bus Bar configuration",
                value: "busBarConfiguration"
              },
              comment: {
                label: "Comment",
                value: "comment"
              }
            }
          },
          Asset: {
            label: "Asset",
            children: {
              TransformerDataDto: {
                label:  "Transformer",
                children: {
                  BushingDto: {
                    label: "Bushing",
                      children:{
                        pos: { 
                          label: "Pos", 
                          value: "pos" 
                        },
                        asset_type: { 
                          label: "Asset type", 
                          value: "asset_type"
                        },
                        serial_no: { 
                          label: "Serial no.", 
                          value: "serial_no"
                        },
                        manufacturer: { 
                          label: "Manufacturer", 
                          value: "manufacturer"
                        },
                        manufacturer_type: { 
                          label: "Manufacturer type", 
                          value: "manufacturer_type"
                        },
                        manufacturer_year: { 
                          label: "Manufacturer year", 
                          value: "manufacturer_year"
                        },
                        insulation_level: { 
                          label: "Insul. level LL (BIL)", 
                          value: "insulation_level"
                        },
                        voltage_l_ground: { 
                          label: "Voltage L-ground", 
                          value: "voltage_l_ground"
                        },
                        max_system_voltage: { 
                          label: "Max. system voltage", 
                          value: "max_system_voltage"
                        },
                        rate_current: { 
                          label: "Rate current", 
                          value: "rate_current"
                        },
                        df_c1: { 
                          label: "DF (C1)", 
                          value: "df_c1"
                        },
                        cap_c1: { 
                          label: "Cap. (C1)", 
                          value: "cap_c1"
                        },
                        df_c2: { 
                          label: "DF (C2)", 
                          value: "df_c2"
                        },
                        cap_c2: { 
                          label: "Cap. (C2)", 
                          value: "cap_c2"
                        },
                        insulation_type: { 
                          label: "Insulation type", 
                          value: "insulation_type"
                        }
                      },
                  },
                  impedancesDto: {
                    label: " Impedances",
                    children: {
                      ref_temp:{
                        label: "Ref. temp",
                        value: "ref_temp"
                      },
                      zero_sequence_impedance: {
                        label: "Zero sequence impedance",
                        children: {
                          base_power: { 
                            label: "Base power", 
                            value: "base_power"
                          },
                          base_voltage: { 
                            label: "Base voltage", 
                            value: "base_voltage"
                          },
                          zero_percent: { 
                            label: "Zero sequence Z0(%)", 
                            value: "zero_percent",
                            children: {
                              prim: { 
                                label: "Prim", 
                                value: "prim"
                              },
                              sec: { 
                                label: "Sec", 
                                value: "sec"
                              }
                          }
                        }
                        }
                      },
                      prim_sec: {
                        label: "Short-circuit impedance Prim-Sec",
                        children: {
                          short_circuit_impedances_uk: { 
                            label: "Impedance (uk)", 
                            value: "short_circuit_impedances_uk"
                          },
                          base_power: { 
                            label: "Base power", 
                            value: "base_power", 
                          },
                          base_voltage: { 
                            label: "Base voltage", 
                            value: "base_voltage"
                          },
                          load_losses_pk: { 
                            label: "Load losses (pk)", 
                            value: "load_losses_pk"
                          },
                          oltc_position: { 
                            label: "OLTC position", 
                            value: "oltc_position"
                          },
                          detc_position: { 
                            label: "DETC position", 
                            value: "detc_position"
                          }
                        }
                      },
                      prim_tert: {
                        label: "Short-circuit impedance Prim-Tert",
                        children: {
                          short_circuit_impedances_uk: {
                            label: "Impedance (uk)", 
                            value: "short_circuit_impedances_uk"
                          },
                          base_power: {
                            label: "Base power", 
                            value: "base_power"
                          },  
                          base_voltage: {
                            label: "Base voltage", 
                            value: "base_voltage"
                          },
                          load_losses_pk: {
                            label: "Load losses (pk)", 
                            value: "load_losses_pk"
                          },
                          oltc_position: { 
                            label: "OLTC position", 
                            value: "oltc_position"
                          },
                          detc_position: { 
                            label: "DETC position", 
                            value: "detc_position"
                          },
                        }
                      },
                      sec_tert: {
                        label: "Short-circuit impedance Sec-Tert",
                        children: {
                          short_circuit_impedances_uk: {
                            label: "Impedance (uk)", 
                            value: "short_circuit_impedances_uk"
                          },
                          base_power: {
                            label: "Base power", 
                            value: "base_power"
                          },
                          base_voltage: {
                            label: "Base voltage", 
                            value: "base_voltage"
                          },
                          load_losses_pk: { 
                            label: "Load losses (pk)", 
                            value: "load_losses_pk"
                          },
                          oltc_position: { 
                            label: "OLTC position", 
                            value: "oltc_position"
                          },
                          detc_position: { 
                            label: "DETC position", 
                            value: "detc_position"
                          }
                        }
                      }
                    }
                  },
                  OthersDto: {
                    label: "Other",
                    children: {
                      category: {
                        label: "Category",
                        value: "category"
                      },
                      status: {
                        label: "Status",
                        value: "status"
                      },
                      tank_type: {
                        label: "Tank type",
                        value: "tank_type"
                      },
                      insulation_medium: {
                        label: "Insulation medium",
                        value: "insulation_medium"
                      },
                      insulation: {
                        label: "Insulation",
                        children: {
                          weight: {
                            label: "Weight", 
                            value: "weight"
                          },
                          volume: { 
                            label: "Volume", 
                            value: "volume"
                          }
                        }
                      },                          
                      total_weight: {
                        label: "Total weight",
                        value: "total_weight"
                      },
                      winding: {
                        label: "Winding",
                        children: {
                          prim: {
                            label: "Prim",
                            value: "prim"
                          },
                          sec: {
                            label: "Sec",
                            value: "sec"
                          },
                          tert: {
                            label: "Tert",
                            value: "tert"
                          },
                        }
                      }
                    },
                  },
                  RatingDto: {
                    label: "Ratings",
                    children: {
                      rated_frequency: {
                        label: "Rated frequency",
                        value: "rated_frequency",
                        children: {
                          custom_value: { 
                            label: "Rated frequency", 
                            value: "custom_value" 
                          }
                        }
                      },
                      voltage_ratings: {
                        label: "Voltage ratings",
                        children: {
                          winding: { 
                            label: "Winding", 
                            value: "winding" 
                          },
                          voltage_ll: { 
                            label: "Voltage L-L", 
                            value: "voltage_ll" 
                          },
                          voltage_ln: { 
                            label: "Voltage L-N", 
                            value: "voltage_ln" 
                          },
                          insul_level_ll: { 
                            label: "Voltage L-N*", 
                            value: "insul_level_ll" 
                          },
                          voltage_regulation: { 
                            label: "Insul. level L-L(BIL)", 
                            value: "voltage_regulation" 
                          },
                          insulation_class: { 
                            label: "Insulation Class", 
                            value: "insulation_class" 
                          }
                        }
                      },
                      power_ratings: {
                        label: "Power ratings",
                        children: {
                          rated_power: { 
                            label: "Rated power", 
                            value: "rated_power" 
                          },
                          cooling_class: { 
                            label: "Cooling class", 
                            value: "cooling_class" 
                          },
                          temp_rise_wind: { 
                            label: "Temp. rise wind.", 
                            value: "temp_rise_wind" }
                          }
                      },
                      current_ratings: {
                        label: "Current ratings at rated power",
                        children: {
                          prim: { 
                            label: "Prim", 
                            value: "prim" 
                          },
                          sec: { 
                            label: "Sec", 
                            value: "sec" 
                          },
                          tert: { 
                            label: "Tert", 
                            value: "tert" 
                          }
                        }
                      },
                      short_circuit: {
                        label: "Short-circuit rating",
                        children: {
                          ka: {
                            label: "Max short-circuit current", 
                            value: "ka" 
                          },
                          s: { 
                            label: "Max short-circuit current", 
                            value: "s" 
                          }
                        }
                      }
                    }
                  },
                  TapChangersDto: {
                    label: "Tap changer",
                    value: "TapChangersDto",
                    children: {
                      mode: {
                        label: "Mode",
                        value: "mode"
                      },
                      serial_no: {
                        label: "Serial no.",
                        value: "serial_no"
                      },
                      manufacturer: {
                        label: "Manufacturer",
                        value: "manufacturer"
                      },
                      manufacturer_type: {
                        label: "Manufacturer type",
                        value: "manufacturer_type"
                      },
                      winding: {
                        label: "Winding",
                        value: "winding"
                      },
                      tap_scheme: {
                        label: "Tap scheme",
                        value: "tap_scheme"
                      },
                      no_of_taps: {
                        label: "Num of taps",
                        value: "no_of_taps"
                      },
                      voltage_table: {
                        label: "Voltage table",
                        value: "voltage_table"
                      }
                    }
                  },
                  SurgeArresterDto: {
                    label: "Surge Arrester",
                    value: "SurgeArresterDto"
                  },    
                  PropertiesDto: {
                    label: "Properties",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      },
                      model: { 
                        label: "Model", 
                        value: "model"
                      }
                    }
                  },
                  WindingConfigurationDto: {
                    label: "Winding configuration",
                    children: {
                      phases: {
                        label: "Phases",
                        value: "phases"
                      },
                      vector_group: {
                        label: "Vector group",
                        value: "vector_group",
                        children: {
                          prim: {
                            label: "Prim",
                            value: "prim"
                          },
                          sec: {
                            label: "Sec",
                            value: "sec"
                          },
                          tert: {
                            label: "Tert",
                            value: "tert"
                          },
                        }
                      },
                      unsupported_vector_group: {
                        label: "Unsupported vector group",
                        value: "vector_group"
                      },
                      vector_group_data: {
                        label: "Vector group data",
                        value: "vector_group_data"
                      },
                      vector_group_custom: {
                        label: "Vector group",
                        value: "vector_group_custom"
                      }
                    }
                  }
                }
              },
              BushingAssetDto: {
                label: "Bushing",
                children: {
                  BushingAssetDto: {
                    label: "Bushing",
                    children:{
                        rated_frequency: { 
                          label: "Rated frequency", 
                          value: "rated_frequency" 
                        },
                        insulation_level: { 
                          label: "Insul. level LL (BIL)", 
                          value: "insulation_level"
                        },
                        voltage_l_ground: { 
                          label: "Voltage L-ground", 
                          value: "voltage_l_ground"
                        },
                        max_system_voltage: { 
                          label: "Max. system voltage", 
                          value: "max_system_voltage"
                        },
                        rated_current: { 
                          label: "Rated current", 
                          value: "rated_current"
                        },
                        df_c1: { 
                          label: "DF (C1)", 
                          value: "df_c1"
                        },
                        cap_c1: { 
                          label: "Cap. (C1)", 
                          value: "cap_c1"
                        },
                        df_c2: { 
                          label: "DF (C2)", 
                          value: "df_c2"
                        },
                        cap_c2: { 
                          label: "Cap. (C2)", 
                          value: "cap_c2"
                        },
                        insulation_type: { 
                          label: "Insul. type", 
                          value: "insulation_type"
                        }
                      },
                  },
                  PropertiesDto: {
                    label: "Properties",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      },
                    }
                  },
                }
              },
              CircuitBreakerDto: {
                label: "Breaker",
                value: "CircuitBreakerDto",
                children: {
                  PropertiesDto: {
                    label: "Properties",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      },
                    }
                  },
                  AssessmentLimitsDto: {
                    label: "Assessment limits",
                    value: "AssessmentLimitsDto",
                    children: {
                      contact_resistance: {
                        label: "Contact resistance",
                        value: "contact_resistance",
                        children: {
                          name: {
                            label: "Name",
                            value: "name"
                          },
                          abs: {
                            label: "Absolute",
                            value: "abs",
                            children: {
                              r_min: {
                                label: "R min",
                                value: "r_min"
                              },
                              r_max: {
                                label: "R max",
                                value: "r_max"
                              }
                            }
                          },
                          rel: {
                            label: "Relative",
                            value: "rel",
                            children: {
                              r_ref: {
                                label: "R ref",
                                value: "r_ref"
                              },
                              r_dev: {
                                label: "R dev",
                                value: "r_dev"
                              }
                            }
                          }
                        }
                      },
                      operating_time: {
                        label: "Operating time",
                        value: "operating_time",
                        children: {
                          abs: {
                            label: "Absolute",
                            value: "abs",
                            children: {
                              opening_time: {
                                label: "Opening time",
                                value: "opening_time",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                }
                                },
                              },
                              opening_sync_within_phase: {
                                label: "Opening sync. (contacts within a phase)",
                                value: "opening_sync_within_phase",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                  }
                                },
                              },
                              opening_sync_breaker_phase: {
                                label: "Opening sync. (between breaker phases)",
                                value: "opening_sync_breaker_phase",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                  }
                                }
                              },
                              closing_time: {
                                label: "Closing time",
                                value: "closing_time",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                  }
                                }
                              },
                              closing_sync_within_phase: {
                                label: "Closing sync. (contacts within a phase)",
                                value: "closing_sync_within_phase",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                  }
                                }
                              },
                              closing_sync_breaker_phase: {
                                label: "Closing sync. (between breaker phases)",
                                value: "closing_sync_breaker_phase",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                  }
                                },
                              },
                              reclosing_time: {
                                label: "Reclosing time",
                                value: "reclosing_time",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                  }
                                }
                              },
                              close_open_time: {
                                label: "Close-Open time",
                                value: "close_open_time",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                  }
                                }
                              },
                              open_close_time: {
                                label: "Open-Close time",
                                value: "open_close_time",
                                children: {
                                  t_min: {
                                    label: "t min",
                                    value: "t_min"
                                  },
                                  t_max: {
                                    label: "t max",
                                    value: "t_max"
                                    }
                                  }
                              }
                            }
                          },
                          rel: {
                            label: "Relative",
                            value: "rel",
                            children: {
                              opening_time: {
                                label: "Opening time",
                                value: "opening_time",
                                children: {
                                  t_ref: {
                                    label: "t ref",
                                    value: "t_ref"
                                  },
                                  plus_t_dev: {
                                    label: "+ t dev",
                                    value: "plus_t_dev"
                                  },
                                  minus_t_dev: {
                                    label: "- t dev",
                                    value: "minus_t_dev"
                                  }
                                }
                              },
                              opening_sync_within_phase: {
                                label: "Opening sync. (contacts within a phase)",
                                value: "opening_sync_within_phase",
                                children: {
                                  t_ref: {
                                    label: "t ref",
                                    value: "t_ref"
                                  },
                                  plus_t_dev: {
                                    label: "+ t dev",
                                    value: "plus_t_dev"
                                  },
                                  minus_t_dev: {
                                    label: "- t dev",
                                    value: "minus_t_dev"
                                  }
                                }
                              },
                              opening_sync_breaker_phase: {
                                label: "Opening sync. (between breaker phases)",
                                value: "opening_sync_breaker_phase",
                                children: {
                                    t_ref: {
                                      label: "t ref",
                                      value: "t_ref"
                                    },
                                    plus_t_dev: {
                                      label: "+ t dev",
                                      value: "plus_t_dev"
                                    },
                                    minus_t_dev: {
                                      label: "- t dev",
                                      value: "minus_t_dev"
                                    }
                                  }
                              },
                              closing_time: {
                                label: "Closing time",
                                value: "closing_time",
                                children: {
                                    t_ref: {
                                      label: "t ref",
                                      value: "t_ref"
                                    },
                                    plus_t_dev: {
                                      label: "+ t dev",
                                      value: "plus_t_dev"
                                    },
                                    minus_t_dev: {
                                      label: "- t dev",
                                      value: "minus_t_dev"
                                    }
                                  }
                              },
                              closing_sync_within_phase: {
                                label: "Closing sync. (contacts within a phase)",
                                value: "closing_sync_within_phase",
                                children: {
                                    t_ref: {
                                      label: "t ref",
                                      value: "t_ref"
                                    },
                                    plus_t_dev: {
                                      label: "+ t dev",
                                      value: "plus_t_dev"
                                    },
                                    minus_t_dev: {
                                      label: "- t dev",
                                      value: "minus_t_dev"
                                    }
                                  }
                              },
                              closing_sync_breaker_phase: {
                                label: "Closing sync. (between breaker phases)",
                                value: "closing_sync_breaker_phase",
                                children: {
                                  t_ref: {
                                    label: "t ref",
                                    value: "t_ref"
                                  },
                                  plus_t_dev: {
                                    label: "+ t dev",
                                    value: "plus_t_dev"
                                  },
                                  minus_t_dev: {
                                    label: "- t dev",
                                    value: "minus_t_dev"
                                  }
                                }
                              },
                              reclosing_time: {
                                label: "Reclosing time",
                                value: "reclosing_time",
                                children: {
                                    t_ref: {
                                      label: "t ref",
                                      value: "t_ref"
                                    },
                                    plus_t_dev: {
                                      label: "+ t dev",
                                      value: "plus_t_dev"
                                    },
                                    minus_t_dev: {
                                      label: "- t dev",
                                      value: "minus_t_dev"
                                    }
                                  }
                              },
                              close_open_time: {
                                label: "Close-Open time",
                                value: "close_open_time",
                                children: {
                                    t_ref: {
                                      label: "t ref",
                                      value: "t_ref"
                                    },
                                    plus_t_dev: {
                                      label: "+ t dev",
                                      value: "plus_t_dev"
                                    },
                                    minus_t_dev: {
                                      label: "- t dev",
                                      value: "minus_t_dev"
                                    }
                                  }
                              },
                              open_close_time: {
                                label: "Open-Close time",
                                value: "open_close_time",
                                children: {
                                    t_ref: {
                                      label: "t ref",
                                      value: "t_ref"
                                    },
                                    plus_t_dev: {
                                      label: "+ t dev",
                                      value: "plus_t_dev"
                                    },
                                    minus_t_dev: {
                                      label: "- t dev",
                                      value: "minus_t_dev"
                                    }
                                  }
                              }
                            }
                          }
                        }
                      },
                      contact_travel: {
                        label: "Contact travel",
                        value: "contact_travel",
                        children: {
                          abs: {
                            label: "Absolute",
                            value: "abs",
                            children: {
                              total_travel: {
                                label: "Total travel, TT",
                                value: "total_travel",
                                children: {
                                  d_min: {
                                    label: "d min",
                                    value: "d_min"
                                  },
                                  d_max: {
                                    label: "d max",
                                    value: "d_max"
                                  }
                                }
                              },
                              over_travel_trip: {
                                label: "Over travel (Trip), OT",
                                value: "over_travel_trip",
                                children: {
                                  d_min: {
                                    label: "d min",
                                    value: "d_min"
                                  },
                                  d_max: {
                                    label: "d max",
                                    value: "d_max"
                                  }
                                }
                              },
                              over_travel_close: {
                                label: "Over travel (Close), OT",
                                value: "over_travel_close",
                                children: {
                                  d_min: {
                                    label: "d min",
                                    value: "d_min"
                                  },
                                  d_max: {
                                    label: "d max",
                                    value: "d_max"
                                  }
                                },
                              },
                              rebound_trip: {
                                label: "Rebound (Trip), RB",
                                value: "rebound_trip",
                                children: {
                                  d_min: {
                                    label: "d min",
                                    value: "d_min"
                                  },
                                  d_max: {
                                    label: "d max",
                                    value: "d_max"
                                  }
                                }
                              },
                              rebound_close: {
                                label: "Rebound (Close), RB",
                                value: "rebound_close",
                                children: {
                                  d_min: {
                                    label: "d min",
                                    value: "d_min"
                                  },
                                  d_max: {
                                    label: "d max",
                                    value: "d_max"
                                  }
                                }
                              },
                              contact_wipe_trip: {
                                label: "Contact wipe (Trip), CW",
                                value: "contact_wipe_trip",
                                children: {
                                  d_min: {
                                    label: "d min",
                                    value: "d_min"
                                  },
                                  d_max: {
                                    label: "d max",
                                    value: "d_max"
                                  }
                                }
                              },
                              contact_wipe_close: {
                                label: "Contact wipe (Close), CW",
                                value: "contact_wipe_close",
                                children: {
                                  d_min: {
                                    label: "d min",
                                    value: "d_min"
                                  },
                                  d_max: {
                                    label: "d max",
                                    value: "d_max"
                                  }
                                }
                              },
                              damping_distance: {
                                label: "Damping distance",
                                value: "damping_distance",
                                children: {
                                  d_min: {
                                    label: "d min",
                                    value: "d_min"
                                  },
                                  d_max: {
                                    label: "d max",
                                    value: "d_max"
                                  }
                                }
                              }
                            }
                          },
                          rel: {
                            label: "Relative",
                            value: "rel",
                            children: {
                              total_travel: {
                                label: "Total travel, TT",
                                value: "total_travel",
                                children: {
                                  d_ref: {
                                    label: "d ref",
                                    value: "d_ref"
                                  },
                                  d_dev: {
                                    label: "d dev",
                                    value: "d_dev"
                                  }
                                }
                              },
                              over_travel_trip: {
                                label: "Over travel (Trip), OT",
                                value: "over_travel_trip",
                                children: {
                                  d_ref: {
                                    label: "d ref",
                                    value: "d_ref"
                                  },
                                  d_dev: {
                                    label: "d dev",
                                    value: "d_dev"
                                  }
                                }
                              },
                              over_travel_close: {
                                label: "Over travel (Close), OT",
                                value: "over_travel_close",
                                children: {
                                  d_ref: {
                                    label: "d ref",
                                    value: "d_ref"
                                  },
                                  d_dev: {
                                    label: "d dev",
                                    value: "d_dev"
                                  }
                                }
                              },
                              rebound_trip: {
                                label: "Rebound (Trip), RB",
                                value: "rebound_trip",
                                children: {
                                  d_ref: {
                                    label: "d ref",
                                    value: "d_ref"
                                  },
                                  d_dev: {
                                    label: "d dev",
                                    value: "d_dev"
                                  }
                                }
                              },
                              rebound_close: {
                                label: "Rebound (Close), RB",
                                value: "rebound_close",
                                children: {
                                  d_ref: {
                                    label: "d ref",
                                    value: "d_ref"
                                  },
                                  d_dev: {
                                    label: "d dev",
                                    value: "d_dev"
                                  }
                                }
                              },
                              contact_wipe_trip: {
                                label: "Contact wipe (Trip), CW",
                                value: "contact_wipe_trip",
                                children: {
                                  d_ref: {
                                    label: "d ref",
                                    value: "d_ref"
                                  },
                                  d_dev: {
                                    label: "d dev",
                                    value: "d_dev"
                                  }
                                }
                              },
                              contact_wipe_close: {
                                label: "Contact wipe (Close), CW",
                                value: "contact_wipe_close",
                                children: {
                                  d_ref: {
                                    label: "d ref",
                                    value: "d_ref"
                                  },
                                  d_dev: {
                                    label: "d dev",
                                    value: "d_dev"
                                  }
                                }
                              },
                              damping_distance: {
                                label: "Damping distance",
                                value: "damping_distance",
                                children: {
                                  d_ref: {
                                    label: "d ref",
                                    value: "d_ref"
                                  },
                                  d_dev: {
                                    label: "d dev",
                                    value: "d_dev"
                                  }
                                }
                              },
                            }

                          }
                        }
                      },
                      auxiliary_contacts: {
                        label: "Auxiliary contacts",
                        value: "auxiliary_contacts",
                        children: {
                          trip_operation: {
                            label: "Trip operation",
                            value: "trip_operation",
                            children: {
                              abs: {
                                label: "Absolute",
                                value: "abs",
                                children: {
                                  switching_time_type_a: {
                                    label: "Switching time (a-type),t switch,a",
                                    value: "switching_time_type_a",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  diff_to_main_type_a: {
                                    label: "diff. to main (a-type),Δt a",
                                    value: "diff_to_main_type_a",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  switching_time_type_b: {
                                    label: "Switching time (b-type),t switch,b",
                                    value: "switching_time_type_b",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  diff_to_main_type_b: {
                                    label: "diff. to main (b-type),Δt b",
                                    value: "diff_to_main_type_b",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  switching_time_wiper: {
                                    label: "Switching time (wiper),t switch,w",
                                    value: "switching_time_wiper",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  duration: {
                                    label: "Duration (wiper),Δt w",
                                    value: "duration",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  }
                                }
                              },
                              rel: {
                                label: "Relative",
                                value: "rel",
                                children: {
                                  switching_time_type_a: {
                                    label: "Switching time (a-type),t switch,a",
                                    value: "switching_time_type_a",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  diff_to_main_type_a: {
                                    label: "diff. to main (a-type),Δt a",
                                    value: "diff_to_main_type_a",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  switching_time_type_b: {
                                    label: "Switching time (b-type),t switch,b",
                                    value: "switching_time_type_b",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  diff_to_main_type_b: {
                                    label: "diff. to main (b-type),Δt b",
                                    value: "diff_to_main_type_b",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  switching_time_wiper: {
                                    label: "Switching time (wiper),t switch,w",
                                    value: "switching_time_wiper",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  duration: {
                                    label: "Duration (wiper),Δt w",
                                    value: "duration",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          close_operation: {
                            label: "Close operation",
                            value: "close_operation",
                            children: {
                              abs: {
                                label: "Absolute",
                                value: "abs",
                                children: {
                                  switching_time_type_a: {
                                    label: "Switching time (a-type),t switch,a",
                                    value: "switching_time_type_a",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  diff_to_main_type_a: {
                                    label: "diff. to main (a-type),Δt a",
                                    value: "diff_to_main_type_a",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  switching_time_type_b: {
                                    label: "Switching time (b-type),t switch,b",
                                    value: "switching_time_type_b",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  diff_to_main_type_b: {
                                    label: "diff. to main (b-type),Δt b",
                                    value: "diff_to_main_type_b",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  switching_time_wiper: { 
                                    label: "Switching time (wiper),t switch,w",
                                    value: "switching_time_wiper",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  },
                                  duration: {
                                    label: "Duration (wiper),Δt w",
                                    value: "duration",
                                    children: {
                                      t_min: {
                                        label: "t min",
                                        value: "t_min"
                                      },
                                      t_max: {
                                        label: "t max",
                                        value: "t_max"
                                      }
                                    }
                                  }
                                }
                              },
                              rel: {
                                label: "Relative",
                                value: "rel",
                                children: {
                                  switching_time_type_a: {
                                    label: "Switching time (a-type),t switch,a",
                                    value: "switching_time_type_a",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  diff_to_main_type_a: {
                                    label: "diff. to main (a-type),Δt a",
                                    value: "diff_to_main_type_a",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  switching_time_type_b: {
                                    label: "Switching time (b-type),t switch,b",
                                    value: "switching_time_type_b",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  diff_to_main_type_b: {
                                    label: "diff. to main (b-type),Δt b",
                                    value: "diff_to_main_type_b",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  switching_time_wiper: {
                                    label: "Switching time (wiper),t switch,w",
                                    value: "switching_time_wiper",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  },
                                  duration: {
                                    label: "Duration (wiper),Δt w",
                                    value: "duration",
                                    children: {
                                      t_ref: {
                                        label: "t ref",
                                        value: "t_ref"
                                      },
                                      t_dev: {
                                        label: "t dev",
                                        value: "t_dev"
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                      },
                      miscellaneous: {
                        label: "Miscellaneous",
                        value: "miscellaneous",
                        children: {
                          abs: {
                            label: "Absolute",
                            value: "abs",
                            children: {
                              bounce_time:{
                                label: "Bounce time",
                                value: "bounce_time",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              bounce_count: {
                                label: "Bounce count",
                                value: "bounce_count",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              pir_close_time: {
                                label: "PIR close time",
                                value: "pir_close_time",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              reaction_time: {
                                label: "Reaction time",
                                value: "reaction_time",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              }
                            }
                          }, 
                          rel: {
                            label: "Relative",
                            value: "rel",
                            children: {
                              bounce_time:{
                                label: "Bounce time",
                                value: "bounce_time",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              },
                              bounce_count: {
                                label: "Bounce count",
                                value: "bounce_count",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              },
                              pir_close_time: {
                                label: "PIR close time",
                                value: "pir_close_time",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              },
                              reaction_time: {
                                label: "Reaction time",
                                value: "reaction_time",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      coil_characteristics: {
                        label: "Coil characteristics",
                        value: "coil_characteristics",
                        children: {
                          abs: {
                            label: "Absolute",
                            value: "abs",
                            children: {
                              peak_close_coil_current: {
                                label: "Peak close coil current",
                                value: "peak_close_coil_current",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              peak_trip_coil_current:{
                                label: "Peak trip coil current",
                                value: "peak_trip_coil_current",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              average_close_coil_current:{
                                label: "Average close coil current",
                                value: "average_close_coil_current",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              average_trip_coil_current: {
                                label: "Average trip coil current",
                                value: "average_trip_coil_current",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              average_close_coil_voltage: {
                                label: "Average close coil voltage",
                                value: "average_close_coil_voltage",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              average_trip_coil_voltage: {
                                label: "Average trip coil voltage",
                                value: "average_trip_coil_voltage",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              close_coil_resistance: {
                                label: "Close coil resistance",
                                value: "close_coil_resistance",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              trip_coil_resistance: {
                                label: "Trip coil resistance",
                                value: "trip_coil_resistance",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              }
                            }
                          },
                          rel: {
                            label: "Relative",
                            value: "rel",
                            children: {
                              peak_close_coil_current: {
                                label: "Peak close coil current",
                                value: "peak_close_coil_current",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  minus_dev: {
                                    label: "- Deviation",
                                    value: "minus_dev"
                                  },
                                  plus_dev: {
                                    label: "+ Deviation",
                                    value: "plus_dev"
                                  }
                                }
                              },
                              peak_trip_coil_current:{
                                label: "Peak trip coil current",
                                value: "peak_trip_coil_current",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  minus_dev: {
                                    label: "- Deviation",
                                    value: "minus_dev"
                                  },
                                  plus_dev: {
                                    label: "+ Deviation",
                                    value: "plus_dev"
                                  }
                                }
                              },
                              average_close_coil_current:{
                                label: "Average close coil current",
                                value: "average_close_coil_current",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  minus_dev: {
                                    label: "- Deviation",
                                    value: "minus_dev"
                                  },
                                  plus_dev: {
                                    label: "+ Deviation",
                                    value: "plus_dev"
                                  }
                                }
                              },
                              average_trip_coil_current: {
                                label: "Average trip coil current",
                                value: "average_trip_coil_current",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  minus_dev: {
                                    label: "- Deviation",
                                    value: "minus_dev"
                                  },
                                  plus_dev: {
                                    label: "+ Deviation",
                                    value: "plus_dev"
                                  }
                                }
                              },
                              average_close_coil_voltage: {
                                label: "Average close coil voltage",
                                value: "average_close_coil_voltage",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  minus_dev: {
                                    label: "- Deviation",
                                    value: "minus_dev"
                                  },
                                  plus_dev: {
                                    label: "+ Deviation",
                                    value: "plus_dev"
                                  }
                                }
                              },
                              average_trip_coil_voltage: {
                                label: "Average trip coil voltage",
                                value: "average_trip_coil_voltage",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  minus_dev: {
                                    label: "- Deviation",
                                    value: "minus_dev"
                                  },
                                  plus_dev: {
                                    label: "+ Deviation",
                                    value: "plus_dev"
                                  }
                                }
                              },
                              close_coil_resistance: {
                                label: "Close coil resistance",
                                value: "close_coil_resistance",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  minus_dev: {
                                    label: "- Deviation",
                                    value: "minus_dev"
                                  },
                                  plus_dev: {
                                    label: "+ Deviation",
                                    value: "plus_dev"
                                  }
                                }
                              },
                              trip_coil_resistance: {
                                label: "Trip coil resistance",
                                value: "trip_coil_resistance",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  minus_dev: {
                                    label: "- Deviation",
                                    value: "minus_dev"
                                  },
                                  plus_dev: {
                                    label: "+ Deviation",
                                    value: "plus_dev"
                                  }
                                }
                              }
                            }
                          }      
                        }
                      }, 
                      pickup_voltage: {
                        label: "Pickup voltage",
                        value: "pickup_voltage",
                        children: {
                          abs: {
                            label: "Absolute",
                            value: "abs",
                            children: { 
                              min_pickup_voltage_close: {
                                label: "Minimum pickup voltage (close)",
                                value: "min_pickup_voltage_close",
                                children: {
                                  v_min: {
                                    label: "V min",
                                    value: "v_min"
                                  },
                                  v_max: {
                                    label: "V max",
                                    value: "v_max"
                                  }
                                }
                              },
                              min_pickup_voltage_trip: {
                                label: "Maximum pickup voltage (trip)",
                                value: "min_pickup_voltage_trip",
                                children: {
                                  v_min: {
                                    label: "V min",
                                    value: "v_min"
                                  },
                                  v_max: {
                                    label: "V max",
                                    value: "v_max"
                                  }
                                }
                              }
                            }             
                          },
                          rel: {
                            label: "Relative",
                            value: "rel",
                            children: {
                              min_pickup_voltage_close: {
                                label: "Minimum pickup voltage (close)",
                                value: "min_pickup_voltage_close",
                                children: {
                                  v_ref: {
                                    label: "V ref",
                                    value: "v_ref"
                                  },
                                  v_dev: {
                                    label: "V dev",
                                    value: "v_dev"
                                  }
                                }
                              },
                              min_pickup_voltage_trip: {
                                label: "Maximum pickup voltage (trip)",
                                value: "min_pickup_voltage_trip",
                                children: {
                                  v_ref: {
                                    label: "V ref",
                                    value: "v_ref"
                                  },
                                  v_dev: {
                                    label: "V dev",
                                    value: "v_dev"
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      motor_characteristics: {
                        label: "Motor characteristics",
                        value: "motor_characteristics",
                        children: {
                          abs:{
                            label: "Absolute",
                            value: "abs",
                            children: {
                              inrush_current: {
                                label: "Inrush current",
                                value: "inrush_current",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              charging_time: {
                                label: "Charging time",
                                value: "charging_time",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              charging_current: {
                                label: "Charging current",
                                value: "charging_current",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              },
                              minimum_voltage:{
                                label: "Minimum voltage",
                                value: "minimum_voltage",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              }
                            }
                          },
                          rel:{
                            label: "Relative",
                            value: "rel",
                            children: {
                              inrush_current: {
                                label: "Inrush current",
                                value: "inrush_current",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              },
                              charging_time: {
                                label: "Charging time",
                                value: "charging_time",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              },
                              charging_current: {
                                label: "Charging current",
                                value: "charging_current",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              },
                              minimum_voltage:{
                                label: "Minimum voltage",
                                value: "minimum_voltage",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      under_voltage_release: {
                        label: "Under voltage release",
                        value: "under_voltage_release",
                        children: {
                          abs: {
                            label: "Absolute",
                            value: "abs",
                            children: {
                              uv_coil_trip_voltage  : {
                                label: "UV Coil Trip Voltage",
                                value: "uv_coil_trip_voltage",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              }
                            }
                          },
                          rel: {
                            label: "Relative",
                            value: "rel",
                            children: {
                              uv_coil_trip_voltage  : {
                                label: "UV Coil Trip Voltage",
                                value: "uv_coil_trip_voltage",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              }
                            }
                          }
                        }
                      }, 
                      overcurrent_release: {
                        label: "Overcurrent release",
                        value: "overcurrent_release",
                        children: {
                          abs: {
                            label: "Absolute",
                            value: "abs",
                            children: {
                              oc_replay_trip_current: {
                                label: "OC Relay Trip Current",
                                value: "oc_replay_trip_current",
                                children: {
                                  min: {
                                    label: "Minimum",
                                    value: "min"
                                  },
                                  max: {
                                    label: "Maximum",
                                    value: "max"
                                  }
                                }
                              }
                            }
                          },
                          rel: {
                            label: "Relative",
                            value: "rel",
                            children: {
                              oc_replay_trip_current: {
                                label: "OC Relay Trip Current",
                                value: "oc_replay_trip_current",
                                children: {
                                  ref: {
                                    label: "Reference",
                                    value: "ref"
                                  },
                                  dev: {
                                    label: "Deviation",
                                    value: "dev"
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  circuitBreakerDto: {  
                    label: "Circuit breaker",
                    value: "circuitBreakerDto",
                    children: {
                      numberOfPhases: {
                        label: "Number of phases",
                        value: "numberOfPhases"
                      },
                      interruptersPerPhase: {
                        label: "Number of interrupters per phase",
                        value: "interruptersPerPhase"
                      },
                      poleOperation: {
                        label: "Pole operation",
                        value: "poleOperation"
                      },
                      hasPIR: {
                        label: "Pre-insertion resistors (PIR)",
                        value: "hasPIR"
                      },
                      pirValue: {
                        label: "PIR value",
                        value: "pirValue"
                      },
                      hasGradingCapacitors: {
                        label: "Grading capacitors",
                        value: "hasGradingCapacitors"
                      },
                      capacitorValue: {
                        label: "Capacitor value",
                        value: "capacitorValue"
                      },
                      interruptingMedium: {
                        label: "Interrupting medium",
                        value: "interruptingMedium"
                      },
                      tankType: {
                        label: "Tank type",
                        value: "tankType"
                      }
                    }
                  },
                  ContactSystemDto: {
                    label: "Contact system",
                    value: "ContactSystemDto",
                    children: {
                      nominal_total_travel: {
                        label: "Nominal total travel",
                        value: "nominal_total_travel"
                      },
                      damping_time: {
                        label: "Damping time",
                        value: "damping_time"
                      },
                      nozzle_length: {
                        label: "Nozzle length",
                        value: "nozzle_length"
                      }
                    }
                  },
                  OperatingDto: {
                    label: "Operating",
                    value: "OperatingDto",
                    children: {
                      type: {
                        label: "type",
                        value: "type"
                      },
                      serial_no: {
                        label: "Serial no",
                        value: "serial_no"
                      },
                      manufacturer: {
                        label: "Manufacturer",
                        value: "manufacturer"
                      },
                      manufacturer_year: {
                        label: "Manufacturing year",
                        value: "manufacturer_year"
                      },
                      manufacturer_type: {
                        label: "Manufacturer type",
                        value: "manufacturer_type"
                      },
                      number_of_trip_coil: {
                        label: "Number of trip coil",
                        value: "number_of_trip_coil"  
                      },
                      number_of_close_coil: {
                        label: "Number of close coil",
                        value: "number_of_close_coil"
                      },
                      comment: {
                        label: "Comment",
                        value: "comment"
                      },
                      rated_operating_pressure: {
                        label: "Rated operating pressure",
                        value: "rated_operating_pressure"
                      },
                      rated_operating_pressure_temperature: {
                        label: "Rated operating pressure",
                        value: "rated_operating_pressure_temperature"
                      },
                      motor: {
                        label: "Motor",
                        children: {
                          rated_current: {
                            label: "Rated current",
                            value: "rated_current"
                          },
                          rated_voltage: {
                            label: "Rated voltage",
                            value: "rated_voltage"
                          },
                          frequency: {
                            label: "Frequency",
                            value: "frequency"
                          },
                          power: {
                            label: "Power",
                            value: "power"
                          }
                        }
                      },
                      auxiliary_circuits: {
                        label: "Auxiliary circuits",
                        value: "auxiliary_circuits",
                        children: {
                          rated_current: {
                            label: "Rated current",
                            value: "rated_current"
                          },
                          rated_voltage: {
                            label: "Rated voltage",
                            value: "rated_voltage"
                          },
                          frequency: {
                            label: "Frequency",
                            value: "frequency"
                          },
                          power: {
                            label: "Power",
                            value: "power"
                        }
                        }
                      },
                      trip_coil_component: {
                        label: "Trip coil component ",
                        value: "trip_coil_component"
                      },
                      close_coil_component: {
                        label: "Close coil component", 
                        value: "close_coil_component"
                      }
                    }
                  },
                  OtherDto: {
                    label: "Other",
                    value: "OtherDto",
                    children: {
                      total_weight_with_gas: {
                        label: "Total weight with gas",
                        value: "total_weight_with_gas"
                      },
                      weight_of_gas: {
                        label: "Weight of gas",
                        value: "weight_of_gas"
                      },
                      volume_of_gas: {
                        label: "Volume of gas",
                        value: "volume_of_gas"
                      },
                      rated_gas_pressure: {
                        label: "Rated gas pressure",
                        value: "rated_gas_pressure"
                      },
                      rated_gas_temperature: {
                        label: "Rated gas pressure",
                        value: "rated_gas_temperature"
                      }
                    }
                  },
                  RatingsDto: {
                    label: "Ratings",
                    value: "RatingsDto",
                    children: {
                      rated_voltage_ll: {
                        label: "Rated voltage (L-L)",
                        value: "rated_voltage_ll"
                      },
                      rated_current: {
                        label: "Rated current",
                        value: "rated_current"
                      },
                      rated_short_circuit_breaking_current: {
                        label: "Rated short-circuit breaking current",
                        value: "rated_short_circuit_breaking_current"
                      },
                      short_circuit_nominal_duration: {
                        label: "Short-circuit nominal duration",
                        value: "short_circuit_nominal_duration"
                      },
                      rated_insulation_level: {
                        label: "Rated insulation level (BIL)",
                        value: "rated_insulation_level"
                      },
                      rated_interrupting_time: {
                        label: "Rated interrupting time",
                        value: "rated_interrupting_time"
                      },
                      interrupting_duty_cycle:{
                        label: "interrupting duty cycle",
                        value: "interrupting_duty_cycle"
                      },
                      rated_power_at_closing:{
                        label: "Rated power at closing",
                        value: "rated_power_at_closing"
                      },
                      rated_power_at_opening: {
                        label: "Rated power at opening",
                        value: "rated_power_at_opening"
                      },
                      rated_power_at_motor_charge: {
                        label: "Rated power at motor charge",
                        value: "rated_power_at_motor_charge"  
                      },
                      rated_frequency: {
                        label: "Rated frequency",
                        value: "rated_frequency"
                      },
                      rated_frequency_custom: {
                        label: "Rated frequency",
                        value: "rated_frequency_custom"
                      }
                    }
                  }
                }
              },
              CurrentTransformerDto: {
                label: "CT",
                value: "CurrentTransformerDto",
                children: {
                  CTConfigurationDto: {
                    label: "CT Configuration",
                    value: "CTConfigurationDto",
                    children: {
                      ClassRatingDto:{
                        label: "Class rating",
                        value: "ClassRatingDto",
                        children: {
                          app: {
                            label: "Application",
                            value: "app"
                          },
                          vb: {
                            label: "Vb",
                            value: "vb"
                          },
                          tpts: {
                            label: "Tpts",
                            value: "tpts"
                          },
                          vk: {
                            label: "Vk",
                            value: "vk"
                          },
                          lk: {
                            label: "Lk",
                            value: "lk"
                          },
                          vk1: {
                            label: "Vk1",
                            value: "vk1"
                          },
                          lk1: {
                            label: "Lk1",
                            value: "lk1"
                          },
                          class: {
                            label: "Class",
                            value: "class"
                          },
                          fs: {
                            label: "FS",
                            value: "fs"
                          },
                          alf: {
                            label: "ALF",
                            value: "alf"
                          },
                          wr: {
                            label: "Winding resistance",
                            value: "wr"
                          },                        
                          ts: {
                            label: "Ts",
                            value: "ts"
                          },
                          kx: {
                            label: "Kx",
                            value: "kx"
                          },
                          ek: {
                            label: "Ek",
                            value: "ek"
                          },
                          e1: {
                            label: "E1",
                            value: "e1"
                          },
                          le: {
                            label: "le",
                            value: "le"
                          },
                          le1: {
                            label: "le1",
                            value: "le1"
                          },
                          k: {
                            label: "K",
                            value: "k"
                          },
                          kssc: {
                            label: "KSSC",
                            value: "kssc"
                          },
                          val: {
                            label: "Val",
                            value: "val"
                          },
                          lal: {
                            label: "lal",
                            value: "lal"
                          },
                          tp: {
                            label: "Tp",
                            value: "tp"
                          },
                          duty: {
                            label: "Duty",
                            value: "duty"
                          },
                          t1: {
                            label: "t1",
                            value: "t1"
                          },
                          tal1: {
                            label: "tal1",
                            value: "tal1"
                          },
                          ktd: {
                            label: "Ktd",
                            value: "ktd"
                          },
                          rated_burden: {
                            label: "Rated burden",
                            value: "rated_burden"
                          },
                          burden: {
                            label: "Burden",
                            value: "burden"
                          },
                          operatingBurden: {
                            label: "Operating burden",
                            value: "operatingBurden"
                          },
                          extended_burden: {
                            label: "Extended burden",
                            value: "extended_burden"
                          },  
                          burdenCos: {
                            label: "cos φ",
                            value: "burdenCos"
                          },
                          operatingBurdenCos: {
                            label: "cos φ",
                            value: "operatingBurdenCos"
                          },
                          core_index: {
                            label: "Core index",
                            value: "core_index"
                          },
                          ratio_error: {
                            label: "Ratio error",
                            value: "ratio_error"
                          },
                        }
                      },
                      ClassRatingSmallDto: {
                          label: "Class rating (small)",
                          value: "ClassRatingSmallDto",
                          children: {
                            rated_burden: {
                              label: "Rated burden",
                              value: "rated_burden"
                            },
                            extended_burden: {
                              label: "Extended burden",
                              value: "extended_burden"
                            },
                            burden: {
                              label: "Burden",
                              value: "burden"
                            },
                            burdenCos: {
                              label: "cos φ",
                              value: "burdenCos"
                            },
                            operatingBurden: {
                              label: "Operating burden",
                              value: "operatingBurden"
                            },
                            operatingBurdenCos: {
                              label: "cos φ",
                              value: "operatingBurdenCos"
                            }
                          }
                      },
                      CoreDto: {
                          label: "Core",
                          value: "CoreDto",
                          children: {
                            taps: {
                              label: "Taps",
                              value: "taps"
                            },
                            commonTap: {
                              label: "Common tap",
                              value: "commonTap"
                            }
                          }
                      },
                      FullTapDto: {
                          label: "Full tap",
                          value: "FullTapDto",
                          children: {
                            name: {
                              label: "Name",
                              value: "name"
                            },
                            ipn: {
                              label: "Ipn",
                              value: "ipn"
                            },
                            isn: {
                              label: "Isn",
                              value: "isn"
                            },
                            inUse: {
                              label: "In use",
                              value: "inUse"
                            }
                          }
                      },
                      InterTapDto: {
                        label: "Inter taps",
                        value: "InterTapDto",
                        children: {
                          TableDto: {
                            children: {
                              name: {
                                label: "Name",
                                value: "name"
                              },
                              ipn: {
                                label: "Ipn",
                                value: "ipn"
                              },
                              isn: {
                                label: "Isn",
                                value: "isn"
                              },
                              inUse: {
                                label: "In use",
                                value: "inUse"
                              }
                            }
                          },
                          ClassRatingSmallDto: {
                            children: {
                              rated_burden: {
                                label: "Rated burden",
                                value: "rated_burden"
                              },
                              extended_burden: {
                                label: "Extended burden",
                                value: "extended_burden"
                              },
                              burden: {
                                label: "Burden",
                                value: "burden"
                              },
                              burdenCos: {
                                label: "cos φ",
                                value: "burdenCos"
                              },
                              operatingBurden: {
                                label: "Operating burden",
                                value: "operatingBurden"
                              },
                              operatingBurdenCos: {
                                label: "cos φ",
                                value: "operatingBurdenCos"
                              }
                            }
                          }
                        }
                      },
                      MainTapDto: {
                        label: "Main tap",
                        value: "MainTapDto",
                        children: {
                          TableDto: {
                            children: {
                              name: {
                                label: "Name",
                                value: "name"
                              },
                              ipn: {
                                label: "Ipn",
                                value: "ipn"
                              },
                              isn: {
                                label: "Isn",
                                value: "isn"
                              },
                              inUse: {
                                label: "In use",
                                value: "inUse"
                              }
                            }
                          },
                          ClassRatingSmallDto: {
                            children: {
                              rated_burden: {
                                label: "Rated burden",
                                value: "rated_burden"
                              },
                              extended_burden: {
                                label: "Extended burden",
                                value: "extended_burden"
                              },
                              burden: {
                                label: "Burden",
                                value: "burden"
                              },
                              burdenCos: {
                                label: "cos φ",
                                value: "burdenCos"
                              },
                              operatingBurden: {
                                label: "Operating burden",
                                value: "operatingBurden"
                              },
                              operatingBurdenCos: {
                                label: "cos φ",
                                value: "operatingBurdenCos"
                              }
                            }
                          }
                        }
                      },
                      TableDto: {
                        label: "Table",
                        value: "TableDto",
                        children: {
                          name: {
                            label: "Name",
                            value: "name"
                          },
                          ipn: {
                            label: "Ipn",
                            value: "ipn"
                          },
                          isn: {
                            label: "Isn",
                            value: "isn"
                          },
                          inUse: {
                            label: "In use",
                            value: "inUse"
                          }
                        }
                      }
                    }
                  },
                  PropertiesDto: {
                    label: "Properties",
                    value: "PropertiesDto",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      },
                    }
                  },
                  RatingsDto: {
                    label: "Ratings",
                    value: "RatingsDto",
                    children: {
                      standard: {
                        label: "Standard",
                        value: "standard"
                      },
                      rated_frequency: {
                        label: "Rated frequency",
                        value: "rated_frequency",
                        children: {
                          rated_frequency_custom: {
                            label: "Rated frequency",
                            value: "rated_frequency_custom"
                          }
                        }
                      },
                      primary_winding_count: {
                        label: "Primary windings",
                        value: "primary_winding_count"
                      },
                      um_rms: {
                        label: "Um (r.m.s)",
                        value: "um_rms"
                      },
                      u_withstand_rms: {
                        label: "U withstand (r.m.s)",
                        value: "u_withstand_rms"
                      },
                      u_lightning_peak: {
                        label: "U lightning (peak)",
                        value: "u_lightning_peak"
                      },
                      icth: {
                        label: "Icth",
                        value: "icth"
                      },
                      idyn_peak: {
                        label: "Idyn (peak)",
                        value: "idyn_peak"
                      },
                      ith_rms: {
                        label: "Ith (r.m.s)",
                        value: "ith_rms"
                      },
                      ith_duration: {
                        label: "Duration",
                        value: "ith_duration"
                      },
                      system_voltage: {
                        label: "System voltage",
                        value: "system_voltage"
                      },
                      system_voltage_type: {
                        label: "System voltage",
                        value: "system_voltage_type"
                      },
                      bil: {
                        label: "BIL",
                        value: "bil"
                      },
                      rating_factor: {
                        label: "Rating factor (RF)",
                        value: "rating_factor",
                        children: {
                          rating_factor_temp: {
                            label: "at",
                            value: "rating_factor_temp"
                          }
                        }
                      }
                  }
                  }
                }
              },
              VoltageTransformerDto: {
                label: "VT",
                children: { 
                  PropertiesDto: {
                    label: "Properties",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      }
                    }
                  },
                  RatingDto:{
                    label: "Rating",
                    value: "RatingDto",
                    children: {
                      standard: {
                        label: "Standard",
                        value: "standard"
                      },
                      rated_frequency: {
                        label: "Rated frequency",
                        value: "rated_frequency"
                      },
                      rated_frequency_custom: {
                        label: "Rated frequency",
                        value: "rated_frequency_custom"
                      },
                      uprRatio: {
                        label: "Upr",
                        value: "uprRatio"
                      },
                      upr: {
                        label: "Upr",
                        value: "upr"
                      },
                      c1: {
                        label: "C1",
                        value: "c1"
                      },
                      c2: {
                        label: "C2",
                        value: "c2"
                      },
                      rated_voltage: {
                        label: "Rated voltage",
                        value: "rated_voltage"
                      },
                      
                    }
                  },
                  VTConfigurationDto: {
                    label: "VT Configuration",
                    value: "VTConfigurationDto",
                    children: {
                      windings: {
                        label: "Windings",
                        value: "windings"
                      },
                      name: {
                        label: "Name",
                        value: "name"
                      },
                      usr: {
                        label: "Usr",
                        value: "usr"
                      },
                      rated_burden: {
                        label: "Rated burden",
                        value: "rated_burden"
                      }
                    }
                  }
                }
              },
              SurgeArresterDto: {
                label: "Surge arrester",
                value: "SurgeArresterDto",
                children: { 
                  PropertiesDto: {
                    label: "Properties",
                    value: "PropertiesDto",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      }
                    }
                  },
                  RatingsDto: {
                    label: "Ratings",
                    value: "RatingsDto",
                    children: {
                      unitStack: {
                        label: "Units in stack",
                        value: "unitStack"
                      },
                      tableRating: {
                        value: "tableRating",
                        children: {
                          position: {
                            label: "Position",
                            value: "position"
                          },
                          serial: {
                            label: "Serial no.",
                            value: "serial"
                          },
                          ratedVoltage: {
                            label: "Rated voltage Ur",
                            value: "ratedVoltage"
                          },
                          maximumVoltage: {
                            label: "Maximun system voltages",
                            value: "maximumVoltage"
                          },
                          continousVoltage: {
                            label: "Continous operating voltage Uc",
                            value: "continousVoltage"
                          },
                          shortCurrent: {
                            label: "Short time withstand current",
                            value: "shortCurrent"
                          },
                          ratedCircuit: {
                            label: "Rated duration of short circuit",
                            value: "ratedCircuit"
                          },
                          polesVoltage: {
                            label: "Power frequency withstand voltage (to earth and between poles)",
                            value: "polesVoltage"
                          },
                          isoVoltage: {
                            label: "Power frequency withstand voltage (across the isolating distance)",
                            value: "isoVoltage"
                          }
                        }
                      },
                    }
                  }
                }
              },
              PowerCableDTO: {
                label: "Power cable",
                value: "PowerCableDTO",
                children: {
                  PropertiesDto: {
                    label: "Properties",
                    value: "PropertiesDto",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      }
                    }
                  },
                  configsData: {
                    label: "Configurations",
                    value: "configsData",
                    children: {
                      phases: { 
                        label: "Phases", 
                        value: "phases"
                      },
                      cores: { 
                        label: "Cores", 
                        value: "cores"
                      }
                    }
                  },
                  ratingsData: {  
                    label: "Ratings",
                    value: "ratingsData",
                    children: {
                      rated_voltage: { 
                        label: "Rated voltage (rms)", 
                        value: "rated_voltage"
                      },
                      max_voltage: { 
                        label: "Maximum voltage (rms)", 
                        value: "max_voltage"
                      },
                      rated_frequency: { 
                        label: "Rated frequency", 
                        value: "rated_frequency"
                      },
                      shortcircuit: { 
                        label: "Short circuit current", 
                        value: "shortcircuit"
                      },
                      rated_duration: { 
                        label: "Rated duration of short circuit", 
                        value: "rated_duration" 
                      }
                    }
                  },
                  layersData: {  
                    label: "Layer construction",
                    value: "layersData",
                    children: {
                      conductor: { 
                        label: "Conductor", 
                        value: "conductor"
                      },
                      conductor_shield: { 
                        label: "Conductor shield", 
                        value: "conductor_shield"
                      },
                      insulation: { 
                        label: "Insulation", 
                        value: "insulation"
                      },
                      insulation_screen: { 
                        label: "Insulation screen", 
                        value: "insulation_screen"
                      },
                      sheath: { 
                        label: "Sheath", 
                        value: "sheath"
                      },
                      sheath_reinforcing: { 
                        label: "Sheath reinforcing tap", 
                        value: "sheath_reinforcing"
                      },
                      concentric_neutral: { 
                        label: "Concentric neutral", 
                        value: "concentric_neutral"
                      },
                      armour_bedding: { 
                        label: "Armour bedding", 
                        value: "armour_bedding"
                      },
                      armour: { 
                        label: "Amour", 
                        value: "armour"
                      },
                      oversheath:{ 
                        label: "Oversheath/Jacket/Serving", 
                        value: "oversheath"
                      }
                    }
                  },
                  othersData: { 
                    label: "Others",
                    value: "othersData",
                    children: {
                      insulation_method: { 
                        label: "Installation method", 
                        value: "insulation_method"
                      },
                      bonding_type: { 
                        label: "Bonding type", 
                        value: "bonding_type"
                      },
                      install_location: { 
                        label: "Install location", 
                        value: "install_location"
                      },
                      cable_length: { 
                        label: "Cable length", 
                        value: "cable_length"
                      }
                    } 
                  },
                  datasData: {
                    value: "datasData",
                    children: {
                      conductor: { 
                        label: "Conductor",
                        value: "conductor",
                        children: {
                          conductor_size: { 
                            label: "Conductor size", 
                            value: "conductor_size"
                          },
                          conductor_class: { 
                            label: "Conductor class", 
                            value: "conductor_class"
                          },
                          conductor_material: { 
                            label: "Conductor material", 
                            value: "conductor_material",
                            children:  {
                              conductor_material_custom: {
                                label: "Conductor material",
                                value: "conductor_material_custom"
                              }
                            }
                          },
                          conductor_type: { 
                            label: "Conductor type", 
                            value: "conductor_type",
                            children: {
                              conductor_type_custom: {
                                label: "Conductor type",
                                value: "conductor_type_custom"
                              }
                            }
                          },
                          conductor_count: { 
                            label: "Conductor count", 
                            value: "conductor_count"
                          },
                          conductor_diameter: { 
                            label: "Conductor diameter", 
                            value: "conductor_diameter"
                          } 
                        }
                      },
                      insulation: { 
                        label: "Insulation",
                        value: "insulation",
                        children: {
                          insulation_type: { 
                            label: "Insulation type", 
                            value: "insulation_type",
                            children: {
                              insulation_type_custom: {
                                label: "Insulation type",
                                value: "insulation_type_custom"
                              }
                            }
                          },
                          thickness: { 
                            label: "Thickness", 
                            value: "thickness"
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter",
                          },
                          insulation_operating: { 
                            label: "Insulation max. operating temp", 
                            value: "insulation_operating"
                          }
                        }
                      },
                      sheath_reinforcing: { 
                        label: "Sheath reinforcing tap", 
                        value: "sheath_reinforcing",
                        children: {
                          material: {
                            label: "Material", 
                            value: "material",
                            children: {
                              material_custom: {
                                label: "Material",
                                value: "material_custom"
                              }
                            }
                          },
                          thickness: { 
                            label: "Thickness", 
                            value: "thickness"  
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter"
                          },
                          width: { 
                            label: "Width",  
                            value: "width"
                          },
                          lengthOfLay: { 
                            label: "Length of lay",  
                            value: "lengthOfLay"
                          },
                          numOfTapes: { 
                            label: "No. of tapes",  
                            value: "numOfTapes"
                          }
                        }
                      },
                      armour: { 
                        label: "Armour",
                        value: "armour",
                        children: {
                          material: {
                            label: "Material", 
                            value: "material",
                            children: {
                              material_custom: {
                                label: "Material",
                                value: "material_custom"
                              }
                            }
                          },
                          thickness: { 
                            label: "Thickness", 
                            value: "thickness"  
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter"
                          },
                          layerOfTapes: { 
                            label: "Layer of tapes (reinforcement resistance)",  
                            value: "layerOfTapes",
                            children: {
                              layerOfTapes_custom: {
                                label: "Layer of tapes (reinforcement resistance)",
                                value: "layerOfTapes_custom"
                              }
                            }
                          },
                          crossSectionalArea: { 
                            label: "Cross-sectional area of tap armour",  
                            value: "crossSectionalArea"
                          },
                        }                
                      },
                      conductor_shield: { 
                        label: "Conductor shield",
                        value: "conductor_shield",
                        children: {
                          thickness: {
                            label: "Thickness", 
                            value: "thickness"
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter"
                          }
                        }
                      },
                      insulation_screen: { 
                        label: "Insulation screen",
                        value: "insulation_screen",
                        children: {
                          material: {
                            label: "Material", 
                            value: "material",
                            children: {
                              material_custom: {
                                label: "Material",
                                value: "material_custom"
                              }
                            }
                          },
                          thickness: { 
                            label: "Thickness",  
                            value: "thickness"
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter"
                          },
                        }
                      },
                      concentric_neutral: { 
                        label: "Concentric neutral",
                        value: "concentric_neutral",
                        children: {
                          material: {
                            label: "Material", 
                            value: "material",
                            children: {
                              material_custom: {
                                label: "Material",
                                value: "material_custom"
                              }
                            }
                          },
                          construction: { 
                            label: "Construction",  
                            value: "construction",
                            children: {
                              construction_custom: {
                                label: "Construction",
                                value: "construction_custom"
                              }
                            }
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter"
                          },
                          thickness: { 
                            label: "Thickness",  
                            value: "thickness",
                          },
                          area: { 
                            label: "Area",  
                            value: "area"
                          },
                          lengthOfLay: { 
                            label: "Length of lay",  
                            value: "lengthOfLay"
                          },
                          numOfWires: { 
                            label: "No. of wires",  
                            value: "numOfWires"
                          }
                        }
                      },
                      oversheath:{  
                        label: "Oversheath/Jacket/Serving",
                        value: "oversheath",
                        children: {
                          material: {
                            label: "Material", 
                            value: "material",
                            children: {
                              material_custom: {
                                label: "Material",
                                value: "material_custom"
                              }
                            }
                          },
                          thickness: { 
                            label: "Thickness",  
                            value: "thickness"
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter"
                          },
                        }
                      },
                      sheath: { 
                        label: "Sheath",
                        value: "sheath",  
                        children: {
                          multicore: {
                            label: "Multicore", 
                            value: "multicore"
                          },
                          sheath_type: {
                            label: "Sheath type", 
                            value: "sheath_type",
                            children: {
                              sheath_type_custom: {
                                label: "Sheath type",
                                value: "sheath_type_custom"
                              }
                            }
                          },
                          thickness: { 
                            label: "Thickness",  
                            value: "thickness"
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter"
                          },
                          construction: { 
                            label: "Construction",  
                            value: "construction",
                            children: {
                              construction_custom: {
                                label: "Construction",
                                value: "construction_custom"
                              }
                            }
                          }
                        } 

                      },
                      armour_bedding: { 
                        label: "Armour bedding", 
                        value: "armour_bedding",
                        children: {
                          material: {
                            label: "Material", 
                            value: "material",
                            children: {
                              material_custom: {
                                label: "Material",
                                value: "material_custom"
                              }
                            }
                          },
                          thickness: { 
                            label: "Thickness", 
                            value: "thickness"  
                          },
                          diameter: { 
                            label: "Diameter",  
                            value: "diameter"
                          }
                        }
                      },
                      jointsData: { 
                        label: "Joints",
                        value: "jointsData",
                        children: {
                          rated_u: { 
                            label: "Rated voltage", 
                            value: "rated_u"
                          },
                          rated_current: {  
                            label: "Rated current", 
                            value: "rated_current"
                          },
                          category: { 
                            label: "Category", 
                            value: "category"
                          },
                          construction: { 
                            label: "Construction", 
                            value: "construction"
                          },
                          service_condition: { 
                            label: "Service condition", 
                            value: "service_condition"
                          }
                        }
                      },
                      terminalsData: { 
                        label: "Terminals",
                        value: "terminalsData",
                        children: {
                          rated_u: { 
                            label: "Rated voltage", 
                            value: "rated_u"
                          },
                          bil: {  
                            label: "BIL", 
                            value: "bil"
                          },
                          bsl: { 
                            label: "BSL", 
                            value: "bsl"
                          },
                          type: { 
                            label: "Type", 
                            value: "type"
                          },
                          connector_type: { 
                            label: "Connector type", 
                            value: "connector_type"
                          },
                          service_condition: { 
                            label: "Service condition", 
                            value: "service_condition"
                          },
                          class: { 
                            label: "Class", 
                            value: "class"
                          }
                        }
                      },
                      sheathLimitsData: { 
                        label: "Sheath voltage limiter",
                        value: "sheathLimitsData",
                        children: {
                          rated_voltage_ur: { 
                            label: "Rated voltage Ur", 
                            value: "rated_voltage_ur"
                          },
                          max_continuous_operating_voltage: {  
                            label: "Maximum continuous operating voltage Uc", 
                            value: "max_continuous_operating_voltage"
                          },
                          nominal_discharge_current: { 
                            label: "Nominal discharge current", 
                            value: "nominal_discharge_current"
                          },
                          high_current_impulse_withstand_voltage: { 
                            label: "High current impulse withstand", 
                            value: "high_current_impulse_withstand_voltage"
                          },
                          long_duration_current_impulse_withstand_voltage: { 
                            label: "Long duration current impulse withstand", 
                            value: "long_duration_current_impulse_withstand_voltage"
                          },
                          short_circuit_withstand_current: { 
                            label: "Short circuit withstand", 
                            value: "short_circuit_withstand_current"
                          }
                        }
                      }      
                    }
                  }      
                }  
              },
              DisconnectorDTO: {
                label: "Disconnector",
                value: "DisconnectorDTO",
                children: { 
                  PropertiesDto: {
                    label: "Properties",
                    value: "PropertiesDto",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      }
                    }
                  },
                  ratings: {
                    label: "Ratings",
                    value: "ratings",
                    children: {
                      rated_voltage: { 
                        label: "Rated voltage", 
                        value: "rated_voltage"
                      },
                      rated_frequency: { 
                        label: "Rated frequency", 
                        value: "rated_frequency"
                      },
                      rated_current: { 
                        label: "Rated current", 
                        value: "rated_current"
                      },
                      short_time_withstand_current: { 
                        label: "Short time withstand current", 
                        value: "short_time_withstand_current"
                      },
                      rated_duration_of_short_circuit: { 
                        label: "Rated duration of short circuit", 
                        value: "rated_duration_of_short_circuit"
                      },
                      power_freq_withstand_voltage_earth_poles: { 
                        label: "to earth and between poles", 
                        value: "power_freq_withstand_voltage_earth_poles"
                      },
                      power_freq_withstand_voltage_isolating_distance: { 
                        label: "across the isolating distance", 
                        value: "power_freq_withstand_voltage_isolating_distance"
                      },
                    }
                  }
                }     
              },
              RotatingMachineDTO: {
                label: "Rotating Machine",
                value: "RotatingMachineDTO",
                children: { 
                  PropertiesDto: {
                    label: "Properties",
                    value: "PropertiesDto",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      }
                    }    
                  },
                  configsData: {
                    label: "Configurations",
                    value: "configsData",
                    children: {
                      star_point: { 
                        label: "Star point", 
                        value: "star_point"
                      }
                    }
                  },
                  ratingsData: {
                    label: "Ratings",
                    value: "ratingsData",
                    children: {
                      rated_u: { 
                        label: "Rated voltage L-L", 
                        value: "rated_u"
                      },
                      rated_current: { 
                        label: "Rated current", 
                        value: "rated_current"
                      },
                      rated_speed: { 
                        label: "Rated speed (rpm)", 
                        value: "rated_speed"
                      },
                      rated_frequency: { 
                        label: "Rated frequency", 
                        value: "rated_frequency"
                      },
                      rated_power: { 
                        label: "Rated power", 
                        value: "rated_power"
                      },
                      rated_power_factor: { 
                        label: "Rated power factor", 
                        value: "rated_power_factor"
                      },
                      rated_thermal_class: { 
                        label: "Rated thermal class", 
                        value: "rated_thermal_class"
                      },
                      rated_ifd: { 
                        label: "Rated excitation current (rotor)", 
                        value: "rated_ifd"
                      },
                      rated_ufd: {  
                        label: "Rated excitation voltage (rotor)", 
                        value: "rated_ufd"
                      }
                  },
                }
              },
              },  
              CapacitanceDto: {
                label: "Capacitor",
                value: "CapacitanceDto",
                children: {
                  PropertiesDto: {
                    label: "Properties",
                    value: "PropertiesDto",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      }
                    } 
                  },
                  configsData: {
                    label: "Phase",
                    value: "configsData",
                    children: {
                      phase_name: { 
                        label: "Phase name", 
                        value: "phase_name"
                      },
                      phase: { 
                        label: "Phase", 
                        value: "phase"
                      }
                    }
                  },
                  ratingsData: {
                    label: "Ratings",
                    value: "ratingsData",
                    children: {
                      rated_voltage: { 
                        label: "Rated voltage", 
                        value: "rated_voltage"
                      },
                      rated_frequency: { 
                        label: "Rated frequency", 
                        value: "rated_frequency"
                      },
                      rated_current: { 
                        label: "Rated current", 
                        value: "rated_current"
                      },
                      rated_power: { 
                        label: "Rated power", 
                        value: "rated_power"
                      }
                    }
                  },
                  CapacitanceDto: {
                    label: "Capacitance",
                    value: "CapacitanceDto",
                    children: {
                      capacitance: { 
                        label: "Capacitance", 
                        value: "capacitance"
                      },
                      capacitance_A: { 
                        label: "Phase A", 
                        value: "capacitance_A"
                      },
                      capacitance_B: { 
                        label: "Phase B", 
                        value: "capacitance_B"
                      },
                      capacitance_C: { 
                        label: "Phase C", 
                        value: "capacitance_C"
                      }
                    }
                  },
                  DissipationFactorDto: {
                    label: "Dissipation Factor",
                    value: "DissipationFactorDto",
                    children: {
                      dissipation_factor: { 
                        label: "Dissipation factor", 
                        value: "dissipation_factor"
                      },
                      dissipation_factor_A: { 
                        label: "Phase A", 
                        value: "dissipation_factor_A"
                      },
                      dissipation_factor_B: { 
                        label: "Phase B", 
                        value: "dissipation_factor_B"
                      },
                      dissipation_factor_C: { 
                        label: "Phase C", 
                        value: "dissipation_factor_C"
                      }
                    }
                  },
                  othersData: {
                    label: "Others",
                    value: "othersData",
                    children: { 
                      insulation_type: { 
                        label: "Insulation type", 
                        value: "insulation_type"
                      },
                      weight: { 
                        label: "Weight", 
                        value: "weight"
                      }
                    }
                  }      
                }
              },
              ReactorDto: {
                label: "Reactor",
                value: "ReactorDto",
                children: { 
                  PropertiesDto: {
                    label: "Properties",
                    value: "PropertiesDto",
                    children: {
                      type: { 
                        label: "Asset type", 
                        value: "type"
                      },
                      kind: { 
                        label: "Asset", 
                        value: "kind"
                      },
                      serial_no: { 
                        label: "Serial no.", 
                        value: "serial_no"
                      },
                      manufacturer: { 
                        label: "Manufacturer", 
                        value: "manufacturer"
                      },
                      manufacturer_type: { 
                        label: "Manufacturer type", 
                        value: "manufacturer_type"
                      },
                      manufacturer_year: { 
                        label: "Manufacturing year", 
                        value: "manufacturer_year"
                      },
                      country_of_origin: { 
                        label: "Country of origin", 
                        value: "country_of_origin"
                      },
                      apparatus_id: { 
                        label: "Apparatus ID", 
                        value: "apparatus_id"
                      },
                      comment: { 
                        label: "Comment", 
                        value: "comment"
                      },
                      feeder: { 
                        label: "Feeder", 
                        value: "feeder"
                      }
                    }    
                  },
                  ReactorRatingDto: {
                    label: "Ratings",
                    value: "ReactorRatingDto",
                    children: {
                      rated_voltage: { 
                        label: "Rated voltage", 
                        value: "rated_voltage"
                      },
                      rated_frequency: { 
                        label: "Rated frequency", 
                        value: "rated_frequency"
                      },
                      rated_current: { 
                        label: "Rated current", 
                        value: "rated_current"
                      },
                      rated_power: { 
                        label: "Rated power", 
                        value: "rated_power"
                      },
                      inductance: { 
                        label: "Inductance", 
                        value: "inductance"
                      }
                    }
                  },
                  ReactorOtherDto: {
                    label: "Others",
                    value: "ReactorOtherDto", 
                    children: {
                      insulation_type: { 
                        label: "Insulation type", 
                        value: "insulation_type"
                      },
                      weight: { 
                        label: "Weight", 
                        value: "weight"
                      }
                    }
                  }  
                }
              }
            }
          }
        },                      
        tableData: [
          {
            code: "",
            category: "",
            featureLevels: []
          }
        ]
        }
      },
                      
    methods: {
      getNodeByLevel(row, levelIndex) {
        let node = this.FEATURE_TREE[row.category]
        if (!node) return null

        for (let i = 0; i < levelIndex; i++) {
          const key = row.featureLevels[i]?.key
          node = node?.children?.[key]
          if (!node) return null
        }
        return node
      },

      getFeatureOptionsByLevel(row, levelIndex) {
        const node = this.getNodeByLevel(row, levelIndex)
        if (!node?.children) return []

        return Object.entries(node.children).map(([key, child]) => ({
          key,
          label: child.label,
          hasChildren: !!child.children,
          isLeaf: !!child.value
        }))
      },

      onFeatureLevelChange(row, levelIndex) {
        // xóa các level phía sau
        row.featureLevels.splice(levelIndex + 1)
        const selectedKey = row.featureLevels[levelIndex].key
        const parentNode = this.getNodeByLevel(row, levelIndex)
        const selectedNode = parentNode?.children?.[selectedKey]

        // nếu còn children → thêm select con
        if (selectedNode?.children) {
          row.featureLevels.push({ key: "" })
          return
        }

        // node lá
        if (selectedNode?.value) {
          const path = row.featureLevels.map(l => l.key).join(".")
          console.log("FINAL PATH:", path)
          console.log("VALUE:", selectedNode.value)
        }
      },

      clearAll() {
        this.tableData = []
      },

      addRow(index) {
        const newRow = {
          code: "",
          category: "",
          featureLevels: []
        }
        if (typeof index === 'number') {  
          this.tableData.splice(index + 1, 0, newRow)
        } else {
          this.tableData.push(newRow);
        }
      },
      removeRow(index) {
        this.tableData.splice(index, 1);
      },
      async uploadExcelFile() {
        const uplExcel= await window.electronAPI.openFileDialog('excel');
        console.log(uplExcel);
      },
      async uploadXmlFile() {
        const uplXml= await window.electronAPI.openFileDialog('xml');
        console.log(uplXml);
      },
      async uploadWordFile() {
        const uplWord= await window.electronAPI.openFileDialog('word');
        console.log(uplWord);
      },
      async uploadPdfFile() {
        const uplPdf= await window.electronAPI.openFileDialog('pdf');
        console.log(uplPdf);
      }
    }
}

      
</script>
<style scoped>
</style>