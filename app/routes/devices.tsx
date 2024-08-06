import { Outlet, Link } from "@remix-run/react";

export const handle = {
  breadcrumb: () => {
    return <Link to={`/devices/list`}>devices</Link>;
  },
};

export default function Devices() {
  return <Outlet />;
}
