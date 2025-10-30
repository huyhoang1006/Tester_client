class AssessmentLimitsDto {
    constructor() {
        this.limits = 'Absolute';
        this.contact_resistance = {
            abs: {
                name : "Contact resistance",
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
                name : "Contact resistance",
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
            trip_operation : {
                abs : {
                    switching_time_type_a : {
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
                    min : {
                        value: ''
                    },
                    max : {
                        value: ''
                    }
                },
                pir_close_time : {
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
                        value: ''
                    },
                    dev : {
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