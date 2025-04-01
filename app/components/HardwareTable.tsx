import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { EvolverConfigWithoutDefaults } from "client";
import clsx from "clsx";

export function HardwareTable({
  evolverConfig,
  hardwareName,
}: {
  evolverConfig: EvolverConfigWithoutDefaults;
  hardwareName: string;
}) {
  const { pathname } = useLocation();
  const { name, id } = useParams();
  const [queryParams] = useSearchParams();

  const currentPath = pathname.split("/").pop();
  let currentVials: string[] | undefined = [];
  if (queryParams.has("vials")) {
    currentVials = queryParams?.get("vials")?.split(",");
  }
  const evolverHardware = evolverConfig.hardware;

  const TableRows = Object.keys(evolverHardware).map((key) => {
    const vials = evolverHardware[key]?.config?.vials;

    const vialsWithLinks = vials?.map((vial) => {
      const linkTo = `/devices/${id}/${name}/hardware/${key}/history?vials=${vial}`;
      const activeVial =
        currentVials?.includes(vial.toString()) && hardwareName === key;
      const vialButtons = (
        <Link
          key={vial}
          className={clsx(
            "font-mono",
            "font-extralight",
            "btn",
            "join-item",
            "btn-outline",
            activeVial && "btn-active",
          )}
          to={linkTo}
        >
          {vial}
        </Link>
      );

      return vialButtons;
    });
    const allButton = (
      <Link
        className={clsx(
          "btn",
          "join-item",
          "btn-outline",
          key === hardwareName &&
            vials?.length === currentVials?.length &&
            "btn-active",
          "font-mono",
          "font-extralight",
        )}
        key={"all"}
        to={
          vials
            ? `/devices/${id}/${name}/hardware/${key}/history?vials=${vials?.join(",")}`
            : `/devices/${id}/${name}/hardware/${key}/history`
        }
      >
        {" "}
        select all
      </Link>
    );

    return (
      <tr
        key={key}
        className={clsx(
          hardwareName === key && "bg-base-100",
          hardwareName !== key && "hover",
          "font-mono",
        )}
      >
        <td className="font-mono">{key}</td>
        <td>
          <div className="join">
            {vialsWithLinks}
            {allButton}
          </div>
        </td>
        <td className="flex justify-end font-sans">
          <Link
            className={clsx(
              "btn btn-outline",
              key === hardwareName &&
                currentPath === "calibrate" &&
                "btn-active",
            )}
            to={`/devices/${id}/${name}/hardware/${key}/calibrate`}
          >
            calibrate
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <table className="table">
      <thead>
        <tr>
          <th>name</th>
          <th>vial history</th>
          <th className="flex justify-end">actions</th>
        </tr>
      </thead>
      <tbody>{TableRows}</tbody>
    </table>
  );
}
