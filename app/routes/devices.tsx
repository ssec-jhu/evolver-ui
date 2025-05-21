import { Outlet, Link } from "react-router";
import { ROUTES } from "~/utils/routes";

export const handle = {
  breadcrumb: () => {
    return <Link to={ROUTES.static.devices}>devices</Link>;
  },
};

export default function Devices() {
  return <Outlet />;
}
