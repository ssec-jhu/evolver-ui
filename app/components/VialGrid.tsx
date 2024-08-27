import { Link } from "@remix-run/react";
import clsx from "clsx";

const DataTable = ({
  data,
  id,
  vialIndex,
}: {
  id: string;
  vialIndex: number;
  data: { [key: string]: number | null };
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th>
              <Link to={`/devices/${id}/hardware`}>hardware</Link>{" "}
            </th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).map((mainKey) =>
            Object.keys(data[mainKey]).map((subKey, subIndex) => {
              let renderSubKey = true;
              switch (subKey) {
                case "vial":
                case "name":
                  renderSubKey = false;
                  break;

                default:
                  break;
              }
              return (
                <tr key={`${mainKey}-${subKey}`}>
                  {subIndex === 0 && (
                    <td
                      rowSpan={Object.keys(data[mainKey]).length}
                      className="text-center"
                    >
                      <Link
                        className="link"
                        to={`/devices/${id}/hardware/${mainKey}/history?vials=${vialIndex}`}
                      >
                        {mainKey}
                      </Link>
                    </td>
                  )}
                  {renderSubKey && (
                    <td>
                      <Link
                        className="link"
                        to={`/devices/${id}/hardware/${mainKey}/history?properties=${subKey}&vials=${vialIndex}`}
                      >
                        {subKey}
                      </Link>
                    </td>
                  )}
                  {renderSubKey && (
                    <td>
                      {data[mainKey][subKey] !== null &&
                        data[mainKey][subKey].toString()}
                      {data[mainKey][subKey] == null && "-"}
                    </td>
                  )}
                </tr>
              );
            }),
          )}
        </tbody>
      </table>
    </div>
  );
};

export function VialGrid({
  vialCount,
  stateData,
  id,
}: {
  vialCount: number;
  stateData: { [key: string]: { [key: string]: { [key: string]: number } } };
  id: string;
}) {
  const gridItems = Array.from({ length: vialCount }, (_, index) => {
    const indexString = index.toString();

    // Find matching data in stateData based on indexString
    const matchingData = Object.keys(stateData).reduce(
      (acc, key) => {
        if (stateData[key][indexString]) {
          acc[key] = stateData[key][indexString];
        }
        return acc;
      },
      {} as { [key: string]: { [key: string]: number } },
    );

    // Spread matchingData into the return object
    return { index, ...matchingData };
  });
  const cells = gridItems.map(({ index, ...data }) => {
    const hasData = Object.keys(data).length > 0;
    return (
      <div
        key={index}
        className={clsx(
          "relative flex items-center justify-center aspect-square border font-bold rounded-md",
          !hasData && "border-2 border-gray-300",
          hasData && "border-4 border-primary",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center text-neutral text-opacity-25">
          <span className="block text-[5vw] leading-none">{index}</span>
        </div>
        {hasData && (
          <div className="relative z-10">
            <DataTable data={data} id={id} vialIndex={index} />
          </div>
        )}
      </div>
    );
  });

  return <div className="grid grid-cols-4 grid-rows-4 gap-2">{cells}</div>;
}
