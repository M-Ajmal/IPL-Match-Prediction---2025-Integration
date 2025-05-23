// components/StatTable.jsx
import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BarChart2, TableIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const StatTable = ({ title, endpoint }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "chart"
  
  // Define chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  const fetchStatData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use regular GET request first, fall back to POST if needed
      let res = await fetch(endpoint, { 
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // If GET fails, try POST
      if (!res.ok) {
        res = await fetch(endpoint, { 
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ timestamp: Date.now() })
        });
      }
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const text = await res.text();
      let json;
      
      try {
        json = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON:", text.substring(0, 100) + "...");
        throw new Error("Invalid JSON response from server");
      }
      
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setData(json.data);
      } else {
        throw new Error("No data found or empty data array");
      }
    } catch (err) {
      console.error(`Error fetching ${title}:`, err);
      setError(`Failed to load ${title}. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStatData();
  }, [endpoint]);
  
  // Format data for chart visualization - using the first numeric column for values
  const getChartData = () => {
    if (!data.length) return [];
    
    // Find the first column that appears to be a numeric value for the bar height
    const keys = Object.keys(data[0]);
    let labelKey = keys[0]; // Default to first column for labels
    let valueKey = null;
    
    // Find the first numeric value column
    for (const key of keys) {
      if (typeof data[0][key] === 'number' || !isNaN(Number(data[0][key]))) {
        valueKey = key;
        break;
      }
    }
    
    // If no numeric column found, use the second column if available
    if (!valueKey && keys.length > 1) {
      valueKey = keys[1];
    } else if (!valueKey) {
      valueKey = keys[0]; // Fallback to first column
    }
    
    // Create chart data
    return data.slice(0, 10).map((item, index) => ({
      name: String(item[labelKey]).slice(0, 10) + (String(item[labelKey]).length > 10 ? '...' : ''), // Truncate name if too long
      value: Number(item[valueKey]) || 0,
      fullName: String(item[labelKey]), // Store full name for tooltip
      originalValue: item[valueKey],
      color: COLORS[index % COLORS.length]
    }));
  };
  
  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-indigo-700">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin text-indigo-600" />
            <span>Loading data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-indigo-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStatData} 
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  if (!data.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-indigo-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>No data available for {title}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  const chartData = getChartData();
  
  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-indigo-700">{title}</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === "table" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button 
            variant={viewMode === "chart" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("chart")}
          >
            <BarChart2 className="h-4 w-4 mr-1" />
            Chart
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStatData}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "table" ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-indigo-50">
                <TableRow>
                  {Object.keys(data[0]).map((key, idx) => (
                    <TableHead key={idx} className="text-indigo-900">
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-indigo-50/30"}>
                    {Object.values(row).map((value, colIndex) => (
                      <TableCell key={colIndex}>
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name, props) => [props.payload.originalValue, '']}
                  labelFormatter={(label, props) => props[0].payload.fullName}
                />
                <Bar dataKey="value" name={title}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatTable;