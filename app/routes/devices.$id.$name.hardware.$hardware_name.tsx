import { Link, Outlet } from "react-router";
import { ROUTES } from "~/utils/routes";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: { id: string; hardware_name: string; name: string };
  }) => {
    const { id, hardware_name, name } = params;
    return (
      <Link
        to={ROUTES.device.hardware.current({
          id,
          name,
          hardwareName: hardware_name,
        })}
      >
        {hardware_name}
      </Link>
    );
  },
};

export default function Hardware() {
  return <Outlet />;
}
