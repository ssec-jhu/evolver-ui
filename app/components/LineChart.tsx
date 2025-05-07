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
import { LabelPosition } from "recharts/types/component/Label";

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

  // Map events to a consistent format
  const mappedEvents = filtered.map((entry) => ({
    timestamp: Math.round(entry.timestamp),
    vial: `vial_${entry.vial}`,
    data: entry.data,
  }));

  // Deduplicate the events using a Map with composite keys
  const uniqueEvents = new Map();

  mappedEvents.forEach((event) => {
    // Create a composite key using timestamp + message
    const key = `${event.timestamp}_${event.data.message}`;

    // Only add if not already in the map
    if (!uniqueEvents.has(key)) {
      uniqueEvents.set(key, event);
    }
  });

  // Convert back to array
  return Array.from(uniqueEvents.values());
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
          <Tooltip
            labelFormatter={(unixTime) =>
              new Date(unixTime * 1000).toLocaleTimeString()
            }
            formatter={(value, name) => {
              // Find the index of this line to get the correct color
              const vialName = name as string;
              const vialNumber = vialName.replace("vial_", "");
              const index = vials.indexOf(vialNumber);
              // Return value and color information
              return [
                value,
                vialName.replace("vial_", "Vial "),
                vialColors[index % vialColors.length],
              ];
            }}
            contentStyle={{
              backgroundColor: "rgba(40, 44, 52, 0.9)", // Dark background
              borderRadius: "8px",
              border: "none",
              boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
              padding: "10px",
              color: "white", // White text
            }}
            itemStyle={{
              padding: "4px 0",
              color: "white", // White text for items
            }}
            labelStyle={{
              fontWeight: "bold",
              marginBottom: "6px",
              color: "white", // White text for label
            }}
            cursor={{ stroke: "#ccc", strokeWidth: 1 }}
            wrapperStyle={{
              outline: "none",
            }}
          />
          <Legend />
          {vials.map((vial: string, index: number) => (
            <Line
              key={vial}
              type="monotone"
              dataKey={`vial_${vial}`}
              stroke={vialColors[index % vialColors.length]}
              name={`Vial ${vial}`}
              connectNulls={true}
              dot={false}
            />
          ))}
          {eventData.map((event, idx) => {
            const positions = [
              "insideTopLeft",
              "insideBottomLeft",
              "insideTopRight",
              "insideBottomRight",
            ];
            const labelPosition = positions[
              idx % positions.length
            ] as LabelPosition;
            return (
              <ReferenceLine
                key={`${event.timestamp}${event.data.message}`}
                x={event.timestamp}
                label={{
                  value: event.data.message,
                  fill: "red",
                  position: labelPosition,
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      <div className="divider"></div>
    </div>
  );
};
