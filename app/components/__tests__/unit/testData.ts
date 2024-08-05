export const schema = {
  $defs: {
    ConfigDescriptor: {
      properties: {
        classinfo: {
          description: "fully qualified class name",
          title: "Classinfo",
          type: "string",
        },
        config: {
          default: {},
          title: "Config",
          type: "object",
        },
      },
      required: ["classinfo"],
      title: "ConfigDescriptor",
      type: "object",
    },
    evolver__connection__interface__Connection__Config: {
      properties: {
        name: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
          default: null,
          title: "Name",
        },
      },
      title: "Config",
      type: "object",
    },
    evolver__controller__interface__Controller__Config: {
      properties: {
        name: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
          default: null,
          title: "Name",
        },
      },
      title: "Config",
      type: "object",
    },
    evolver__hardware__interface__HardwareDriver__Config: {
      properties: {
        name: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
          default: null,
          title: "Name",
        },
      },
      title: "Config",
      type: "object",
    },
    evolver__history__HistoryServer__Config: {
      properties: {
        name: {
          default: "HistoryServer",
          title: "Name",
          type: "string",
        },
      },
      title: "Config",
      type: "object",
    },
  },
  properties: {
    name: {
      default: "Evolver",
      title: "Name",
      type: "string",
    },
    vials: {
      default: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      items: {},
      title: "Vials",
      type: "array",
    },
    hardware: {
      additionalProperties: {
        anyOf: [
          {
            $ref: "#/$defs/ConfigDescriptor",
          },
          {
            $ref: "#/$defs/evolver__hardware__interface__HardwareDriver__Config",
          },
        ],
      },
      default: {},
      title: "Hardware",
      type: "object",
    },
    controllers: {
      default: [],
      items: {
        anyOf: [
          {
            $ref: "#/$defs/ConfigDescriptor",
          },
          {
            $ref: "#/$defs/evolver__controller__interface__Controller__Config",
          },
        ],
      },
      title: "Controllers",
      type: "array",
    },
    serial: {
      anyOf: [
        {
          $ref: "#/$defs/ConfigDescriptor",
        },
        {
          $ref: "#/$defs/evolver__connection__interface__Connection__Config",
        },
      ],
      default: {
        classinfo: "evolver.serial.EvolverSerialUART",
        config: {
          baudrate: 9600,
          name: "EvolverSerialUART",
          port: "/dev/ttyAMA0",
          timeout: 1,
        },
      },
      title: "Serial",
    },
    history: {
      anyOf: [
        {
          $ref: "#/$defs/ConfigDescriptor",
        },
        {
          $ref: "#/$defs/evolver__history__HistoryServer__Config",
        },
      ],
      default: {
        classinfo: "evolver.history.HistoryServer",
        config: {
          name: "HistoryServer",
        },
      },
      title: "History",
    },
    enable_control: {
      default: true,
      title: "Enable Control",
      type: "boolean",
    },
    enable_commit: {
      default: true,
      title: "Enable Commit",
      type: "boolean",
    },
    interval: {
      default: 20,
      title: "Interval",
      type: "integer",
    },
  },
  title: "Config",
  type: "object",
};

export const data = {
  name: "FOO",
  vials: [15, 9, 0, 5],
  hardware: {
    od: {
      classinfo: "evolver.hardware.standard.od_sensor.ODSensor",
      config: {
        name: "ODSensor",
        vials: [0, 5, 10, 15],
        addr: "od_90",
        slots: 16,
        serial_conn: null,
        integrations: 500,
      },
    },
    odB: {
      classinfo: "evolver.hardware.standard.od_sensor.ODSensor",
      config: {
        name: "ODSensor",
        vials: [0, 5, 10, 15],
        addr: "od_135",
        slots: 16,
        serial_conn: null,
        integrations: 500,
      },
    },
    temp: {
      classinfo: "evolver.hardware.standard.temperature.Temperature",
      config: {
        name: "Temperature",
        vials: [0, 5, 10, 15],
        addr: "temp",
        slots: 16,
        serial_conn: null,
      },
    },
  },
  controllers: [],
  serial: {
    classinfo: "evolver.serial.EvolverSerialUART",
    config: {
      name: "EvolverSerialUART",
      port: "/dev/ttyAMA0",
      baudrate: 9600,
      timeout: 1,
    },
  },
  history: {
    classinfo: "evolver.history.HistoryServer",
    config: {
      name: "HistoryServer",
    },
  },
  enable_control: true,
  enable_commit: true,
  interval: 20,
};
