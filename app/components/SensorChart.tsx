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
import { SensorData } from "~/utils/getSensorProperty";

type TimestampData = {
  timestamp: number;
} & {
  [key: string]: number;
};

function transformToTimestamp(data: SensorData): {
  formattedData: TimestampData[];
  keys: string[];
} {
  const keys = new Set<string>();
  const formattedData = Array.from(data).map(([timestamp, vials]) => {
    const chartable = Array.from(vials).reduce(
      (acc, [vial, value]) => {
        keys.add(`vial-${vial}`);
        acc[`vial-${vial}`] = value as number;
        return acc;
      },
      { timestamp: timestamp } as TimestampData,
    );
    return chartable;
  });
  return { formattedData, keys: Array.from(keys) };
}

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

export const SensorChart = ({ data }: { data: SensorData }) => {
  const { formattedData, keys } = transformToTimestamp(data);

  const chartLines = keys.map((key, ix) => (
    // random color for each linechartColors
    <Line
      key={key}
      type="monotone"
      dataKey={key}
      stroke={vialColors[ix % vialColors.length]}
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
