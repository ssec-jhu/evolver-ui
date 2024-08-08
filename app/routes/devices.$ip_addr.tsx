import { Outlet, Link, useParams } from "@remix-run/react";

export const handle = {
  Breadcrumb: () => {
    const { ip_addr } = useParams();
    return <Link to={`/devices/${ip_addr}/hardware`}>{ip_addr}</Link>;
  },
};

export default function SomeParent() {
  return <Outlet />;
}
