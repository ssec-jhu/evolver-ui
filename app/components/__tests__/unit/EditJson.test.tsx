import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { createRemixStub } from "@remix-run/testing";
import { json } from "@remix-run/node";
import { data, schema } from "./testData";
import { EditJson } from "../../EditJson.client";
import { SomeJSONSchema } from "ajv/dist/types/json-schema";

const RemixStub = createRemixStub([
  {
    path: "/",
    Component: () => (
      <EditJson
        schema={schema as SomeJSONSchema}
        data={data}
        mode="view"
        setData={() => null}
      />
    ),
    loader() {
      return json({ theme: "dark" });
    },
  },
]);

test("renders the data", async () => {
  // Arrange
  await render(<RemixStub />);
  // Assert
  expect(await screen.findAllByText(`"${data.name}"`)).toHaveLength(1);
});
