"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  type: "line" | "bar" | "pie";
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  color?: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function Chart({ type, data, xKey, yKey, color = "#0088FE" }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      {type === "line" && (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
        </LineChart>
      )}
      {type === "bar" && (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yKey} fill={color} />
        </BarChart>
      )}
      {type === "pie" && (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const name = props.name ?? '';
              const percent = props.percent ?? 0;
              return `${name} ${(percent * 100).toFixed(0)}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey={yKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      )}
    </ResponsiveContainer>
  );
}

