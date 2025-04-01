import { Link, Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { id: string; hardware_name: string; name: string };
  }) => {
    const { id, hardware_name, name } = params;
    return (
      <Link to={`/devices/${id}/${name}/hardware/${hardware_name}`}>
        {hardware_name}
      </Link>
    );
  },
};

export default function Hardware() {
  return <Outlet />;
}
