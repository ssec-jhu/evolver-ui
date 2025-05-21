import { Link, useParams } from "react-router";
import { ROUTES } from "../utils/routes";
import clsx from "clsx";
import { useState, useEffect } from "react";

const RecursiveDataTable = ({
  data,
  vialIndex,
  excludedProperties = [],
  filteredProperties = [],
  depth = 0,
}: {
  vialIndex: number;
  data: unknown;
  excludedProperties?: string[];
  filteredProperties?: string[];
  depth?: number;
}) => {
  const { name, id } = useParams();

  // Helper function to check if an object has nested objects
  const hasNestedObjects = (obj) => {
    return Object.values(obj).some(
      (val) => typeof val === "object" && val !== null && !Array.isArray(val),
    );
  };

  // Format values based on their type
  const formatValue = (value) => {
    if (typeof value === "number") {
      return Number(value.toFixed(3)) % 1 === 0
        ? value.toFixed(0)
        : value.toFixed(3);
    }
    return value || "-";
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs">
        <thead>
          <tr>
            <th>
              <Link
                className={"font-mono"}
                to={ROUTES.device.hardware.list({ id, name })}
              >
                {vialIndex}
              </Link>{" "}
            </th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).map((mainKey) => {
            const mainKeyData = data[mainKey];
            const isNestedStructure = hasNestedObjects(mainKeyData);

            if (isNestedStructure) {
              // This is a nested object that requires recursive rendering
              return (
                <tr key={mainKey}>
                  <td className="text-center font-mono">
                    <Link
                      className="link"
                      to={`${ROUTES.device.hardware.history({ id, name, hardwareName: mainKey })}?vials=${vialIndex}`}
                    >
                      {mainKey}
                    </Link>
                  </td>
                  <td colSpan={2} className="p-0">
                    <table className="table table-xs w-full">
                      <tbody>
                        {Object.keys(mainKeyData).map((subKey) => {
                          if (
                            typeof mainKeyData[subKey] === "object" &&
                            mainKeyData[subKey] !== null
                          ) {
                            // Further nesting
                            return (
                              <tr key={`${mainKey}-${subKey}`}>
                                <td className="font-mono">
                                  <Link
                                    className="link"
                                    to={`${ROUTES.device.hardware.history({ id, name, hardwareName: mainKey })}?properties=${subKey}&vials=${vialIndex}`}
                                  >
                                    {subKey}
                                  </Link>
                                </td>
                                <td colSpan={1} className="p-0">
                                  <RecursiveDataTable
                                    data={{ [subKey]: mainKeyData[subKey] }}
                                    vialIndex={vialIndex}
                                    excludedProperties={excludedProperties}
                                    filteredProperties={filteredProperties}
                                    depth={depth + 1}
                                  />
                                </td>
                              </tr>
                            );
                          } else {
                            // Leaf node
                            const renderSubKey =
                              !excludedProperties.includes(subKey) &&
                              !filteredProperties.includes(subKey);
                            if (!renderSubKey) return null;

                            return (
                              <tr key={`${mainKey}-${subKey}`}>
                                <td className="font-mono">
                                  <Link
                                    className="link"
                                    to={`${ROUTES.device.hardware.history({ id, name, hardwareName: mainKey })}?properties=${subKey}&vials=${vialIndex}`}
                                  >
                                    {subKey}
                                  </Link>
                                </td>
                                <td>{formatValue(mainKeyData[subKey])}</td>
                              </tr>
                            );
                          }
                        })}
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            } else {
              return Object.keys(mainKeyData).map(
                (subKey: string, subIndex) => {
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
                          rowSpan={Object.keys(mainKeyData).length}
                          className="text-center font-mono"
                        >
                          <Link
                            className="link"
                            to={`${ROUTES.device.hardware.history({ id, name, hardwareName: mainKey })}?vials=${vialIndex}`}
                          >
                            {mainKey}
                          </Link>
                        </td>
                      )}
                      {renderSubKey && (
                        <td>
                          <Link
                            className="link font-mono"
                            to={`${ROUTES.device.hardware.history({ id, name, hardwareName: mainKey })}?properties=${subKey}&vials=${vialIndex}`}
                          >
                            {subKey}
                          </Link>
                        </td>
                      )}
                      {renderSubKey && (
                        <td>{formatValue(mainKeyData[subKey])}</td>
                      )}
                    </tr>
                  );
                },
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

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
          "overflow-scroll",
          "aspect-square border",
          !hasData && "border-1 border-gray-300",
          hasData && "border-2 border-primary",
        )}
      >
        {hasData && (
          <RecursiveDataTable
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
      checked={filteredProperties.length === 0}
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
        checked={filteredProperties.includes(subKey)}
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
      <div className="grid grid-cols-4 gap-2">{cells}</div>
    </div>
  );
}
