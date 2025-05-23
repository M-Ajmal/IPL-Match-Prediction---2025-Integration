
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface PredictionCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

const PredictionCard = ({ title, icon, children, className }: PredictionCardProps) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-ipl-blue to-ipl-lightBlue p-4">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
};

export default PredictionCard;
