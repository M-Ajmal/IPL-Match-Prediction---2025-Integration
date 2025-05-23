import React, { useState, useEffect } from "react";
import { Trophy, Users, TrendingUp, Activity, Calendar, ArrowUp, ArrowDown, RefreshCw, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Custom UI components
const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
  </div>
);

const PredictionCard = ({ title, icon, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
          {icon}
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
};

const TeamCard = ({ team, winRate, strengthScore, recentForm, color }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md border border-gray-100">
      <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: color || '#CBD5E0' }}>
        <span className="text-white font-bold text-xl">{team?.substring(0, 2).toUpperCase()}</span>
      </div>
      <h4 className="font-medium text-sm mb-2">{team}</h4>
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Win Rate</span>
          <span className="font-medium">{winRate?.toFixed(1) || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${winRate || 0}%`, backgroundColor: color || '#4299E1' }}
          ></div>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Strength Score</span>
          <span className="font-medium">{strengthScore?.toFixed(1) || 0}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${strengthScore || 0}%`, backgroundColor: color || '#4299E1' }}
          ></div>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Recent Form</span>
          <span className="font-medium">{recentForm?.toFixed(1) || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${recentForm || 0}%`, backgroundColor: color || '#4299E1' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ChampionshipChart = ({ data = [] }) => {
  const sortedData = [...data].sort((a, b) => b.strengthScore - a.strengthScore);
  const topTeams = sortedData.slice(0, 6);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <Trophy size={18} />
        Championship Probability
      </h3>
      
      {topTeams.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={topTeams}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={130}
              fill="#8884d8"
              dataKey="strengthScore"
              nameKey="team"
            >
              {topTeams.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : value}`} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

const PlayoffBracket = ({ playoffTeams = [] }) => {
  if (playoffTeams.length < 4) {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
          <Calendar size={18} />
          Playoff Predictions
        </h3>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <Calendar size={18} />
        Playoff Teams
      </h3>
      
      <div className="playoff-bracket flex flex-col items-center">
        <div className="semifinals grid grid-cols-2 gap-6 w-full">
          <div className="qualifier-1 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-300">
            <p className="text-sm text-gray-500">Qualifier 1</p>
            <div className="mt-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: playoffTeams[0]?.color || '#4299E1' }}>
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span className="font-medium">{playoffTeams[0]?.team || "Team 1"}</span>
              </div>
              <div className="text-xs font-medium">vs</div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{playoffTeams[1]?.team || "Team 2"}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: playoffTeams[1]?.color || '#48BB78' }}>
                  <span className="text-white text-xs font-bold">2</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="eliminator bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500 hover:shadow-md transition-shadow duration-300">
            <p className="text-sm text-gray-500">Eliminator</p>
            <div className="mt-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: playoffTeams[2]?.color || '#ED8936' }}>
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <span className="font-medium">{playoffTeams[2]?.team || "Team 3"}</span>
              </div>
              <div className="text-xs font-medium">vs</div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{playoffTeams[3]?.team || "Team 4"}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: playoffTeams[3]?.color || '#9F7AEA' }}>
                  <span className="text-white text-xs font-bold">4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="connect-lines flex justify-center w-full my-4">
          <div className="lines h-8 w-32 border-b-2 border-l-2 border-r-2 border-gray-300"></div>
        </div>
        
        <div className="qualifier-2 bg-gray-50 p-4 rounded-lg border-l-4 border-green-500 w-1/2 hover:shadow-md transition-shadow duration-300">
          <p className="text-sm text-gray-500">Qualifier 2</p>
          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
                <span className="text-white text-xs font-bold">L1</span>
              </div>
              <span className="font-medium">Q1 Loser</span>
            </div>
            <div className="text-xs font-medium">vs</div>
            <div className="flex items-center gap-2">
              <span className="font-medium">E Winner</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-500">
                <span className="text-white text-xs font-bold">W1</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="connect-lines flex justify-center w-full my-4">
          <div className="lines h-8 w-32 border-b-2 border-l-2 border-r-2 border-gray-300"></div>
        </div>
        
        <div className="final bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500 w-2/3 hover:shadow-md transition-shadow duration-300">
          <p className="text-sm text-gray-500">Final</p>
          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
                <span className="text-white text-xs font-bold">W1</span>
              </div>
              <span className="font-medium">Q1 Winner</span>
            </div>
            <div className="text-xs font-medium">vs</div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Q2 Winner</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                <span className="text-white text-xs font-bold">W2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamStrengthChart = ({ teamMetrics }) => {
  if (!teamMetrics || teamMetrics.length === 0) {
    return <Spinner />;
  }
  
  const data = teamMetrics.slice(0, 8).map(team => ({
    name: team.team,
    strengthScore: parseFloat(team.strength_score?.toFixed(1) || "0")
  })).sort((a, b) => b.strengthScore - a.strengthScore);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <TrendingUp size={18} />
        Team Strength Model
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 60]} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
          <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : value}`} />
          <Legend />
          <Bar 
            dataKey="strengthScore" 
            name="Strength Score" 
            fill="#8884d8" 
            background={{ fill: '#eee' }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TeamRadarChart = ({ teamData }) => {
  if (!teamData) return <Spinner />;

  const radarData = [
    { 
      subject: 'Win Rate', 
      value: teamData.win_rate, 
      fullMark: 100 
    },
    { 
      subject: 'Batting First', 
      value: teamData.batting_first_win_rate, 
      fullMark: 100 
    },
    { 
      subject: 'Recent Form', 
      value: teamData.recent_form, 
      fullMark: 100 
    },
    { 
      subject: 'Balanced Ability', 
      value: teamData.balanced_ability * 3, 
      fullMark: 100 
    },
    { 
      subject: 'Playoff Experience', 
      value: teamData.playoff_experience, 
      fullMark: 100 
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <Activity size={18} />
        {teamData.team} Performance Metrics
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart outerRadius={90} data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Team Stats" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const EliminatedTeamsDisplay = ({ eliminatedTeams, teamColors, teamMetrics }) => {
  if (!eliminatedTeams || eliminatedTeams.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
        <Users size={18} />
        Eliminated Teams
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {eliminatedTeams.map(team => {
          const teamMetric = teamMetrics.find(t => t.team === team);
          return (
            <div 
              key={team} 
              className="p-3 bg-gray-50 rounded-lg border-l-4 hover:shadow-md transition-shadow duration-300"
              style={{ borderLeftColor: teamColors[team] || '#CBD5E0' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: teamColors[team] || '#CBD5E0' }}>
                  <span className="text-white text-xs font-bold">{team.substring(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <div className="font-medium text-sm">{team}</div>
                  <div className="text-xs text-gray-600">Strength: {teamMetric?.strength_score.toFixed(1) || "N/A"}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Team color mapping
  const teamColors = {
    "Mumbai Indians": "#004BA0",
    "Chennai Super Kings": "#FFFF00",
    "Royal Challengers Bangalore": "#EC1C24",
    "Kolkata Knight Riders": "#3A225D",
    "Delhi Capitals": "#00008B",
    "Punjab Kings": "#ED1C24",
    "Rajasthan Royals": "#254AA5",
    "Sunrisers Hyderabad": "#FF822A",
    "Gujarat Titans": "#1D2951",
    "Lucknow Super Giants": "#A2E2FB"
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('http://localhost:5000/api/playoff-prediction');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      
      // Set default selected team to the top playoff team
      if (result.playoff_teams && result.playoff_teams.length > 0) {
        setSelectedTeam(result.playoff_teams[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to fetch data: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  // Prepare data for charts
  const prepareTeamData = () => {
    if (!data || !data.team_metrics) return [];
    
    return data.team_metrics.map(team => ({
      team: team.team,
      winRate: team.win_rate || 0,
      strengthScore: team.strength_score || 0,
      recentForm: team.recent_form || 0,
      color: teamColors[team.team] || "#CBD5E0"
    }));
  };

  const getSelectedTeamData = () => {
    if (!data || !data.team_metrics || !selectedTeam) return null;
    return data.team_metrics.find(team => team.team === selectedTeam);
  };

  // Formatted team data for components
  const teamData = prepareTeamData();
  const selectedTeamData = getSelectedTeamData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading team metrics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-gray-800">IPL 2025 Team Metrics Dashboard</h1>
            <p className="text-gray-500">
              Analytics and predictions based on machine learning models
            </p>
          </div>
        </div>
        
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Playoff Teams Section */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800">
            <Trophy size={18} />
            Playoff Teams
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data && data.playoff_teams && data.playoff_teams.map((team, index) => {
              const teamMetric = data.team_metrics.find(t => t.team === team);
              
              return (
                <div 
                  key={team} 
                  className={`p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${selectedTeam === team ? 'ring-2 ring-blue-500' : 'border border-gray-100'}`}
                  onClick={() => handleTeamSelect(team)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: teamColors[team] || '#CBD5E0' }}>
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Qualified
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-sm">{team}</h4>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="text-xs">
                      <span className="text-gray-500">Win Rate:</span>
                      <div className="font-medium">{teamMetric?.win_rate.toFixed(1) || 0}%</div>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Strength:</span>
                      <div className="font-medium">{teamMetric?.strength_score.toFixed(1) || 0}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ 
                        width: `${teamMetric?.strength_score || 0}%`, 
                        backgroundColor: teamColors[team] || '#4299E1' 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Analysis Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamStrengthChart teamMetrics={data?.team_metrics || []} />
          {selectedTeamData && <TeamRadarChart teamData={selectedTeamData} />}
        </div>

        {/* Additional Analysis Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChampionshipChart data={teamData} />
          <PlayoffBracket playoffTeams={data?.team_metrics.filter(team => data.playoff_teams.includes(team.team)) || []} />
        </div>

        {/* Eliminated Teams Section */}
        <EliminatedTeamsDisplay 
          eliminatedTeams={data?.eliminated_teams || []} 
          teamColors={teamColors}
          teamMetrics={data?.team_metrics || []}
        />

        {/* Detailed Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data && data.team_metrics
            .sort((a, b) => b.strength_score - a.strength_score)
            .slice(0, 6)
            .map(team => (
              <TeamCard 
                key={team.team}
                team={team.team}
                winRate={team.win_rate}
                strengthScore={team.strength_score}
                recentForm={team.recent_form}
                color={teamColors[team.team] || '#CBD5E0'}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;