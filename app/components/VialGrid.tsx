import React, { useEffect, useState } from "react";

export function VialGrid({ stateData }) {
  console.log(stateData);
  const gridPositions = {
    0: "row-start-1 col-start-1",
    5: "row-start-1 col-start-2",
    10: "row-start-1 col-start-3",
    15: "row-start-1 col-start-4",
  };

  const renderCell = (data, key) => (
    <div key={key} className={`p-4 border ${gridPositions[key]}`}>
      <p>Vial: {data.vial}</p>
      <p>Raw: {data.raw}</p>
      {data.density !== undefined && <p>Density: {data.density}</p>}
      {data.temperature !== undefined && <p>Temperature: {data.temperature}</p>}
    </div>
  );
  const gridItems = Array.from({ length: 16 }, (_, index) => index);

  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-2">
      {gridItems.map((item) => (
        <div
          key={item}
          className="flex items-center justify-center aspect-square border border-gray-300 text-xl font-bold rounded-badge"
        >
          {item}
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-4 grid-rows-1 gap-4">
      {Object.keys(stateData.od).map((key) =>
        renderCell(stateData.od[key], key),
      )}
      {Object.keys(stateData.odB).map((key) =>
        renderCell(stateData.odB[key], key),
      )}
      {Object.keys(stateData.temp).map((key) =>
        renderCell(stateData.temp[key], key),
      )}
    </div>
  );
}
