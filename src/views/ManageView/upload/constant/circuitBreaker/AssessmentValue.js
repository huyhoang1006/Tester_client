const assessmentValue = {
    contactSys : {
        columnAddr : [
            {
                value : "abs",
                label : "Absolute"
            },
            {
                value : "rel",
                label : "Relative"
            }
        ],
        label : "Contact resistance",
        abs : [
            {
               label : "R min",
               value : "rmin" 
            },
            {
                label : "R max",
                value : "rmax" 
             }
        ],
        rel : [
            {
                label : "R ref",
                value : "rref" 
            },
            {
                label : "R dev",
                value : "rdev" 
             }
        ]
    },
    auxContact : {
        columnAddr : [
            {
                value : "abs",
                label : "Absolute"
            },
            {
                value : "rel",
                label : "Relative"
            }
        ],
        label : "Auxiliary contacts",
        abs : {
            trip : [
                {
                    value : 0,
                    label : "Switching time (a-type)"
                },
                {
                    value : 1,
                    label : "diff. to main (a-type)"
                },
                {
                    value : 2,
                    label : "Switching time (b-type)"
                },
                {
                    value : 3,
                    label : "diff. to main (b-type)"
                },
                {
                    value : 4,
                    label : "Switching time (wiper)"
                },
                {
                    value : 5,
                    label : "Duration (wiper)"
                },
            ],
            close : [
                {
                    value : 0,
                    label : "Switching time (a-type)"
                },
                {
                    value : 1,
                    label : "diff. to main (a-type)"
                },
                {
                    value : 2,
                    label : "Switching time (b-type)"
                },
                {
                    value : 3,
                    label : "diff. to main (b-type)"
                },
                {
                    value : 4,
                    label : "Switching time (wiper)"
                },
                {
                    value : 5,
                    label : "Duration (wiper)"
                },
            ],
            columnAddr : [
                {
                    value : "tmin",
                    label : "t min"
                },
                {
                    value : "tmax",
                    label : "t max"
                },
            ]
        },
        rel : {
            trip : [
                {
                    value : 0,
                    label : "Switching time (a-type)"
                },
                {
                    value : 1,
                    label : "diff. to main (a-type)"
                },
                {
                    value : 2,
                    label : "Switching time (b-type)"
                },
                {
                    value : 3,
                    label : "diff. to main (b-type)"
                },
                {
                    value : 4,
                    label : "Switching time (wiper)"
                },
                {
                    value : 5,
                    label : "Duration (wiper)"
                },
            ],
            close : [
                {
                    value : 0,
                    label : "Switching time (a-type)"
                },
                {
                    value : 1,
                    label : "diff. to main (a-type)"
                },
                {
                    value : 2,
                    label : "Switching time (b-type)"
                },
                {
                    value : 3,
                    label : "diff. to main (b-type)"
                },
                {
                    value : 4,
                    label : "Switching time (wiper)"
                },
                {
                    value : 5,
                    label : "Duration (wiper)"
                },
            ],
            columnAddr : [
                {
                    value : "tref",
                    label : "t ref"
                },
                {
                    value : "tdef",
                    label : "t dev"
                },
            ]
        },
        tableName : [
            {
                value : "trip",
                label : "Trip operation"
            },
            {
                value : "close",
                label : "Close operation"
            }
        ],
    },
    underVoltageR : {
        columnAddr : [
            {
                value : "abs",
                label : "Absolute"
            },
            {
                value : "rel",
                label : "Relative"
            }
        ],
        label : "Under-voltage release",
        abs : [
            {
                value : "min",
                label : "Minimum"
            },
            {
                value : "max",
                label : "Maximum"
            }
        ],
        rel : [
            {
                value : "ref",
                label : "Reference"
            },
            {
                value : "dev",
                label : "Deviation"
            }
        ]
    },
    overcurrentR : {
        columnAddr : [
            {
                value : "abs",
                label : "Absolute"
            },
            {
                value : "rel",
                label : "Relative"
            }
        ],
        label : "Overcurrent release",
        abs : [
            {
                value : "min",
                label : "Minimum"
            },
            {
                value : "max",
                label : "Maximum"
            }
        ],
        rel : [
            {
                value : "ref",
                label : "Reference"
            },
            {
                value : "dev",
                label : "Deviation"
            }
        ]
    },
}

export default assessmentValue