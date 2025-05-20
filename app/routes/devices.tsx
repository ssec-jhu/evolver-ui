import { Outlet, Link } from "react-router";

export const handle = {
  breadcrumb: () => {
    return <Link to={`/devices/list`}>devices</Link>;
  },
};

export default function Devices() {
  return <Outlet />;
}
