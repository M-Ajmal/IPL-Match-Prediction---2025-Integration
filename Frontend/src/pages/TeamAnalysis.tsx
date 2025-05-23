import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Define team colors
const teamColors: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "	#FBC02D",
  "Royal Challengers Bengaluru": "#EC1C24",
  "Gujarat Titans": "#1D2951",
  "Lucknow Super Giants": "#A4DE02",
  "Punjab Kings": "#ED1B24",
  "Rajasthan Royals": "#FF1493",
  "Kolkata Knight Riders": "#3A225D",
  "Sunrisers Hyderabad": "#FF822A",
  "Delhi Capitals": "#0078BC",
};

// Define TypeScript interfaces for our data structures
interface SeasonData {
  wins: number;
  total: number;
  win_rate: number;
}

interface VenueData {
  played: number;
  won: number;
  win_rate: number;
}

interface HeadToHeadData {
  played: number;
  won: number;
  lost: number;
  win_rate: number;
}

interface TossPerformance {
  wins: number;
  losses: number;
}

interface TeamStats {
  total?: {
    matches: number;
    win_rate: number;
    ipl_titles: number;
    playoff_appearances: number;
  };
  win_loss_record?: {
    wins: number;
    losses: number;
  };
  performance_indicators?: {
    toss_performance: TossPerformance;
  };
  season_performance?: {
    by_season: Record<string, SeasonData>;
    best_season: [string, SeasonData];
    worst_season: [string, SeasonData];
    avg_win_rate: number;
  };
  venue_performance?: {
    venues: Record<string, VenueData>;
    best_venue: [string, VenueData];
    worst_venue: [string, VenueData];
  };
  head_to_head?: {
    records: Record<string, HeadToHeadData>;
    best_record: [string, HeadToHeadData];
    worst_record: [string, HeadToHeadData];
    most_played: [string, HeadToHeadData];
  };
}

// Interface for performance indicators
interface PerformanceIndicator {
  label: string;
  value: number;
  max: number;
}

// Interface for season data used in charts
interface FormattedSeasonData {
  season: string;
  winRate: number;
  wins: number;
  total: number;
}

// Interface for venue data used in charts
interface FormattedVenueData {
  venue: string;
  matches: number;
  wins: number;
  winRate: number;
}

// Interface for head-to-head data used in tables
interface FormattedHeadToHeadData {
  opponent: string;
  played: number;
  won: number;
  lost: number;
  winRate: number;
}

const TeamAnalysis: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamStats(selectedTeam);
    }
  }, [selectedTeam]);

  const fetchAvailableTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teams');
      const data = await response.json();
      if (data.status === 'success') {
        setAvailableTeams(data.teams);
        if (data.teams.length > 0) {
          setSelectedTeam(data.teams[0]);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch teams');
    }
  };

  const fetchTeamStats = async (teamName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${encodeURIComponent(teamName)}`);
      const data = await response.json();
      if (data.status === 'success') {
        setTeamStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch team stats');
    } finally {
      setLoading(false);
    }
  };

  const formatSeasonData = (seasonPerformance?: { by_season?: Record<string, SeasonData> }): FormattedSeasonData[] => {
    if (!seasonPerformance?.by_season) return [];
    return Object.entries(seasonPerformance.by_season).map(([season, data]) => ({
      season: season.toString(),
      winRate: data.win_rate,
      wins: data.wins,
      total: data.total
    }));
  };

  const formatVenueData = (venuePerformance?: { venues?: Record<string, VenueData> }): FormattedVenueData[] => {
    if (!venuePerformance?.venues) return [];
    
    return Object.entries(venuePerformance.venues)
      .map(([venue, data]) => ({
        venue,
        matches: data.played,
        wins: data.won,
        winRate: data.win_rate
      }))
      .filter(venue => venue.matches >= 3) 
      .sort((a, b) => b.matches - a.matches) 
      .slice(0, 5); 
  };

  const formatHeadToHeadData = (headToHead?: { records?: Record<string, HeadToHeadData> }): FormattedHeadToHeadData[] => {
    if (!headToHead?.records) return [];
    return Object.entries(headToHead.records).map(([opponent, data]) => ({
      opponent,
      played: data.played,
      won: data.won,
      lost: data.lost,
      winRate: data.win_rate
    }));
  };

  const formatPerformanceIndicators = (): PerformanceIndicator[] => {
    const indicators: PerformanceIndicator[] = [];
    
    indicators.push({
      label: "Overall Win Rate",
      value: teamStats?.total?.win_rate || 0,
      max: 100
    });

    const tossPerf = teamStats?.performance_indicators?.toss_performance;
    if (tossPerf && (tossPerf.wins + tossPerf.losses) > 0) {
      const tossWinRate = (tossPerf.wins / (tossPerf.wins + tossPerf.losses)) * 100;
      indicators.push({
        label: "Toss Win Rate",
        value: tossWinRate,
        max: 100
      });
    }

    const bestVenue = teamStats?.venue_performance?.best_venue;
    if (bestVenue) {
      indicators.push({
        label: "Best Venue Win Rate",
        value: bestVenue[1]?.win_rate || 0,
        max: 100
      });
    }

    const avgWinRate = teamStats?.season_performance?.avg_win_rate;
    if (avgWinRate) {
      indicators.push({
        label: "Season Average Win Rate",
        value: avgWinRate,
        max: 100
      });
    }

    return indicators;
  };

  if (!availableTeams.length && !loading) {
    return (
      <Alert>
        <AlertTitle>Loading Teams</AlertTitle>
        <AlertDescription>Please wait while we load the team data...</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Team Performance Analysis</h1>
        <p className="text-muted-foreground mb-6">
          Detailed statistics and analysis for each IPL team (2008-2025)
        </p>
        
        <div className="max-w-xs">
          <Select value={selectedTeam || undefined} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {availableTeams.map(team => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!loading && teamStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.total?.matches || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.total?.win_rate?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">IPL Titles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.total?.ipl_titles || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Playoff Appearances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.total?.playoff_appearances || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="seasons">Season History</TabsTrigger>
              <TabsTrigger value="venues">Venue Analysis</TabsTrigger>
              <TabsTrigger value="head2head">Head-to-Head</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Summary</CardTitle>
                  <CardDescription>
                    Overall performance metrics for {selectedTeam}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Win/Loss Record</h4>
                        <div className="flex h-4 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500"
                            style={{ width: `${teamStats.total?.win_rate || 0}%` }}
                          ></div>
                          <div
                            className="bg-red-500"
                            style={{ width: `${100 - (teamStats.total?.win_rate || 0)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Wins: {teamStats.win_loss_record?.wins || 0}</span>
                          <span>Losses: {teamStats.win_loss_record?.losses || 0}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold mb-2">Performance Indicators</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {formatPerformanceIndicators().map((indicator, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                              <p className="text-xs text-gray-500">{indicator.label}</p>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full mt-1">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: `${(indicator.value / indicator.max) * 100}%` }}
                                ></div>
                              </div>
                              <p className="text-sm font-medium mt-1">{indicator.value.toFixed(1)}{indicator.max === 100 ? '%' : ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Best & Worst Performance</h4>
                      <div className="space-y-4">
                        {teamStats.season_performance?.best_season && (
                          <div className="bg-green-50 p-3 rounded-md">
                            <h5 className="font-medium">Best Season</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {teamStats.season_performance.best_season[0]}: {teamStats.season_performance.best_season[1].win_rate.toFixed(1)}% win rate
                              ({teamStats.season_performance.best_season[1].wins}/{teamStats.season_performance.best_season[1].total} matches)
                            </p>
                          </div>
                        )}
                        
                        {teamStats.season_performance?.worst_season && (
                          <div className="bg-red-50 p-3 rounded-md">
                            <h5 className="font-medium">Worst Season</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {teamStats.season_performance.worst_season[0]}: {teamStats.season_performance.worst_season[1].win_rate.toFixed(1)}% win rate
                              ({teamStats.season_performance.worst_season[1].wins}/{teamStats.season_performance.worst_season[1].total} matches)
                            </p>
                          </div>
                        )}
                        
                        {teamStats.venue_performance?.best_venue && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <h5 className="font-medium">Best Venue</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {teamStats.venue_performance.best_venue[0]}: {teamStats.venue_performance.best_venue[1].win_rate.toFixed(1)}% win rate
                              ({teamStats.venue_performance.best_venue[1].won}/{teamStats.venue_performance.best_venue[1].played} matches)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seasons" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Season-by-Season Performance</CardTitle>
                  <CardDescription>
                    How {selectedTeam} performed across IPL seasons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formatSeasonData(teamStats.season_performance)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="season" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="winRate" 
                          name="Win Rate (%)" 
                          stroke={teamColors[selectedTeam || ""] || "#0078BC"} 
                          fill={teamColors[selectedTeam || ""] || "#0078BC"} 
                          fillOpacity={0.3} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-md text-center">
                      <div className="text-sm text-gray-500">Best Season Win Rate</div>
                      <div className="font-medium mt-1">
                        {teamStats.season_performance?.best_season?.[1]?.win_rate?.toFixed(1) || '0'}%
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-md text-center">
                      <div className="text-sm text-gray-500">Worst Season Win Rate</div>
                      <div className="font-medium mt-1">
                        {teamStats.season_performance?.worst_season?.[1]?.win_rate?.toFixed(1) || '0'}%
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <div className="text-sm text-gray-500">Average Win Rate</div>
                      <div className="font-medium mt-1">
                        {teamStats.season_performance?.avg_win_rate?.toFixed(1) || '0'}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="venues" className="space-y-6">
  <Card className="hover:shadow-lg transition-shadow rounded-2xl border border-gray-200">
    <CardHeader>
      <CardTitle className="text-xl font-semibold">Venue-wise Performance Analysis</CardTitle>
      <CardDescription className="text-sm text-gray-600">
        Explore how <span className="font-semibold text-gray-800">{selectedTeam}</span> has performed at its five most frequently played venues. Win rate and match count are both considered.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <div className="h-[28rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formatVenueData(teamStats.venue_performance)}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 120, bottom: 20 }}
            barCategoryGap="15%"
          >
            <defs>
              <linearGradient id="winRateGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00c6ff" />
                <stop offset="100%" stopColor="#0078bc" />
              </linearGradient>
              <linearGradient id="matchesGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a18cd1" />
                <stop offset="100%" stopColor="#fbc2eb" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              domain={[0, 'dataMax']} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
            />
            <YAxis 
              dataKey="venue" 
              type="category" 
              tick={{ fontSize: 13, fill: '#111827', fontWeight: 500 }} 
              width={120}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
              labelStyle={{ fontWeight: 600, color: "#111827" }}
              formatter={(value, name) => name === "Win Rate (%)" ? `${value}%` : value}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
            
            <Bar 
              dataKey="winRate" 
              name="Win Rate (%)" 
              fill="url(#winRateGradient)" 
              barSize={18}
              radius={[6, 6, 6, 6]}
              isAnimationActive={true}
              animationDuration={800}
            />
            <Bar 
              dataKey="matches" 
              name="Matches Played" 
              fill="url(#matchesGradient)" 
              barSize={18}
              radius={[6, 6, 6, 6]}
              isAnimationActive={true}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

   
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
       
        <div>
          <h4 className="text-base font-semibold text-green-700 mb-3">Top Performing Venues</h4>
          <div className="space-y-2">
            {formatVenueData(teamStats.venue_performance)
              .sort((a, b) => b.winRate - a.winRate)
              .slice(0, 3)
              .map((venue, index) => (
                <div
                  key={index}
                  className="bg-green-50 hover:bg-green-100 transition p-3 rounded-xl flex justify-between items-center shadow-sm"
                >
                  <div className="text-sm font-medium text-gray-800">{venue.venue}</div>
                  <div className="font-semibold text-green-700 text-sm">
                    {venue.winRate.toFixed(1)}% ({venue.wins} wins / {venue.matches} matches)
                  </div>
                </div>
              ))}
          </div>
        </div>

      
        <div>
          <h4 className="text-base font-semibold text-red-700 mb-3">Most Challenging Venues</h4>
          <div className="space-y-2">
            {formatVenueData(teamStats.venue_performance)
              .sort((a, b) => a.winRate - b.winRate)
              .slice(0, 3)
              .map((venue, index) => (
                <div
                  key={index}
                  className="bg-red-50 hover:bg-red-100 transition p-3 rounded-xl flex justify-between items-center shadow-sm"
                >
                  <div className="text-sm font-medium text-gray-800">{venue.venue}</div>
                  <div className="font-semibold text-red-700 text-sm">
                    {venue.winRate.toFixed(1)}% ({venue.wins} wins / {venue.matches} matches)
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>


            
            <TabsContent value="head2head" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Head-to-Head Records</CardTitle>
                  <CardDescription>
                    {selectedTeam}'s performance against other IPL teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Team</th>
                          <th className="text-center py-3 px-4">Played</th>
                          <th className="text-center py-3 px-4">Won</th>
                          <th className="text-center py-3 px-4">Lost</th>
                          <th className="text-center py-3 px-4">Win Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formatHeadToHeadData(teamStats.head_to_head).map((team, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                            <td className="py-2 px-4 font-medium">{team.opponent}</td>
                            <td className="py-2 px-4 text-center">{team.played}</td>
                            <td className="py-2 px-4 text-center">{team.won}</td>
                            <td className="py-2 px-4 text-center">{team.lost}</td>
                            <td className="py-2 px-4 text-center">
                              <div className="inline-block w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: `${team.winRate}%` }}
                                ></div>
                              </div>
                              <span>{team.winRate.toFixed(1)}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {teamStats.head_to_head?.best_record && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="text-sm text-gray-500">Best Record Against</div>
                        <div className="font-medium mt-1">
                          {teamStats.head_to_head.best_record[0]} ({teamStats.head_to_head.best_record[1].win_rate.toFixed(1)}%)
                        </div>
                      </div>
                    )}
                    {teamStats.head_to_head?.worst_record && (
                      <div className="bg-red-50 p-3 rounded-md">
                        <div className="text-sm text-gray-500">Worst Record Against</div>
                        <div className="font-medium mt-1">
                          {teamStats.head_to_head.worst_record[0]} ({teamStats.head_to_head.worst_record[1].win_rate.toFixed(1)}%)
                        </div>
                      </div>
                    )}
                    {teamStats.head_to_head?.most_played && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="text-sm text-gray-500">Most Played</div>
                        <div className="font-medium mt-1">
                          {teamStats.head_to_head.most_played[0]} ({teamStats.head_to_head.most_played[1].played} matches)
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default TeamAnalysis;