import { redirect, redirectDocument } from "react-router";

export function Component() {
  return null;
}

export async function loader() {
  return redirectDocument("/devices/list");
}
