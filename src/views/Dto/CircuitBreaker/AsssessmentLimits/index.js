class AssessmentLimitsDto {
    constructor() {
        this.limits = 'Absolute';
        this.contact_resistance = {
            mrid: '',
            name : "Contact resistance",
            abs: {
                r_min : {
                    mrid: '',
                    value: '',
                    unit: 'µ|Ω'
                },
                r_max : {
                    mrid: '',
                    value: '',
                    unit: 'µ|Ω'
                }
            },
            rel: {
                r_ref : {
                    mrid: '',
                    value: '',
                    unit: 'µ|Ω'
                },
                r_dev : {
                    mrid: '',
                    value: '',
                    unit: 'µ|Ω'
                }
            }
        },
        this.operating_time = {
            abs : {
                opening_time : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                opening_sync_within_phase : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                opening_sync_breaker_phase : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                closing_time : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                closing_sync_within_phase : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                closing_sync_breaker_phase : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                reclosing_time : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                close_open_time : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                open_close_time : {
                    mrid: "",
                    t_min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    t_max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                }
            },
            rel : {
                opening_time : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                opening_sync_within_phase : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                opening_sync_breaker_phase : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                closing_time : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                closing_sync_within_phase : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                closing_sync_breaker_phase : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                reclosing_time : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                close_open_time : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                open_close_time : {
                    mrid: "",
                    t_ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    plus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    minus_t_dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                }
            }
        },
        this.contact_travel = {
            abs : {
                total_travel : {
                    mrid : '',
                    d_min : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_max : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                over_travel_trip : {
                    mrid : '',
                    d_min : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_max : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                over_travel_close : {
                    mrid : '',
                    d_min : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_max : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                rebound_trip : {
                    mrid : '',
                    d_min : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_max : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                rebound_close : {
                    mrid : '',
                    d_min : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_max : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                contact_wipe_trip : {
                    mrid : '',
                    d_min : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_max : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                contact_wipe_close : {
                    mrid : '',
                    d_min : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_max : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                damping_distance : {
                    mrid : '',
                    d_min : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_max : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                }
            },
            rel : {
                total_travel : {
                    d_ref : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_dev : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                over_travel_trip : {
                    d_ref : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_dev : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                over_travel_close : {
                    d_ref : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_dev : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                rebound_trip : {
                    d_ref : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_dev : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                rebound_close : {
                    d_ref : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_dev : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                contact_wipe_trip : {
                    d_ref : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_dev : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                contact_wipe_close : {
                    d_ref : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_dev : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                },
                damping_distance : {
                    d_ref : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    },
                    d_dev : {
                        mrid: '',
                        value: '',
                        unit: 'mm'
                    }
                }
            }
        },
        this.auxiliary_contacts = {
            mrid : '',
            trip_operation : {
                abs : {
                    switching_time_type_a : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    diff_to_main_type_a : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    switching_time_type_b : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    diff_to_main_type_b : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    switching_time_wiper : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    duration : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    }
                },
                rel : {
                    switching_time_type_a : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    diff_to_main_type_a : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    switching_time_type_b : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    diff_to_main_type_b : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    switching_time_wiper : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    duration : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    }
                },
            },
            close_operation : {
                abs : {
                    switching_time_type_a : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    diff_to_main_type_a : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    switching_time_type_b : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    diff_to_main_type_b : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    switching_time_wiper : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    duration : {
                        mrid : '',
                        t_min : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_max : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    }
                },
                rel : {
                    switching_time_type_a : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    diff_to_main_type_a : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    switching_time_type_b : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    diff_to_main_type_b : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    switching_time_wiper : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    },
                    duration : {
                        t_ref : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        },
                        t_dev : {
                            mrid: '',
                            value: '',
                            unit: 'm|s'
                        }
                    }
                },
            }
        },
        this.miscellaneous = {
            abs : {
                bounce_time : {
                    mrid: "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                bounce_count : {
                    mrid: "",
                    min : {
                        mrid : "",
                        value: ''
                    },
                    max : {
                        mrid : "",
                        value: ''
                    }
                },
                pir_close_time : {
                    mrid: "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                reaction_time : {
                    mrid: "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                }
            },
            rel : {
                bounce_time : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                bounce_count : {
                    ref : {
                        mrid : "",
                        value: ''
                    },
                    dev : {
                        mrid : "",
                        value: ''
                    }
                },
                pir_close_time : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                },
                reaction_time : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 'm|s'
                    }
                }
            }
        },
        this.coil_characteristics = {
            abs : {
                peak_close_coil_current : {
                    mrid : "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                peak_trip_coil_current : {
                    mrid : "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                average_close_coil_current : {
                    mrid : "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                average_trip_coil_current : {
                    mrid : "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                average_close_coil_voltage : {
                    mrid : "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                },
                average_trip_coil_voltage : {
                    mrid : "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                },
                close_coil_resistance : {
                    mrid : "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    }
                },
                trip_coil_resistance : {
                    mrid : "",
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    }
                },
            },
            rel : {
                peak_close_coil_current : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    minus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    plus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                peak_trip_coil_current : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    minus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    plus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                average_close_coil_current : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    minus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    plus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                average_trip_coil_current : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    minus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    plus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                average_close_coil_voltage : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    minus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    plus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                },
                average_trip_coil_voltage : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    minus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    plus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                },
                close_coil_resistance : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    },
                    minus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    },
                    plus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    }
                },
                trip_coil_resistance : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    },
                    minus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    },
                    plus_dev : {
                        mrid: '',
                        value: '',
                        unit: 'Ω'
                    }
                },
            }
        },
        this.pickup_voltage = {
            abs : {
                min_pickup_voltage_close : {
                    mrid : '',
                    v_min : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    v_max : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                },
                min_pickup_voltage_trip : {
                    mrid : '',
                    v_min : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    v_max : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                }
            },
            rel : {
                min_pickup_voltage_close : {
                    v_ref : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    v_dev : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                },
                min_pickup_voltage_trip : {
                    v_ref : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    v_dev : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                }
            }
        },
        this.motor_characteristics = {
            abs : {
                inrush_current : {
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                charging_time : {
                    max : {
                        mrid: '',
                        value: '',
                        unit: 's'
                    },
                    min : {
                        mrid: '',
                        value: '',
                        unit: 's'
                    }
                },
                charging_current : {
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                minimum_voltage : {
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                }
            },
            rel : {
                inrush_current : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                charging_time : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 's'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 's'
                    }
                },
                charging_current : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                },
                minimum_voltage : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                }
            }
        }
        this.under_voltage_release = {
            mrid : '',
            name : "UV Coil Trip Voltage",
            abs : {
                uv_coil_trip_voltage : {
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                }
            },
            rel : {
                uv_coil_trip_voltage : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 'V'
                    }
                }
            }
        },
        this.overcurrent_release = {
            mrid : '',
            name : "OC Relay Trip Current",
            abs : {
                oc_replay_trip_current : {
                    min : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    max : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                }
            },
            rel : {
                oc_replay_trip_current : {
                    ref : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                    dev : {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    }
                }
            }
        }
    }
}
export default AssessmentLimitsDto;