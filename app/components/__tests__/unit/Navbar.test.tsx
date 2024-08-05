import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Navbar from "~/components/Navbar";
import { createRemixStub } from "@remix-run/testing";
import { json } from "@remix-run/node";

const RemixStub = createRemixStub([
  {
    path: "/",
    Component: () => <Navbar pathname="/devices" />,
    loader() {
      return json({ theme: "dark" });
    },
  },
]);

test("shows the devices link", async () => {
  await render(<RemixStub />);
  expect(await screen.findAllByText("Devices")).toHaveLength(1);
});

test("shows the theme toggle", async () => {
  await render(<RemixStub />);
  expect(await screen.findAllByText("switch theme")).toHaveLength(1);
});
