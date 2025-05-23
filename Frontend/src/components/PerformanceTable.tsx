
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PerformanceData {
  metric: string;
  value: string;
  change: number;
}

interface PerformanceTableProps {
  title: string;
  data: PerformanceData[];
}

const PerformanceTable = ({ title, data }: PerformanceTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{item.metric}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      item.change > 0
                        ? "text-green-600"
                        : item.change < 0
                        ? "text-red-600"
                        : "text-gray-500"
                    }
                  >
                    {item.change > 0 ? "+" : ""}
                    {item.change}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PerformanceTable;
