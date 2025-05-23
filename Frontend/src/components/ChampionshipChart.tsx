
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  Sector
} from "recharts";
import { ChartPie } from "lucide-react";

interface Team {
  id: string;
  name: string;
  odds: number;
  color: string;
}

const ChampionshipChart = () => {
  // Sample data - would come from API in real app
  const data: Team[] = [
    { id: "mi", name: "Mumbai Indians", odds: 18.5, color: "#004BA0" },
    { id: "csk", name: "Chennai Super Kings", odds: 16.2, color: "#FFFF00" },
    { id: "rcb", name: "Royal Challengers Bengaluru", odds: 14.8, color: "#EC1C24" },
    { id: "gt", name: "Gujarat Titans", odds: 12.5, color: "#1D2951" },
    { id: "lsg", name: "Lucknow Super Giants", odds: 10.7, color: "#A4DE02" },
    { id: "pbks", name: "Punjab Kings", odds: 8.3, color: "#ED1B24" },
    { id: "rr", name: "Rajasthan Royals", odds: 7.9, color: "#FF1493" },
    { id: "kkr", name: "Kolkata Knight Riders", odds: 7.1, color: "#3A225D" },
    { id: "srh", name: "Sunrisers Hyderabad", odds: 4.0, color: "#FF822A" },
  ];

  // Active segment for hover animation
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Custom active shape for the pie chart
  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, value, percent
    } = props;
    
    const sin = Math.sin(-midAngle * Math.PI / 180);
    const cos = Math.cos(-midAngle * Math.PI / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5} // Slightly larger when active
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
          {`${payload.name}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={14} textAnchor={textAnchor} fill="#666" fontSize={12}>
          {`${value.toFixed(1)}% chance`}
        </text>
      </g>
    );
  };

  // Format the tooltip values
  const formatTooltipValue = (value: number | string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return value;
  };

  return (
    <Card className="h-full bg-gradient-to-b from-white to-gray-50 shadow-md border-0">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <ChartPie className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-xl font-bold text-gray-800">Championship Prediction</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {data.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="odds"
                nameKey="name"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                paddingAngle={2}
                animationDuration={800}
                animationBegin={100}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#colorGradient-${index})`} 
                    stroke={entry.color} 
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [formatTooltipValue(value), "Championship Odds"]} 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle" 
                iconType="circle" 
                iconSize={10} 
                formatter={(value) => <span style={{ color: '#666', fontSize: '13px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Based on machine learning prediction models using historical match data and team performance.
        </div>
      </CardContent>
    </Card>
  );
};

export default ChampionshipChart;
