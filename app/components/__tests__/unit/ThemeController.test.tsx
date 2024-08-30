import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { createRemixStub } from "@remix-run/testing";
import { json } from "@remix-run/node";
import ThemeController from "~/components/ThemeController";

const RemixStub = createRemixStub([
  {
    path: "/",
    Component: () => <ThemeController />,
    loader: () => {
      return json({ theme: "dark" });
    },
  },
]);

test("shows light icon when theme is dark", async () => {
  await render(<RemixStub />);
  expect(await screen.findAllByTitle("sun")).toHaveLength(1);
  expect(await screen.findAllByTitle("moon")).toHaveLength(1);
  const toggle = await screen.getByRole("switch");
  expect(toggle.getAttribute("value")).toBe("light");
});
