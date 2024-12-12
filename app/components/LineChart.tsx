import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { vialColors } from "~/utils/chart/colors";
import groupBy from "lodash/groupBy";

const processData = (data, vials, property) => {
  const filtered = data.filter((entry) => vials.includes(`${entry.vial}`));
  const timed = filtered.map((entry) => ({
    timestamp: new Date(
      Math.round(entry.timestamp) * 1000,
    ).toLocaleTimeString(),
    vial: `vial_${entry.vial}`,
    data: entry.data[property],
  }));
  // group for plotting by shared x-axis on timestamp. Without this the plotting
  // utility will consider each entry as a separate line (inefficient)
  const grouped = groupBy(timed, "timestamp");
  // grouped creates an object keyed by group with arrays of objects, but
  // plotting wants array of objects keyed by line discriminator (vial)
  return Object.values(grouped).map((group) => ({
    timestamp: group[0].timestamp,
    ...Object.fromEntries(group.map((g) => [g.vial, g.data])),
  }));
};

export const HardwareLineChart = ({ vials, rawData, property = "raw" }) => {
  const formattedData = processData(rawData, vials, property);

  return (
    <div>
      <div className="font-mono">property: {property}</div>
      <div className="divider"></div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          {vials.map((vial: number, index: number) => (
            <Line
              key={vial}
              type="monotone"
              dataKey={`vial_${vial}`}
              stroke={vialColors[index % vialColors.length]}
              name={`Vial ${vial}`}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="divider"></div>
    </div>
  );
};
