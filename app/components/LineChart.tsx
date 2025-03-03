import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { vialColors } from "~/utils/chart/colors";
import groupBy from "lodash/groupBy";
import { HistoricDatum } from "client";

const processData = (
  data: HistoricDatum[],
  vials: string[],
  property: string,
) => {
  const filtered = data.filter((entry) => vials.includes(`${entry.vial}`));
  const timed = filtered.map((entry) => ({
    timestamp: Math.round(entry.timestamp),
    vial: `vial_${entry.vial}`,
    data: entry.data[property],
  }));
  // group for plotting by shared x-axis on timestamp. Without this the plotting
  // utility will consider each entry as a separate line (inefficient)
  const grouped: (typeof timed)[] = groupBy(timed, "timestamp");
  // grouped creates an object keyed by group with arrays of objects, but
  // plotting wants array of objects keyed by line discriminator (vial)
  return Object.values(grouped).map((group) => ({
    timestamp: group[0].timestamp,
    ...Object.fromEntries(group.map((g) => [g.vial, g.data])),
  }));
};

const processEvents = (data: HistoricDatum[], vials: string[]) => {
  const filtered = data.filter((entry) =>
    entry.vial ? vials.includes(`${entry.vial}`) : true,
  );
  return filtered.map((entry) => ({
    timestamp: Math.round(entry.timestamp),
    vial: `vial_${entry.vial}`,
    data: entry.data,
  }));
};

export const HardwareLineChart = ({
  vials,
  rawData,
  events,
  property = "raw",
}: {
  vials: string[];
  rawData: HistoricDatum[];
  events: HistoricDatum[];
  property: string;
}) => {
  const formattedData = processData(rawData, vials, property);
  const eventData = processEvents(events, vials);

  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono">property: {property}</div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
            tickFormatter={(unixTime) =>
              new Date(unixTime * 1000).toLocaleTimeString()
            }
          />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Legend />
          {vials.map((vial: string, index: number) => (
            <Line
              key={vial}
              type="monotone"
              dataKey={`vial_${vial}`}
              stroke={vialColors[index % vialColors.length]}
              name={`Vial ${vial}`}
              connectNulls={true}
            />
          ))}
          {eventData.map((event) => (
            <ReferenceLine
              key={`${event.timestamp}${event.data.message}`}
              x={event.timestamp}
              label={event.data.message}
              stroke="red"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="divider"></div>
    </div>
  );
};
