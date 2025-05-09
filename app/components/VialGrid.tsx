import { Link, useParams } from "@remix-run/react";
import clsx from "clsx";
import { useState, useEffect } from "react";

const DataTable = ({
  data,
  vialIndex,
  excludedProperties = [],
  filteredProperties = [],
}: {
  vialIndex: number;
  data: { [key: string]: number };
  excludedProperties?: string[];
  filteredProperties?: string[];
}) => {
  const { name, id } = useParams();
  return (
    <div className="overflow-x-auto">
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th>
              <Link
                className={"font-mono text-primary"}
                to={`/devices/${id}/${name}/hardware`}
              >
                {vialIndex}
              </Link>{" "}
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
                      className="text-center font-mono"
                    >
                      <Link
                        className="link"
                        to={`/devices/${id}/${name}/hardware/${mainKey}/history?vials=${vialIndex}`}
                      >
                        {mainKey}
                      </Link>
                    </td>
                  )}
                  {renderSubKey && (
                    <td>
                      <Link
                        className="link font-mono"
                        to={`/devices/${id}/${name}/hardware/${mainKey}/history?properties=${subKey}&vials=${vialIndex}`}
                      >
                        {subKey}
                      </Link>
                    </td>
                  )}
                  {renderSubKey && (
                    <td>
                      {typeof data[mainKey][subKey] === "number"
                        ? Number(data[mainKey][subKey].toFixed(3)) % 1 === 0
                          ? data[mainKey][subKey].toFixed(0)
                          : data[mainKey][subKey].toFixed(3)
                        : data[mainKey][subKey] || "-"}
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
        <div className="absolute inset-0 flex items-center justify-center text-neutral opacity-50 font-mono">
          <span className="block text-[5vw] leading-none">{index}</span>
        </div>
        {hasData && (
          <DataTable
            data={data}
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
  excludedProperties = [],
}: {
  vialCount: number;
  stateData: { [key: string]: { [key: string]: { [key: string]: number } } };
  id: string;
  excludedProperties?: string[];
}) {
  const [filteredProperties, setFilteredProperties] = useState<string[]>([]);
  const [availableSubKeys, setAvailableSubKeys] = useState<string[]>([]);

  // Extract all unique subkeys from the data, minus excludedProperties
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
    if (value === "showAllCheckbox") {
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
    return { index, ...matchingData };
  });

  const cells = gridItems.map(({ index, ...data }) => {
    const hasData = Object.keys(data).length > 0;
    return (
      <div
        key={index}
        className={clsx(
          "relative flex items-center justify-center aspect-square border font-bold rounded-md bg-base-200",
          !hasData && "border-2 border-gray-300",
          hasData && "border-4 border-primary",
        )}
      >
        {hasData && (
          <DataTable
            data={data}
            vialIndex={index}
            excludedProperties={excludedProperties}
            filteredProperties={filteredProperties}
          />
        )}
      </div>
    );
  });
  const filterOptions = [
    <input
      key="showAllCheckbox"
      className="btn filter-reset"
      type="radio"
      name="propertyFilter"
      value="showAllCheckbox"
      onChange={handleFilterChange}
      aria-label="show all"
    />,
    ...availableSubKeys.map((subKey) => (
      <input
        key={subKey}
        className="btn"
        type="radio"
        name="propertyFilter"
        value={subKey}
        onChange={handleFilterChange}
        aria-label={subKey}
      />
    )),
  ];

  return (
    <div
      className={clsx(filterOptions.length > 0 && "gap-4", "flex", "flex-col")}
    >
      <div className="flex items-center gap-4">
        {filterOptions.length > 0 && <div className="font-mono">filter:</div>}
        <div className="filter">{filterOptions}</div>
      </div>
      <div className="grid grid-cols-4 grid-rows-4 gap-2">{cells}</div>
    </div>
  );
}
