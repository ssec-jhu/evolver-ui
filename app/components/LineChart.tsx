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

const processData = (data, vials, property) => {
  return data.map((entry) => {
    const processedEntry = {
      timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(), // Convert timestamp to readable time
    };

    vials.forEach((vial) => {
      processedEntry[`vial_${vial}`] = entry.data[vial]?.[property];
    });

    return processedEntry;
  });
};

export const HardwareLineChart = ({ vials, rawData, property = "raw" }) => {
  const formattedData = processData(rawData, vials, property);

  return (
    <div>
      <div className="divider"></div>
      <div>property: </div>
      <div className="stat-value font-mono">{property}</div>
      <div className="divider"></div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          {vials.map((vial, index) => (
            <Line
              key={vial}
              type="monotone"
              dataKey={`vial_${vial}`}
              stroke={vialColors[index % vialColors.length]}
              name={`Vial ${vial}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
