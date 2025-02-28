import { Link } from "@remix-run/react";
import clsx from "clsx";
import { useState, useEffect } from "react";

const DataTable = ({
  data,
  id,
  vialIndex,
  excludedProperties = [],
  filteredProperties = [],
}: {
  id: string;
  vialIndex: number;
  data: { [key: string]: number };
  excludedProperties?: string[];
  filteredProperties?: string[];
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
            Object.keys(data[mainKey]).map((subKey: string, subIndex) => {
              let renderSubKey = true;
              if (
                excludedProperties.includes(subKey) ||
                filteredProperties.includes(subKey)
              ) {
                renderSubKey = false;
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
                      {data[mainKey][subKey]}
                      {!data[mainKey][subKey] && "-"}
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
  excludedProperties = [],
}: {
  vialCount: number;
  stateData: { [key: string]: { [key: string]: { [key: string]: number } } };
  id: string;
  excludedProperties?: string[];
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
          <DataTable
            data={data}
            id={id}
            vialIndex={index}
            excludedProperties={excludedProperties}
          />
        )}
      </div>
    );
  });

  return <div className="grid grid-cols-4 grid-rows-4 gap-2">{cells}</div>;
}

export function FilterableVialGrid({
  vialCount,
  stateData,
  id,
  excludedProperties = [],
}: {
  vialCount: number;
  stateData: { [key: string]: { [key: string]: { [key: string]: number } } };
  id: string;
  excludedProperties?: string[];
}) {
  const [filteredProperties, setFilteredProperties] = useState<string[]>([]);
  const [availableSubKeys, setAvailableSubKeys] = useState<string[]>([]);

  // Extract all unique subkeys from the data
  useEffect(() => {
    const subKeys = new Set<string>();

    Object.keys(stateData).forEach((mainKey) => {
      Object.values(stateData[mainKey]).forEach((vialData) => {
        Object.keys(vialData).forEach((subKey) => {
          if (!excludedProperties.includes(subKey)) {
            subKeys.add(subKey);
          }
        });
      });
    });

    setAvailableSubKeys(Array.from(subKeys));
  }, [stateData, excludedProperties]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "x") {
      setFilteredProperties([]);
    } else if (filteredProperties.includes(value)) {
      setFilteredProperties(
        filteredProperties.filter((prop) => prop !== value),
      );
    } else {
      setFilteredProperties([...filteredProperties, value]);
    }
  };

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
          <DataTable
            data={data}
            id={id}
            vialIndex={index}
            excludedProperties={excludedProperties}
            filteredProperties={filteredProperties}
          />
        )}
      </div>
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <form
        className="filter flex justify-between gap-4"
        id="propertyFilterForm"
      >
        <div className="flex gap-4 items-center">
          <label className="font-mono" htmlFor="propertyFilterForm">
            properties:
          </label>
          <input
            className="btn "
            type="checkbox"
            value="x"
            aria-label="show all"
            checked={filteredProperties.length === 0}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex gap-4 items-center">
          <label className="font-mono" htmlFor="propertyFilterForm">
            exclude:
          </label>
          {availableSubKeys.map((subKey) => (
            <input
              key={subKey}
              className="btn"
              type="checkbox"
              name="propertyFilter"
              value={subKey}
              checked={filteredProperties.includes(subKey)}
              onChange={handleFilterChange}
              aria-label={subKey}
            />
          ))}
        </div>
      </form>
      <div className="grid grid-cols-4 grid-rows-4 gap-2">{cells}</div>
    </div>
  );
}
