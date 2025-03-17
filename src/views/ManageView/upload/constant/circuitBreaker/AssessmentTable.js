const assessmentLimitsTable = {
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
    },
    openTime : {
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
        label : "Operating time",
        abs : {
            dataName : [
                {
                    value : 0,
                    label : "Opening time"
                },
                {
                    value : 1,
                    label : "Opening sync. (contacts within a phase)"
                },
                {
                    value : 2,
                    label : "Opening sync. (between breaker phases)	 "
                },
                {
                    value : 3,
                    label : "Closing time"
                },
                {
                    value : 4,
                    label : "Closing sync. (contacts within a phase)"
                },
                {
                    value : 5,
                    label : "Closing sync. (between breaker phases)"
                },
                {
                    value : 6,
                    label : "Reclosing time"
                },
                {
                    value : 7,
                    label : "Open-Close time"
                },
                {
                    value : 8,
                    label : "Close-Open time"
                },
            ],
            attribute : [
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
            dataName : [
                {
                    value : 0,
                    label : "Opening time"
                },
                {
                    value : 1,
                    label : "Opening sync. (contacts within a phase)"
                },
                {
                    value : 2,
                    label : "Opening sync. (between breaker phases)	 "
                },
                {
                    value : 3,
                    label : "Closing time"
                },
                {
                    value : 4,
                    label : "Closing sync. (contacts within a phase)"
                },
                {
                    value : 5,
                    label : "Closing sync. (between breaker phases)"
                },
                {
                    value : 6,
                    label : "Reclosing time"
                },
                {
                    value : 7,
                    label : "Open-Close time"
                },
                {
                    value : 8,
                    label : "Close-Open time"
                },
            ],
            attribute : [
                {
                    value : "rref",
                    label : "t ref"
                },
                {
                    value : "tdevZ",
                    label : "- t dev"
                },
                {
                    value : "tdevN",
                    label : "+ t dev"
                }
            ]
        }
    },
    contactTravel : {
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
        label : "Contact travel",
        abs : {
            dataName : [
                {
                    value : 0,
                    label : "Total travel, TT"
                },
                {
                    value : 1,
                    label : "Over travel (Trip), OT"
                },
                {
                    value : 2,
                    label : "Over travel (Close), OT"
                },
                {
                    value : 3,
                    label : "Rebound (Trip), RB"
                },
                {
                    value : 4,
                    label : "Rebound (Close), RB"
                },
                {
                    value : 5,
                    label : "Contact wipe (Trip), CW"
                },
                {
                    value : 6,
                    label : "Contact wipe (Close), CW"
                },
                {
                    value : 7,
                    label : "Damping distance"
                },
            ],
            attribute : [
                {
                    value : "dmin",
                    label : "d min"
                },
                {
                    value : "dmax",
                    label : "d max"
                },
            ] 
        },
        rel : {
            dataName : [
                {
                    value : 0,
                    label : "Total travel, TT"
                },
                {
                    value : 1,
                    label : "Over travel (Trip), OT"
                },
                {
                    value : 2,
                    label : "Over travel (Close), OT"
                },
                {
                    value : 3,
                    label : "Rebound (Trip), RB"
                },
                {
                    value : 4,
                    label : "Rebound (Close), RB"
                },
                {
                    value : 5,
                    label : "Contact wipe (Trip), CW"
                },
                {
                    value : 6,
                    label : "Contact wipe (Close), CW"
                },
                {
                    value : 7,
                    label : "Damping distance"
                },
            ],
            attribute : [
                {
                    value : "dref",
                    label : "d ref"
                },
                {
                    value : "ddev",
                    label : "d dev"
                },
            ]
        }
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
    },
    miscell : {
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
        label : "Miscellaneous",
        abs : {
            dataName : [
                {
                    value : 0,
                    label : "Bounce time"
                },
                {
                    value : 1,
                    label : "Bounce count"
                },
                {
                    value : 2,
                    label : "PIR close time"
                },
                {
                    value : 3,
                    label : "Reaction time"
                }
            ] ,
            attribute : [
                {
                    value : "min",
                    label : "Minimum"
                },
                {
                    value : "max",
                    label : "Maximum"
                },
            ]
        },
        rel : {
            dataName : [
                {
                    value : 0,
                    label : "Bounce time"
                },
                {
                    value : 1,
                    label : "Bounce count"
                },
                {
                    value : 2,
                    label : "PIR close time"
                },
                {
                    value : 3,
                    label : "Reaction time"
                }
            ] ,
            attribute : [
                {
                    value : "ref",
                    label : "Reference"
                },
                {
                    value : "dev",
                    label : "Deviation"
                },
            ]
        },
    },
    coilCharacter : {
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
        label : "Coil Characteristics",
        abs : {
            dataName : [
                {
                    value : 0,
                    label : "Peak close coil current"
                },
                {
                    value : 1,
                    label : "Peak trip coil current"
                },
                {
                    value : 2,
                    label : "Average close coil current"
                },
                {
                    value : 3,
                    label : "Average trip coil current"
                },
                {
                    value : 4,
                    label : "Average close coil voltage"
                },
                {
                    value : 5,
                    label : "Average trip coil voltage"
                },  
                {
                    value : 6,
                    label : "Close coil resistance"
                },
                {
                    value : 7,
                    label : "Trip coil resistance"
                },
            ],
            attribute : [
                {
                    value : "min",
                    label : "Minimum"
                },
                {
                    value : "max",
                    label : "Maximum"
                }
            ]
        },
        rel : {
            dataName : [
                {
                    value : 0,
                    label : "Peak close coil current"
                },
                {
                    value : 1,
                    label : "Peak trip coil current"
                },
                {
                    value : 2,
                    label : "Average close coil current"
                },
                {
                    value : 3,
                    label : "Average trip coil current"
                },
                {
                    value : 4,
                    label : "Average close coil voltage"
                },
                {
                    value : 5,
                    label : "Average trip coil voltage"
                },  
                {
                    value : 6,
                    label : "Close coil resistance"
                },
                {
                    value : 7,
                    label : "Trip coil resistance"
                },
            ],
            attribute : [
                {
                    value : "ref",
                    label : "Reference"
                },
                {
                    value : "devZ",
                    label : "- Deviation"
                },
                {
                    value : "devN",
                    label : "+ Deviation"
                }
            ]
        }
    },
    pickupVol : {
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
        label : "Pickup voltage",
        abs : {
            dataName : [
                {
                    value : 0,
                    label : "Minimum pickup voltage (close)"
                },
                {
                    value : 1,
                    label : "Minimum pickup voltage (trip)"
                }
            ],
            attribute : [
                {
                    value : "vmin",
                    label : "V min"
                },
                {
                    value : "vmax",
                    label : "V max"
                }
            ]
        },
        rel : {
            dataName : [
                {
                    value : 0,
                    label : "Minimum pickup voltage (close)"
                },
                {
                    value : 1,
                    label : "Minimum pickup voltage (trip)"
                }
            ],
            attribute : [
                {
                    value : "vref",
                    label : "V ref"
                },
                {
                    value : "vdev",
                    label : "V dev"
                }
            ]
        }
    },
    motorChar : {
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
        label : "Motor Characteristics",
        abs : {
            dataName : [
                {
                    value : 0,
                    label : "Inrush current"
                },
                {
                    value : 1,
                    label : "Charging time"
                },
                {
                    value : 2,
                    label : "Charging current"
                },
                {
                    value : 3,
                    label : "Minimum voltage"
                }
            ],
            attribute : [
                {
                    value : "min",
                    label : "Minimum"
                },
                {
                    value : "max",
                    label : "Maximum"
                }
            ]
        },
        rel : {
            dataName : [
                {
                    value : 0,
                    label : "Inrush current"
                },
                {
                    value : 1,
                    label : "Charging time"
                },
                {
                    value : 2,
                    label : "Charging current"
                },
                {
                    value : 3,
                    label : "Minimum voltage"
                }
            ],
            attribute : [
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
        label : "Under-voltage release"
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
        label : "Overcurrent release"
    },

}
export default assessmentLimitsTable