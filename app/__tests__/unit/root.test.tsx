import { expect, describe, it } from "vitest";
import { loader, action } from "~/root";
import { userPrefs } from "~/cookies.server";

describe("root loader", () => {
  it("should return an object with the default theme and publically visible (to the client) env variables", async () => {
    const response = await loader({
      request: new Request("http://127.0.0.1:8000"),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data).toEqual({ theme: "dark", ENV: { NODE_ENV: "test" } });
  });

  it("should return the theme from the request cookie", async () => {
    const prefsCookie = await userPrefs.serialize({ theme: "light" });
    const request = new Request("http://127.0.0.1:8000", {
      headers: { Cookie: prefsCookie },
    });
    const response = await loader({
      request,
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.theme).toEqual("light");
  });
});

describe("root action", () => {
  it("should return undefined if no theme form data is included in the request", async () => {
    const formData = new FormData();
    formData.set("foo", "bar");
    const request = new Request("http://127.0.0.1:8000", {
      method: "POST",
      body: formData,
    });

    const response = await action({ request, params: {}, context: {} });
    expect(response).toBeUndefined();
  });

  it("should return valid json if theme form data is included in the request", async () => {
    const formData = new FormData();
    formData.set("theme", "dark");

    const request = new Request("http://127.0.0.1:8000", {
      method: "POST",
      body: formData,
    });

    const response = await action({ request, params: {}, context: {} });
    const cookie = response?.headers.get("Set-Cookie");

    const setCookieValue = await userPrefs.parse(cookie ?? null);

    expect(setCookieValue).toEqual({ theme: "dark" });
  });
});
