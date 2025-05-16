import { redirect } from "react-router";

export function Component() {
  return null;
}

export async function loader() {
  return redirect("/devices");
}
