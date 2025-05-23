import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Navbar from "~/components/Navbar";
import { createRoutesStub } from "react-router";

const RemixStub = createRoutesStub([
  {
    path: "/",
    Component: () => <Navbar pathname="/devices/list" />,
    loader() {
      return { theme: "dark" };
    },
  },
]);

test("shows the devices link", async () => {
  await render(<RemixStub />);
  expect(await screen.findAllByText("devices")).toHaveLength(1);
});

test("shows the theme toggle", async () => {
  await render(<RemixStub />);
  expect(await screen.findAllByText("sun")).toHaveLength(1);
});
