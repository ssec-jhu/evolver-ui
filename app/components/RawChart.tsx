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

export const RawChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="vial0" stroke="#8884d8" />
        <Line type="monotone" dataKey="vial5" stroke="#82ca9d" />
        <Line type="monotone" dataKey="vial10" stroke="#ffc658" />
        <Line type="monotone" dataKey="vial15" stroke="#ff7300" />
      </LineChart>
    </ResponsiveContainer>
  );
};
