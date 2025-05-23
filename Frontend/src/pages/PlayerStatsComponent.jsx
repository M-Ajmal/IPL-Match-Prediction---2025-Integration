import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { AlertCircle, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

const PlayerStatsComponent = ({ season }) => {
  const [battingData, setBattingData] = useState({
    orangeCap: [],
    mostCenturies: [],
    bestAverage: []
  });
  
  const [bowlingData, setBowlingData] = useState({
    purpleCap: [],
    bestBowlingFigures: [],
    greenDotBalls: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveData, setIsLiveData] = useState(false);
  const [dataSource, setDataSource] = useState(null);

  // ✅ Main effect on component mount or season change
  useEffect(() => {
    fetchDataForSeason(season);
  }, [season]);

  const fetchDataForSeason = async (selectedSeason) => {
    if (!selectedSeason) return;
    
    setLoading(true);
    setError(null);
    
    // Always try to fetch cached data first for all seasons
    try {
      let existingData;
      
      if (selectedSeason === "2025") {
        existingData = await fetchCachedPlayerStats2025();
        setIsLiveData(true);
      } else {
        existingData = await fetchCachedPlayerStatsHistory(selectedSeason);
        setIsLiveData(false);
      }
      
      if (existingData) {
        setBattingData({
          orangeCap: parsePlayerNames(existingData.battingStats.orangeCap.data || []),
          mostCenturies: parsePlayerNames(existingData.battingStats.mostCenturies.data || []),
          bestAverage: parsePlayerNames(existingData.battingStats.bestAverage.data || [])
        });
        
        setBowlingData({
          purpleCap: parsePlayerNames(existingData.bowlingStats.purpleCap.data || []),
          bestBowlingFigures: parsePlayerNames(existingData.bowlingStats.bestBowlingFigures.data || []),
          greenDotBalls: parsePlayerNames(existingData.bowlingStats.greenDotBalls.data || [])
        });
        
        setDataSource('cached');
        
        // If it's 2025 season, trigger refresh in the background after showing cached data
        if (selectedSeason === "2025") {
         // refreshPlayerStats();
        }
      } else {
        throw new Error(`No cached data available for season ${selectedSeason}`);
      }
    } catch (err) {
      console.error(`Error fetching data for season ${selectedSeason}:`, err);
      setError(`Failed to load data for IPL ${selectedSeason}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCachedPlayerStats2025 = async () => {
    try {
      const [orangeCapRes, centuriesRes, avgRes] = await Promise.all([
        fetch('http://localhost:5000/api/orange-cap-2025'),
        fetch('http://localhost:5000/api/most-centuries-2025'),
        fetch('http://localhost:5000/api/best-batting-average-2025')
      ]);
      
      const [purpleCapRes, bowlingFiguresRes, dotBallsRes] = await Promise.all([
        fetch('http://localhost:5000/api/purple-cap-2025'),
        fetch('http://localhost:5000/api/best-bowling-figures-2025'),
        fetch('http://localhost:5000/api/green-dot-balls-2025')
      ]);
      
      if (!orangeCapRes.ok || !centuriesRes.ok || !avgRes.ok || 
          !purpleCapRes.ok || !bowlingFiguresRes.ok || !dotBallsRes.ok) {
        throw new Error('One or more API requests failed');
      }
      
      const [orangeCapData, centuriesData, avgData, 
             purpleCapData, bowlingFiguresData, dotBallsData] = await Promise.all([
        orangeCapRes.json(),
        centuriesRes.json(),
        avgRes.json(),
        purpleCapRes.json(),
        bowlingFiguresRes.json(),
        dotBallsRes.json()
      ]);
      
      return {
        battingStats: {
          orangeCap: orangeCapData,
          mostCenturies: centuriesData,
          bestAverage: avgData
        },
        bowlingStats: {
          purpleCap: purpleCapData,
          bestBowlingFigures: bowlingFiguresData,
          greenDotBalls: dotBallsData
        }
      };
    } catch (err) {
      console.error('Error fetching cached player stats for 2025:', err);
      return null;
    }
  };

  const fetchCachedPlayerStatsHistory = async (selectedSeason) => {
    try {
      const [orangeCapRes, centuriesRes, avgRes] = await Promise.all([
        fetch(`http://localhost:5000/api/orange-cap?year=${selectedSeason}`),
        fetch(`http://localhost:5000/api/most-centuries?year=${selectedSeason}`),
        fetch(`http://localhost:5000/api/best-batting-average?year=${selectedSeason}`)
      ]);
      
      const [purpleCapRes, bowlingFiguresRes, dotBallsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/purple-cap?year=${selectedSeason}`),
        fetch(`http://localhost:5000/api/best-bowling-figures?year=${selectedSeason}`),
        fetch(`http://localhost:5000/api/green-dot-balls?year=${selectedSeason}`)
      ]);
      
      if (!orangeCapRes.ok || !centuriesRes.ok || !avgRes.ok || 
          !purpleCapRes.ok || !bowlingFiguresRes.ok || !dotBallsRes.ok) {
        throw new Error(`One or more API requests failed for season ${selectedSeason}`);
      }
      
      const [orangeCapData, centuriesData, avgData, 
            purpleCapData, bowlingFiguresData, dotBallsData] = await Promise.all([
        orangeCapRes.json(),
        centuriesRes.json(),
        avgRes.json(),
        purpleCapRes.json(),
        bowlingFiguresRes.json(),
        dotBallsRes.json()
      ]);
      
      return {
        battingStats: {
          orangeCap: orangeCapData,
          mostCenturies: centuriesData,
          bestAverage: avgData
        },
        bowlingStats: {
          purpleCap: purpleCapData,
          bestBowlingFigures: bowlingFiguresData,
          greenDotBalls: dotBallsData
        }
      };
    } catch (err) {
      console.error(`Error fetching historical player stats for season ${selectedSeason}:`, err);
      return null;
    }
  };

  // Refresh function that updates live data for 2025
  const refreshPlayerStats = async () => {
    if (season === "2025") {
      // We don't set loading to true here to avoid disrupting the UI
      // Just show the update notification if we already have data
      setError(null);
      
      try {
        // Make POST calls to refresh all endpoints
        await Promise.all([
          fetch('http://localhost:5000/api/orange-cap-2025', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
          }),
          fetch('http://localhost:5000/api/most-centuries-2025', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
          }),
          fetch('http://localhost:5000/api/best-batting-average-2025', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
          }),
          fetch('http://localhost:5000/api/purple-cap-2025', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
          }),
          fetch('http://localhost:5000/api/best-bowling-figures-2025', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
          }),
          fetch('http://localhost:5000/api/green-dot-balls-2025', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
          })
        ]);
        
        // Then fetch the updated data
        const updatedData = await fetchCachedPlayerStats2025();
        
        if (updatedData) {
          setBattingData({
            orangeCap: parsePlayerNames(updatedData.battingStats.orangeCap.data || []),
            mostCenturies: parsePlayerNames(updatedData.battingStats.mostCenturies.data || []),
            bestAverage: parsePlayerNames(updatedData.battingStats.bestAverage.data || [])
          });
          
          setBowlingData({
            purpleCap: parsePlayerNames(updatedData.bowlingStats.purpleCap.data || []),
            bestBowlingFigures: parsePlayerNames(updatedData.bowlingStats.bestBowlingFigures.data || []),
            greenDotBalls: parsePlayerNames(updatedData.bowlingStats.greenDotBalls.data || [])
          });
          
          setDataSource('live');
        }
      } catch (err) {
        console.error('Error refreshing player stats:', err);
        setError('Failed to load live data. Using cached data instead.');
      }
    }
  };

  const parsePlayerNames = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(player => {
      if (!player || !player.PLAYER) return {};
      
      const playerInfo = player.PLAYER.split('\n');
      return {
        ...player,
        name: playerInfo[0] || 'Unknown Player',
        team: playerInfo.length > 1 ? playerInfo[1] : '',
        RUNS: parseInt(player.RUNS || 0, 10),
        "100": parseInt(player["100"] || 0, 10),
        "50": parseInt(player["50"] || 0, 10),
        AVG: parseFloat(player.AVG || 0),
        WKTS: parseInt(player.WKTS || 0, 10),
        ECON: parseFloat(player.ECON || 0),
        DOTS: parseInt(player.DOTS || 0, 10)
      };
    });
  };

  // Helper to safely get the top player for each category
  const getTopPlayer = (dataArray) => {
    if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
      return { name: 'Data loading...', team: '', RUNS: 0, AVG: 0, SR: 0, WKTS: 0, ECON: 0, DOTS: 0, HS: 0, BBI: '0/0' };
    }
    return dataArray[0];
  };

  if (loading && (!battingData.orangeCap.length || !bowlingData.purpleCap.length)) {
    return (
      <div className="w-full py-8 flex justify-center items-center">
        <div className="text-center">
          <Activity className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-700">Loading player statistics...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {season === "2025" && loading && (
        <div className="w-full py-2 bg-blue-50 text-blue-700 flex justify-center items-center text-sm font-medium border-b border-blue-200 animate-pulse">
          <Activity className="h-4 w-4 mr-2 animate-spin" />
          Refreshing live stats... Please wait
        </div>
      )}
      
      {error && (
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batting Stats */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-xl text-blue-800 flex items-center">
                  IPL {season} Batting Stats
                  {isLiveData && season === "2025" && !loading && (
                    <div className="ml-3 flex items-center">
                      <span className="h-3 w-3 rounded-full bg-red-600 mr-1.5 animate-pulse"></span>
                      <span className="text-sm font-normal text-red-600">LIVE</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Top performers with the bat
                  {season === "2025" && (
                    <button 
                      onClick={refreshPlayerStats} 
                      className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center text-xs"
                      disabled={loading}
                    >
                      <Activity className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Refreshing..." : "Refresh"}
                    </button>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orangeCap">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="orangeCap">Orange Cap</TabsTrigger>
                <TabsTrigger value="bestAverage">Best Batting Average</TabsTrigger>
                <TabsTrigger value="mostCenturies">Most Centuries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="orangeCap">
                <div className="h-64 w-full">
                  <ChartContainer
                    config={{
                      RUNS: { color: "#F59E0B" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={battingData.orangeCap}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent 
                              labelClassName="font-medium text-blue-900"
                              formatter={(value, name) => [`${value}`, name === "RUNS" ? "Runs" : name]}
                            />
                          }
                        />
                        <Bar 
                          dataKey="RUNS" 
                          fill="var(--color-RUNS, #F59E0B)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Orange Cap Leader: <span className="font-bold text-blue-800">
                      {getTopPlayer(battingData.orangeCap).name} ({getTopPlayer(battingData.orangeCap).team})
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Stats: {getTopPlayer(battingData.orangeCap).RUNS} runs, 
                    Avg: {getTopPlayer(battingData.orangeCap).AVG}, 
                    SR: {getTopPlayer(battingData.orangeCap).SR}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="bestAverage">
                <div className="h-64 w-full">
                  <ChartContainer
                    config={{
                      AVG: { color: "#3B82F6" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={battingData.bestAverage}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent 
                              labelClassName="font-medium text-blue-900"
                              formatter={(value, name) => [`${value}`, name === "AVG" ? "Batting Average" : name]}
                            />
                          }
                        />
                        <Bar 
                          dataKey="AVG" 
                          fill="var(--color-AVG, #3B82F6)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Highest Average: <span className="font-bold text-blue-800">
                      {getTopPlayer(battingData.bestAverage).name} ({getTopPlayer(battingData.bestAverage).team})
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Stats: Avg: {getTopPlayer(battingData.bestAverage).AVG}, 
                    Runs: {getTopPlayer(battingData.bestAverage).RUNS}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="mostCenturies">
                <div className="h-64 w-full">
                  <ChartContainer
                    config={{
                      "100": { color: "#3B82F6" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={battingData.mostCenturies}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent 
                              labelClassName="font-medium text-blue-900"
                              formatter={(value, name) => [`${value}`, name === "100" ? "Centuries" : name]}
                            />
                          }
                        />
                        <Bar 
                          dataKey="100" 
                          fill="var(--color-100, #3B82F6)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Most Centuries: <span className="font-bold text-blue-800">
                      {getTopPlayer(battingData.mostCenturies).name} ({getTopPlayer(battingData.mostCenturies).team})
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Highest Score: {getTopPlayer(battingData.mostCenturies).HS}, 
                    SR: {getTopPlayer(battingData.mostCenturies).SR}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Bowling Stats */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-xl text-blue-800 flex items-center">
                  IPL {season} Bowling Stats
                  {isLiveData && season === "2025" && !loading && (
                    <div className="ml-3 flex items-center">
                      <span className="h-3 w-3 rounded-full bg-red-600 mr-1.5 animate-pulse"></span>
                      <span className="text-sm font-normal text-red-600">LIVE</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Top performers with the ball
                  {season === "2025" && (
                    <button 
                      onClick={refreshPlayerStats} 
                      className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center text-xs"
                      disabled={loading}
                    >
                      <Activity className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Refreshing..." : "Refresh"}
                    </button>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="purpleCap">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="purpleCap">Purple Cap</TabsTrigger>
                <TabsTrigger value="economy">Best Economy</TabsTrigger>
                <TabsTrigger value="dotBalls">TATA IPL Green Dot Balls</TabsTrigger>
              </TabsList>
              
              <TabsContent value="purpleCap">
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      WKTS: { color: "#8B5CF6" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={bowlingData.purpleCap}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent 
                              labelClassName="font-medium text-blue-900"
                              formatter={(value, name) => [`${value}`, name === "WKTS" ? "Wickets" : name]}
                            />
                          }
                        />
                        <Bar 
                          dataKey="WKTS" 
                          fill="var(--color-WKTS, #8B5CF6)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Purple Cap Leader: <span className="font-bold text-blue-800">
                      {getTopPlayer(bowlingData.purpleCap).name} ({getTopPlayer(bowlingData.purpleCap).team})
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Stats: {getTopPlayer(bowlingData.purpleCap).WKTS} wickets, 
                    Econ: {getTopPlayer(bowlingData.purpleCap).ECON}, 
                    Best: {getTopPlayer(bowlingData.purpleCap).BBI}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="economy">
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      ECON: { color: "#2563EB" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...bowlingData.purpleCap].sort((a, b) => a.ECON - b.ECON)}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent 
                              labelClassName="font-medium text-blue-900"
                              formatter={(value, name) => [`${value}`, name === "ECON" ? "Economy Rate" : name]}
                            />
                          }
                        />
                        <Bar 
                          dataKey="ECON" 
                          fill="var(--color-ECON, #2563EB)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4">
                  {bowlingData.purpleCap.length > 0 && (
                    <>
                      <p className="text-sm text-gray-500">
                        Best Economy: <span className="font-bold text-blue-800">
                          {[...bowlingData.purpleCap].sort((a, b) => a.ECON - b.ECON)[0]?.name || 'N/A'} 
                          ({[...bowlingData.purpleCap].sort((a, b) => a.ECON - b.ECON)[0]?.team || 'N/A'})
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Economy: {[...bowlingData.purpleCap].sort((a, b) => a.ECON - b.ECON)[0]?.ECON || 'N/A'} 
                      </p>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="dotBalls">
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      DOTS: { color: "#10B981" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={bowlingData.greenDotBalls}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent 
                              labelClassName="font-medium text-blue-900"
                              formatter={(value, name) => [`${value}`, name === "DOTS" ? "Dot Balls" : name]}
                            />
                          }
                        />
                        <Bar 
                          dataKey="DOTS" 
                          fill="var(--color-DOTS, #10B981)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    TATA IPL Green Dot Balls Leader: <span className="font-bold text-blue-800">
                      {getTopPlayer(bowlingData.greenDotBalls).name} ({getTopPlayer(bowlingData.greenDotBalls).team})
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Stats: {getTopPlayer(bowlingData.greenDotBalls).DOTS} dot balls,
                    Wickets: {getTopPlayer(bowlingData.greenDotBalls).WKTS},
                    Econ: {getTopPlayer(bowlingData.greenDotBalls).ECON}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Data freshness indicator */}
      {season === "2025" && (
        <div className="mt-4 text-xs text-gray-500 flex items-center justify-end">
          <div className="flex items-center">
            <span className="mr-2">Data source:</span>
            {dataSource === 'live' ? (
              <span className="inline-flex items-center text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600 mr-1 animate-pulse"></span>
                Live data
              </span>
            ) : (
              <span className="inline-flex items-center text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-600 mr-1"></span>
                Cached data
              </span>
            )}
          </div>
          <button 
            onClick={refreshPlayerStats} 
            className="ml-4 text-blue-600 hover:text-blue-800 inline-flex items-center"
            disabled={loading}
          >
            <Activity className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      )}
    </>
  );
};

export default PlayerStatsComponent;