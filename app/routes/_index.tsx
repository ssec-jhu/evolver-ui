import { redirect } from "@remix-run/node";
import { pingDevice } from "~/utils/pingDevice.server";

export async function loader() {
  // by default, if user navigates to root path '/' and device is available locally redirect them to that device's page
  try {
    const isOnline = await pingDevice("127.0.0.1");
    if (isOnline) {
      return redirect("/device/127.0.0.1");
    }
    throw new Error("Local device is not available");
  } catch (error) {
    // otherwise redirect them to the devices page
    return redirect("/devices");
  }
}
