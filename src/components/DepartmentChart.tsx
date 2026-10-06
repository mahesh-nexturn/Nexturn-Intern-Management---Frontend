import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

type Props = {
  interns: {
    department: string;
  }[];
};

function DepartmentChart({ interns }: Props) {
  const departmentCounts = interns.reduce(
    (acc: Record<string, number>, intern) => {
      acc[intern.department] =
        (acc[intern.department] || 0) + 1;

      return acc;
    },
    {}
  );

  const data = Object.entries(departmentCounts).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8B5CF6",
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={75}
          paddingAngle={2}
          stroke="#fff"
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={
                COLORS[index % COLORS.length]
              }
            />
          ))}
        </Pie>

        <Tooltip
          wrapperStyle={{
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default DepartmentChart;