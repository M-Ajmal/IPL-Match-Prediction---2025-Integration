
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface TeamCardProps {
  id: string;
  name: string;
  winRate: number;
  championshipOdds: number;
  color: string;
}

const TeamCard = ({ id, name, winRate, championshipOdds, color }: TeamCardProps) => {
  return (
    <Link to={`/team-analysis/${id}`}>
      <Card className="team-card card-hover">
        <div className="h-2" style={{ backgroundColor: color }}></div>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{name}</h3>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
              {championshipOdds.toFixed(1)}% odds
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Win rate</span>
              <span className="font-medium">{winRate}%</span>
            </div>
            <Progress value={winRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeamCard;
