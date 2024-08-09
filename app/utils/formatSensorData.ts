interface vialdata {
  name: null | string;
  vial: number;
  raw: number;
  density: number | null;
}

export function formatSensorData(
  rawData: [number, { [key: string]: vialdata }][],
) {
  return rawData.map((item) => {
    const timestamp = item[0];
    const values = item[1];

    return {
      timestamp: new Date(timestamp * 1000).toLocaleString(), // Convert Unix timestamp to readable date
      vial0: values["0"] ? values["0"].raw : null,
      vial5: values["5"] ? values["5"].raw : null,
      vial10: values["10"] ? values["10"].raw : null,
      vial15: values["15"] ? values["15"].raw : null,
    };
  });
}
