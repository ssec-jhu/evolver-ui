import { http, HttpResponse } from "msw";

// Create mock data for each device we want to support
const mockDevicesData = {
  // Our standard test device
  "127.0.0.1:8080": {
    state: {
      active: true,
      // Add other state properties as needed
    },
    name: "Test Evolver Device",
  },

  // Another device for adding in tests
  "192.168.1.100:8080": {
    state: {
      active: false,
      // Add other state properties as needed
    },
    name: "New Test Device",
  },
};

// handlers for pingDevice function to work properly
export const handlers = [
  // Health check endpoint
  http.get(/\/healthz$/, () => {
    return HttpResponse.json({ status: 200 });
  }),

  // Root endpoint for describe call
  http.get(/^http:\/\/[^/]+\/$/, ({ request }) => {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const port = url.port;
    const deviceIP = `${hostname}:${port}`;

    const deviceData = mockDevicesData[deviceIP] || {
      state: { active: true },
      name: "Unknown Device",
    };

    const response = {
      state: {
        od_sensor: {},
        test: {
          "0": {
            "name": "test",
            "vial": 0,
            "raw": 1,
            "value": null
          },
          "1": {
            "name": "test",
            "vial": 1,
            "raw": 1,
            "value": null
          },
          "2": {
            "name": "test",
            "vial": 2,
            "raw": 1,
            "value": null
          }
        }
      },
      last_read: { od_sensor: Date.now() / 1000, test: Date.now() / 1000 },
      active: deviceData.state.active,
      config: {
        name: deviceData.name,
        namespace: "unspecified",
        vial_layout: [4, 4],
        vials: [...Array(16).keys()], // Creates array [0, 1, 2, ..., 15]
        hardware: {
          od_sensor: {
            classinfo: "evolver.hardware.standard.od_sensor.ODSensor",
            config: {
              name: "od_sensor",
              calibrator: null,
              vials: [0, 1, 2, 3],
              addr: "od_90",
              slots: 16,
              serial_conn: null,
              integrations: 500
            }
          },
          pump: {
            classinfo: "evolver.hardware.standard.pump.GenericPump",
            config: {
              name: "pump",
              calibrator: {
                classinfo: "evolver.calibration.standard.calibrators.pump.GenericPumpCalibrator",
                config: {
                  name: "GenericPumpCalibrator",
                  dir: "calibration_files",
                  created: "2025-05-06T09:19:42.079249",
                  expire: "P168D",
                  input_transformer: null,
                  output_transformer: null,
                  no_refit: false,
                  calibration_file: null,
                  procedure_file: null,
                  vials: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                  default_input_transformer: null,
                  default_output_transformer: null,
                  time_to_pump_fast: 10,
                  time_to_pump_slow: 100
                }
              },
              vials: [0, 1, 2, 3],
              addr: "pmp",
              slots: 16,
              serial_conn: null,
              ipp_pumps: [],
              active_pumps: [0, 1, 2, 3, 4, 5, 6, 7]
            }
          },
          stirrer: {
            classinfo: "evolver.hardware.standard.stir.Stir",
            config: {
              name: "stirrer",
              calibrator: null,
              vials: [0, 1, 2, 3],
              addr: "stir",
              slots: 16,
              serial_conn: null,
              stir_max: 98
            }
          },
          test: {
            classinfo: "evolver.hardware.demo.NoOpSensorDriver",
            config: {
              name: "test",
              calibrator: {
                classinfo: "evolver.calibration.standard.calibrators.temperature.TemperatureCalibrator",
                config: {
                  name: "TemperatureCalibrator",
                  dir: "calibration_files",
                  created: "2025-05-02T09:21:00.636783",
                  expire: "P168D",
                  input_transformer: {
                    "0": {
                      classinfo: "evolver.calibration.standard.polyfit.LinearTransformer",
                      config: {
                        name: "LinearTransformer",
                        dir: "calibration_files",
                        created: "2025-05-02T09:21:00.636211",
                        expire: "P168D",
                        degree: 1,
                        parameters: null
                      }
                    },
                    "1": {
                      classinfo: "evolver.calibration.standard.polyfit.LinearTransformer",
                      config: {
                        name: "LinearTransformer",
                        dir: "calibration_files",
                        created: "2025-05-02T09:21:00.636315",
                        expire: "P168D",
                        degree: 1,
                        parameters: null
                      }
                    },
                    "2": {
                      classinfo: "evolver.calibration.standard.polyfit.LinearTransformer",
                      config: {
                        name: "LinearTransformer",
                        dir: "calibration_files",
                        created: "2025-05-02T09:21:00.636409",
                        expire: "P168D",
                        degree: 1,
                        parameters: null
                      }
                    }
                  },
                  output_transformer: {
                    "0": {
                      classinfo: "evolver.calibration.standard.polyfit.LinearTransformer",
                      config: {
                        name: "LinearTransformer",
                        dir: "calibration_files",
                        created: "2025-05-02T09:21:00.636507",
                        expire: "P168D",
                        degree: 1,
                        parameters: null
                      }
                    },
                    "1": {
                      classinfo: "evolver.calibration.standard.polyfit.LinearTransformer",
                      config: {
                        name: "LinearTransformer",
                        dir: "calibration_files",
                        created: "2025-05-02T09:21:00.636596",
                        expire: "P168D",
                        degree: 1,
                        parameters: null
                      }
                    },
                    "2": {
                      classinfo: "evolver.calibration.standard.polyfit.LinearTransformer",
                      config: {
                        name: "LinearTransformer",
                        dir: "calibration_files",
                        created: "2025-05-02T09:21:00.636686",
                        expire: "P168D",
                        degree: 1,
                        parameters: null
                      }
                    }
                  },
                  no_refit: false,
                  calibration_file: null,
                  procedure_file: "test_2025_05_20T11_41_16.yml",
                  vials: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                  default_input_transformer: null,
                  default_output_transformer: {
                    classinfo: "evolver.calibration.standard.polyfit.LinearTransformer",
                    config: {
                      name: "LinearTransformer",
                      dir: "calibration_files",
                      created: "2025-05-02T09:21:00.636922",
                      expire: "P168D",
                      degree: 1,
                      parameters: null
                    }
                  },
                  num_temp_readings: 3,
                  heater_boundary_low: 0,
                  heater_boundary_high: 1000,
                  heater_slope_init: 0.02
                }
              },
              vials: [0, 1, 2],
              echo_raw: 1,
              echo_val: 2
            }
          }
        },
        experiments: {
          example_experiment: {
            name: null,
            enabled: true,
            controllers: [
              {
                classinfo: "evolver.controller.demo.NoOpController",
                config: {
                  name: "noop_controller_666",
                  vial_volume: 20,
                  start_delay: 1,
                  min_od: 0.5,
                  bolus_volume: 2,
                  dilution_rate: 0.1,
                  stir_rate: 8
                }
              }
            ]
          }
        },
        serial: {
          classinfo: "evolver.serial.EvolverSerialUART",
          config: {
            name: "EvolverSerialUART",
            port: "/dev/ttyAMA0",
            baudrate: 9600,
            timeout: 1
          }
        },
        history: {
          classinfo: "evolver.history.standard.HistoryServer",
          config: {
            name: "HistoryServer",
            namespace: null,
            partition_seconds: 3600,
            buffer_partitions: 3,
            default_window: 3600,
            default_n_max: 5000
          }
        },
        enable_control: true,
        interval: 20,
        raise_loop_exceptions: false,
        abort_on_control_errors: false,
        abort_on_commit_errors: false,
        skip_control_on_read_failure: true,
        log_level: 21
      },
    };
    return HttpResponse.json(response);
  }),

  // State endpoint
  http.get(/\/state$/, ({ request }) => {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const port = url.port;
    const deviceIP = `${hostname}:${port}`;

    console.log(`[MSW] Intercepted state call for ${deviceIP}`);

    const deviceData = mockDevicesData[deviceIP] || {
      state: { active: true },
      name: "Unknown Device",
    };

    // Return the proper state structure expected by the component
    return HttpResponse.json({
      state: {
        od_sensor: {},
        test: {
          "0": {
            "name": "test",
            "vial": 0,
            "raw": 1,
            "value": null
          },
          "1": {
            "name": "test",
            "vial": 1,
            "raw": 1,
            "value": null
          },
          "2": {
            "name": "test",
            "vial": 2,
            "raw": 1,
            "value": null
          }
        }
      },
      last_read: { od_sensor: Date.now() / 1000, test: Date.now() / 1000 },
      active: deviceData.state.active
    });
  }),

  // Any other API endpoints
  http.get("*", ({ request }) => {
    console.log(`[MSW] Unhandled GET request: ${request.url}`);
    return HttpResponse.json({ success: true });
  }),

  http.post("*", ({ request }) => {
    console.log(`[MSW] Unhandled POST request: ${request.url}`);
    return HttpResponse.json({ success: true });
  }),
];
