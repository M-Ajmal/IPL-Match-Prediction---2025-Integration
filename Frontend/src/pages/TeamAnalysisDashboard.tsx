import React from "react";
import { Activity, BarChart as BarChartIcon, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Spinner component for loading states
const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
  </div>
);

// Team Performance Chart component
const TeamPerformanceChart = ({ teamName, seasonData }) => {
  if (!seasonData || seasonData.length === 0) {
    return <Spinner />;
  }

  // Format the data for the chart
  const chartData = seasonData.map(season => ({
    season: season.season,
    winRate: parseFloat(season.win_rate.toFixed(1))
  }));

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <Activity size={18} />
        {teamName} Season Performance
      </h3>
      
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="season" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} labelFormatter={(label) => label} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="winRate" 
            name="Win Rate" 
            stroke="#4299E1" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Head to Head Matchups component
const HeadToHeadMatchups = ({ opponentData }) => {
  if (!opponentData || !opponentData.best || opponentData.best.length === 0) {
    return <Spinner />;
  }

  // Format the best and worst matchups data
  const bestMatchups = opponentData.best.slice(0, 5);
  const worstMatchups = opponentData.worst.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <Users size={18} />
        Head-to-Head Matchups
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-sm mb-3 text-green-600">Best Matchups</h4>
          <div className="space-y-3">
            {bestMatchups.map((matchup, index) => (
              <div key={`best-${index}`} className="bg-gray-50 p-3 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{matchup.opponent}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{matchup.wins} wins / {matchup.matches} matches</span>
                    <span className="font-bold text-green-600 text-sm">{parseFloat(matchup.win_rate.toFixed(1))}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-green-500"
                    style={{ width: `${matchup.win_rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-3 text-red-600">Challenging Matchups</h4>
          <div className="space-y-3">
            {worstMatchups.map((matchup, index) => (
              <div key={`worst-${index}`} className="bg-gray-50 p-3 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{matchup.opponent}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{matchup.wins} wins / {matchup.matches} matches</span>
                    <span className="font-bold text-red-600 text-sm">{parseFloat(matchup.win_rate.toFixed(1))}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-red-500"
                    style={{ width: `${matchup.win_rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Statistics component
const TeamStatistics = ({ teamPerformance }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <Activity size={18} />
        {teamPerformance.team_name} Key Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow duration-300">
          <div className="text-sm text-blue-700">Overall Win Rate</div>
          <div className="text-2xl font-bold mt-1">{teamPerformance.win_rate?.toFixed(1)}%</div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${teamPerformance.win_rate}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 hover:shadow-md transition-shadow duration-300">
          <div className="text-sm text-green-700">Home Win Rate</div>
          <div className="text-2xl font-bold mt-1">{teamPerformance.toss_statistics?.toss_win_rate?.toFixed(1)}%</div>
          <div className="w-full bg-green-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${teamPerformance.toss_statistics?.toss_win_rate}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 hover:shadow-md transition-shadow duration-300">
          <div className="text-sm text-purple-700">Batting First Win Rate</div>
          <div className="text-2xl font-bold mt-1">{teamPerformance.batting_first_win_rate?.toFixed(1)}%</div>
          <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${teamPerformance.batting_first_win_rate}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 hover:shadow-md transition-shadow duration-300">
          <div className="text-sm text-orange-700">Chasing Win Rate</div>
          <div className="text-2xl font-bold mt-1">{teamPerformance.chasing_win_rate?.toFixed(1)}%</div>
          <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
            <div 
              className="bg-orange-600 h-2 rounded-full" 
              style={{ width: `${teamPerformance.chasing_win_rate}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium text-sm mb-3 text-gray-700">Top Players (Player of the Match Awards)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {teamPerformance.top_players && Object.entries(teamPerformance.top_players).map(([player, count], index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <span className="font-medium text-sm truncate">{player}</span>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded border border-yellow-200">
                {count.toString()} awards
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Venue Performance component
const VenuePerformance = ({ venueData }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <BarChartIcon size={18} />
        Venue Performance
      </h3>
      
      <div className="space-y-3">
        {venueData && venueData.slice(0, 5).map((venue, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between">
              <span className="font-medium">{venue.venue}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs">{venue.wins} wins / {venue.matches} matches</span>
                <span className="font-bold text-blue-600">{venue.win_rate?.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="h-1.5 rounded-full bg-blue-500"
                style={{ width: `${venue.win_rate}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main TeamAnalysisDashboardDashboard component
const TeamAnalysisDashboardDashboard = ({ 
  teamPerformance, 
  selectedTeam, 
  teamOptions, 
  onTeamChange, 
  refreshing, 
  venues, 
  teamColors 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Team-specific Analysis</h2>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="team-select" className="font-medium text-gray-700">Select Team:</label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={onTeamChange}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {teamOptions.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>

      {refreshing ? (
        <div className="p-8 flex justify-center">
          <Spinner />
        </div>
      ) : teamPerformance ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamPerformanceChart 
            teamName={teamPerformance.team_name} 
            seasonData={teamPerformance.season_performance} 
          />
          
          <HeadToHeadMatchups opponentData={teamPerformance.opponent_performance} />
          
          <TeamStatistics teamPerformance={teamPerformance} />
          
          <VenuePerformance venueData={teamPerformance.venue_performance} />
        </div>
      ) : (
        <div className="p-8 flex justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default TeamAnalysisDashboardDashboard;