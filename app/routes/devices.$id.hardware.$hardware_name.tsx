import { Link, Outlet, useParams } from "@remix-run/react";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { id: string; hardware_name: string };
  }) => {
    const { id, hardware_name } = params;
    return (
      <Link to={`/devices/${id}/hardware/${hardware_name}`}>
        {hardware_name}
      </Link>
    );
  },
};

export default function Hardware() {
  const { hardware_name } = useParams();
  return (
    <div>
      <div className="divider"></div>
      <div className="font-mono">{hardware_name}</div>
      <div className="divider"></div>
      <Outlet />
    </div>
  );
}
