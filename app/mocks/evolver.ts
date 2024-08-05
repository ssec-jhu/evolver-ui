import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://127.0.0.1:8080/healthz", () => {
    return HttpResponse.json({
      status: 200,
    });
  }),
];
