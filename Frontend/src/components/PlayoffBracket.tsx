
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamMatchup {
  team1: string;
  team2: string;
  team1Odds: number;
  team2Odds: number;
}

const PlayoffBracket = () => {
  const qualifier1: TeamMatchup = {
    team1: "Mumbai Indians",
    team2: "Chennai Super Kings",
    team1Odds: 52,
    team2Odds: 48,
  };

  const qualifier2: TeamMatchup = {
    team1: "Royal Challengers",
    team2: "Gujarat Titans",
    team1Odds: 55,
    team2Odds: 45,
  };

  const eliminator: TeamMatchup = {
    team1: "Loser of Q1",
    team2: "Winner of Q2",
    team1Odds: 51,
    team2Odds: 49,
  };

  const final: TeamMatchup = {
    team1: "Winner of Q1",
    team2: "Winner of Eliminator",
    team1Odds: 53,
    team2Odds: 47,
  };

  const MatchupCard = ({ matchup, title }: { matchup: TeamMatchup; title: string }) => (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 mb-2">
      <h4 className="text-xs font-medium text-gray-500 mb-2">{title}</h4>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">{matchup.team1}</span>
          <span className="text-sm font-bold text-ipl-blue">{matchup.team1Odds}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-ipl-blue rounded-full"
            style={{ width: `${matchup.team1Odds}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">{matchup.team2}</span>
          <span className="text-sm font-bold text-ipl-orange">{matchup.team2Odds}%</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Playoff Bracket Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <MatchupCard matchup={qualifier1} title="QUALIFIER 1" />
            <MatchupCard matchup={qualifier2} title="QUALIFIER 2" />
          </div>
          <div className="space-y-3">
            <MatchupCard matchup={eliminator} title="ELIMINATOR" />
            <MatchupCard matchup={final} title="FINAL" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayoffBracket;
