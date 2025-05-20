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
      state: { ...deviceData.state },
      last_read: {},
      active: true,
      config: {
        name: deviceData.name,
        namespace: "test",
        vials: [...Array(16).keys()], // Creates array [0, 1, 2, ..., 15]
        hardware: {},
        experiments: {},
        enable_control: true,
        interval: 60,
        log_level: 20,
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
      state: { od_sensor: {}, test: { value: 123 } },
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
