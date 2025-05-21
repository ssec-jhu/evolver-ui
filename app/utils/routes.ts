interface DeviceRouteParams {
  id: string;
  name: string;
}

interface DeviceRouteHardwareParams {
  hardwareName: string;
}

interface DeviceRouteExperimentParams {
  experimentId: string;
}

interface ExperimentControllerParams {
  controllerId: string;
}

interface HardwareRouteGroup {
  list: (param1: DeviceRouteParams) => string;
  current: (param1: DeviceRouteParams & DeviceRouteHardwareParams) => string;
  history: (param1: DeviceRouteParams & DeviceRouteHardwareParams) => string;
  calibrate: (param1: DeviceRouteParams & DeviceRouteHardwareParams) => string;
}

interface ExperimentRouteGroup {
  list: (param1: DeviceRouteParams) => string;
  current: (param1: DeviceRouteParams & DeviceRouteExperimentParams) => string;
  logs: (param1: DeviceRouteParams & DeviceRouteExperimentParams) => string;
  controllers: {
    current: {
      config: (
        param1: DeviceRouteParams &
          DeviceRouteExperimentParams &
          ExperimentControllerParams,
      ) => string;
    };
  };
}

type DeviceRouteGroup = {
  current: (param1: DeviceRouteParams) => string;
  config: (param1: DeviceRouteParams) => string;
  state: (param1: DeviceRouteParams) => string;
  hardware: HardwareRouteGroup;
  experiment: ExperimentRouteGroup;
};

type RoutesConfig = {
  static: Record<string, string>;
  device: DeviceRouteGroup;
};

export const ROUTES: RoutesConfig = {
  static: {
    root: "/",
    devices: "/devices/list",
  },
  device: {
    current: ({ id, name }) => `/devices/${id}/${name}`,
    state: ({ id, name }) => `/devices/${id}/${name}/state`,
    config: ({ id, name }) => `/devices/${id}/${name}/config`,
    hardware: {
      list: ({ id, name }) => `/devices/${id}/${name}/hardware`,
      current: ({ id, name, hardwareName }) =>
        `/devices/${id}/${name}/hardware/${hardwareName}`,
      history: ({ id, name, hardwareName }) =>
        `/devices/${id}/${name}/hardware/${hardwareName}/history`,
      calibrate: ({ id, name, hardwareName }) =>
        `/devices/${id}/${name}/hardware/${hardwareName}/calibrate`,
    },
    experiment: {
      list: ({ id, name }) => `/devices/${id}/${name}/experiments`,
      current: ({ id, name, experimentId }) =>
        `/devices/${id}/${name}/experiments/${experimentId}`,
      logs: ({ id, name, experimentId }) =>
        `/devices/${id}/${name}/experiments/${experimentId}/logs`,
      controllers: {
        current: {
          config: ({
            id,
            name,
            experimentId,
            controllerId,
          }: DeviceRouteParams &
            DeviceRouteExperimentParams &
            ExperimentControllerParams) =>
            `/devices/${id}/${name}/experiments/${experimentId}/controllers/${controllerId}/config`,
        },
      },
    },
  },
};
