import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type Props = {
  interns: {
    status: string;
  }[];
};

function StatusChart({ interns }: Props) {
  const activeCount = interns.filter((intern) => intern.status === "Active").length;
  const inactiveCount = interns.filter((intern) => intern.status === "Inactive").length;

  const data = [
    { name: "Active", value: activeCount },
    { name: "Inactive", value: inactiveCount },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="42%"
          innerRadius={22}
          outerRadius={48}
          paddingAngle={2}
          stroke="#fff"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>

        <Tooltip wrapperStyle={{ fontSize: 11 }} />

        <Legend
          verticalAlign="bottom"
          height={30}
          wrapperStyle={{
            fontSize: 11,
            lineHeight: "12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default StatusChart;