import { Link, useParams } from "react-router";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/solid";

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
  const VialTableView = () => (
    <table className="table">
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
  );
  return (
    <div>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        onClick={() =>
          document.getElementById("expand_vial_table_modal").showModal()
        }
      >
        <ArrowsPointingOutIcon className="w-5 h-5" />
      </button>
      <dialog
        id="expand_vial_table_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <VialTableView />
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
          </div>
        </div>
      </dialog>
      <VialTableView />
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
          "p-2",
          "overflow-scroll",
          "relative flex aspect-square border font-bold rounded-md bg-base-200",
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
