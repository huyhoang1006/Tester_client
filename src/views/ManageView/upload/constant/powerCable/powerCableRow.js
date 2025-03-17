const powerCableRow = {
    insulation : {
        columnAddr : [
            {
                value: "insulation_type",
                label : "Insulation type"
            },
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            },
            {
                value: "insulation_operating",
                label : "Insulation max. operating temp"
            },
        ],
        label : "Insulation"
    },
    conductor : {
        columnAddr : [
            {
                value: "conductor_size",
                label : "Conductor size"
            },
            {
                value: "conductor_class",
                label : "Conductor class"
            },
            {
                value: "conductor_material",
                label : "Conductor material"
            },
            {
                value: "conductor_type",
                label : "Conductor type"
            },
            {
                value: "conductor_diameter",
                label : "Nominal conductor diameter"
            },
        ],
        label : "Conductor"
    },
    sheath_reinforcing : {
        columnAddr : [
            {
                value: "material",
                label : "Material"
            },
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            },
            {
                value: "width",
                label : "Width"
            },
            {
                value: "lengthOfLay",
                label : "Length of lay"
            },
            {
                value: "numOfTapes",
                label : "No. of tapes"
            },
        ],
        label : "Sheath reinforcing tape"
    },
    armour : {
        columnAddr : [
            {
                value: "material",
                label : "Material"
            },
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            },
            {
                value: "crossSectional",
                label : "Layer of tapes (reinforcement resistance)"
            },
            {
                value: "layerOfTapes",
                label : "Cross-sectional area of tap armour"
            }
        ],
        label : "Armour"
    },
    conductor_shield : {
        columnAddr : [
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            },
        ],
        label : "Conductor shield"
    },
    insulation_screen : {
        columnAddr : [
            {
                value: "material",
                label : "Material"
            },
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            },
        ],
        label : "Insulation screen"
    },
    concentric_neutral : {
        columnAddr : [
            {
                value: "material",
                label : "Material"
            },
            {
                value: "construction",
                label : "Construction"
            },
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            },
            {
                value: "area",
                label : "Area"
            },
            {
                value: "lengthOfLay",
                label : "Length of lay"
            },
            {
                value: "numOfWires",
                label : "No. of wires"
            }
        ],
        label : "Concentric neutral"
    },
    oversheath : {
        columnAddr : [
            {
                value: "material",
                label : "Material"
            },
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            }
        ],
        label : "Oversheath/ Jack/ Serving"
    },
    sheath : {
        columnAddr : [
            {
                value: "multicore",
                label : "Multicore"
            },
            {
                value: "sheath_type",
                label : "Sheath type"
            },
            {
                value: "construction",
                label : "Construction"
            },
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            }
        ],
        label : "Sheath"
    },
    armour_bedding : {
        columnAddr : [
            {
                value: "material",
                label : "Material"
            },
            {
                value: "thickness",
                label : "Thickness"
            },
            {
                value: "diameter",
                label : "Diameter"
            }
        ],
        label : "Armour bedding"
    },
}
export default powerCableRow