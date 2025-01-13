import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { createRemixStub } from "@remix-run/testing";
import { data } from "./testData";
import { EditJson } from "../../EditJson.client";

const RemixStub = createRemixStub([
  {
    path: "/",
    Component: () => <EditJson data={data} mode="view" setData={() => null} />,
    loader() {
      return { theme: "dark" };
    },
  },
]);

test("renders the data", async () => {
  // Arrange
  await render(<RemixStub />);
  // Assert
  expect(await screen.findAllByText(`"${data.name}"`)).toHaveLength(1);
});
