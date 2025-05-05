import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/devices": {};
  "/devices/:id/:name": {
    "id": string;
    "name": string;
  };
  "/devices/:id/:name/experiments": {
    "id": string;
    "name": string;
  };
  "/devices/:id/:name/experiments/:experiment_id": {
    "id": string;
    "name": string;
    "experiment_id": string;
  };
  "/devices/:id/:name/experiments/:experiment_id/:controller_id/config": {
    "id": string;
    "name": string;
    "experiment_id": string;
    "controller_id": string;
  };
  "/devices/:id/:name/experiments/:experiment_id/logs": {
    "id": string;
    "name": string;
    "experiment_id": string;
  };
  "/devices/:id/:name/hardware": {
    "id": string;
    "name": string;
  };
  "/devices/:id/:name/hardware/:hardware_name": {
    "id": string;
    "name": string;
    "hardware_name": string;
  };
  "/devices/:id/:name/hardware/:hardware_name/calibrate": {
    "id": string;
    "name": string;
    "hardware_name": string;
  };
  "/devices/:id/:name/hardware/:hardware_name/history": {
    "id": string;
    "name": string;
    "hardware_name": string;
  };
  "/devices/:id/:name/config": {
    "id": string;
    "name": string;
  };
  "/devices/:id/:name/state": {
    "id": string;
    "name": string;
  };
  "/devices/list": {};
};