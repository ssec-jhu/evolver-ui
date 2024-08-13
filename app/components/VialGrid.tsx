import React from "react";

const DataTable = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th>hardware</th>
            <th>property</th>
            <th>value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).map((mainKey, index) =>
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
                      {mainKey}
                    </td>
                  )}
                  {renderSubKey && <td>{subKey}</td>}
                  {renderSubKey && (
                    <td>
                      {data[mainKey][subKey] !== null
                        ? data[mainKey][subKey].toString()
                        : "null"}
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
  vialCount = 16,
  stateData,
}: {
  vialCount: number;
  stateData: { [key: string]: { [key: string]: { [key: string]: number } } };
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
    // check if there's data for this vial
    if (Object.keys(data).length === 0) {
      return (
        <div
          key={index}
          className="relative flex items-center justify-center aspect-square border border-gray-300 font-bold rounded-badge"
        >
          <div className="absolute inset-0 flex items-center justify-center text-neutral text-opacity-25">
            <span className="block text-[8vw] leading-none">{index}</span>
          </div>
        </div>
      );
    }
    return (
      <div
        key={index}
        className="relative flex items-center justify-center aspect-square border border-4 border-accent font-bold rounded-badge"
      >
        <div className="absolute inset-0 flex items-center justify-center text-neutral text-opacity-30">
          <span className="block text-[8vw] leading-none">{index}</span>
        </div>
        <div className="relative z-10">
          <DataTable data={data} />
        </div>
      </div>
    );
  });

  return <div className="grid grid-cols-4 grid-rows-4 gap-2">{cells}</div>;
}
