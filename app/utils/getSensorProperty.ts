interface Vial {
  [key: string]: string | number | null;
}

interface Vials {
  [key: string]: Vial;
}

export type RawSensorData = [number, Vials][];

// Map<timestamp, Map<vial_number, value>>
export type SensorData = Map<number, Map<string, number | string | null>>;

export function getSensorProperty(
  rawData: RawSensorData,
  targetProperty: string = "raw",
  forVials: string[] = [],
): SensorData {
  const allData = new Map();
  rawData.map((item) => {
    const timestamp = item[0];
    const values = item[1];

    const vialValues = new Map();

    Object.keys(values).forEach((key) => {
      // if forVials is empty, use all vials
      if (forVials.length === 0) {
        vialValues.set(key, values[key][targetProperty]);
      }
      // only show the vials in forVials
      else if (forVials.includes(key)) {
        vialValues.set(key, values[key][targetProperty]);
      }
    });

    allData.set(timestamp, vialValues);
  });
  return allData;
}
