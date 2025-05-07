import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { createRoutesStub } from "react-router";
import { data } from "./testData";
import { EditJson } from "../../EditJson.client";

const RemixStub = createRoutesStub([
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
