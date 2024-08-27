import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { vialColors } from "~/utils/chart/colors";

type TimestampData = {
  timestamp: number;
} & {
  [key: string]: number;
};

const processData = (data, vials) => {
  return data.map((entry) => {
    const processedEntry = {
      timestamp: entry.timestamp,
    };

    vials.forEach((vial) => {
      processedEntry[`vial_${vial}`] = entry.data[vial]?.raw;
    });

    return processedEntry;
  });
};

// Helper function to format timestamp to a human-readable format with ms precision
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

// Helper Function to format the tick labels dynamically with ms precision
const tickFormatter = (
  timestamp: string,
  index: number,
  data: TimestampData[],
) => {
  const date = new Date(timestamp);
  const range =
    new Date(data[data.length - 1].timestamp).getTime() -
    new Date(data[0].timestamp).getTime();

  // If range is larger than a day, show date only
  if (range > 86400000) {
    // 86400000 ms = 1 day
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  // If range is within a day but more than an hour, show date and hour
  if (range > 3600000) {
    // 3600000 ms = 1 hour
    const hours = date.getHours().toString().padStart(2, "0");
    return `${date.getDate()}/${date.getMonth() + 1} ${hours}:00`;
  }

  // If range is within an hour but more than a minute, show date, hour, and minute
  if (range > 60000) {
    // 60000 ms = 1 minute
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // If range is within a minute, show hour, minute, second, and millisecond
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const SensorChart = ({ rawData, vials }) => {
  const formattedData = processData(rawData, vials);

  const chartLines = vials.map((vial, ix) => (
    <Line
      key={vial}
      type="monotone"
      dataKey={`vial_${vial}`}
      stroke={vialColors[ix % vialColors.length]}
      name={`Vial ${vial}`}
    />
  ));

  return (
    <ResponsiveContainer width="100%" height={600}>
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(timestamp, index) =>
            tickFormatter(timestamp, index, formattedData)
          }
        />
        <YAxis />
        <Tooltip labelFormatter={(label) => formatTimestamp(label as number)} />
        <Legend />
        <Brush dataKey="timestamp" height={30} stroke="#8884d8" />
        {chartLines}
      </LineChart>
    </ResponsiveContainer>
  );
};
