import { Outlet, Link } from "@remix-run/react";

export const handle = {
  Breadcrumb: () => {
    return <Link to={`/devices/list`}>devices</Link>;
  },
};

export default function SomeParent() {
  return <Outlet />;
}
