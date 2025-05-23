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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { AlertCircle, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Import our existing player stats component
import PlayerStatsComponent from "./PlayerStatsComponent";

const StatsDashboard = () => {
  const [season, setSeason] = useState("2025");
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [teamPointsData, setTeamPointsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveData, setIsLiveData] = useState(true); // Default to true for 2025

  // Fetch available seasons 
  useEffect(() => {
    const fetchAvailableSeasons = async () => {
      try {
        // Updated to match the Flask backend's endpoint
        const response = await fetch('http://localhost:5000/api/available-years');
        if (!response.ok) {
          throw new Error('Failed to fetch available seasons');
        }
        const data = await response.json();
        
        // Updated to match the backend's response format
        const years = data.years || [];
        setAvailableSeasons(years.length > 0 ? years : ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"]);
        
        // Set the most recent season as default
        setSeason("2025"); // Always default to 2025
      } catch (err) {
        console.error('Error fetching available seasons:', err);
        setError('Failed to load available seasons. Using local data.');
        
        // Fallback to static data when API fails
        setAvailableSeasons(["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSeasons();
  }, []);

  // Fetch team points data for the selected season
  useEffect(() => {
    // Always fetch data when season changes
    fetchDataForSeason(season);
  }, [season]);

  // Function to fetch data for a specific season
  const fetchDataForSeason = async (selectedSeason) => {
    if (!selectedSeason) return;
    
    setLoading(true);
    setError(null);
    
    // Special handling for 2025 season
    if (selectedSeason === "2025") {
      setIsLiveData(true);
      
      try {
        // First fetch the existing data for 2025 from the regular endpoint
        const existingDataResponse = await fetch(`http://localhost:5000/api/points-table?year=2025`);
        
        if (existingDataResponse.ok) {
          const existingData = await existingDataResponse.json();
          
          // Update with existing data first so user sees something while waiting
          if (existingData.data && Array.isArray(existingData.data) && existingData.data.length > 0) {
            setTeamPointsData(prevData => ({
              ...prevData,
              "2025": existingData.data
            }));
            
            // Set loading to false temporarily to show existing data
            setLoading(false);
          }
        }
        
        // Then fetch the fresh live data with POST
        setLoading(true); // Set loading back to true for live data fetch
        
        const response = await fetch('http://localhost:5000/api/update-points-table-2025', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ timestamp: Date.now() })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch live data for season 2025`);
        }
        
        const data = await response.json();
        
        // Update the data if we received valid live data
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setTeamPointsData(prevData => ({
            ...prevData,
            "2025": data.data
          }));
        } else {
          console.warn("Received empty or invalid live data for 2025");
          // We already loaded existing data above, so no need to set it again
        }
      } catch (err) {
        console.error(`Error fetching data for season 2025:`, err);
        setError(`Failed to load live data for IPL 2025. Using existing data instead.`);
        // We might already have existing data loaded above
      } finally {
        setLoading(false);
      }
    } else {
      // For other seasons, check if we already have cached data
      setIsLiveData(false);
      
      if (teamPointsData[selectedSeason] && teamPointsData[selectedSeason].length > 0) {
        setLoading(false);
        return;
      }
      
      try {
        // For other seasons, use the regular API endpoint
        const response = await fetch(`http://localhost:5000/api/points-table?year=${selectedSeason}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data for season ${selectedSeason}`);
        }
        
        const data = await response.json();
        
        // Format the data to match our expected structure
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setTeamPointsData(prevData => ({
            ...prevData,
            [selectedSeason]: data.data
          }));
        } else {
          setTeamPointsData(prevData => ({
            ...prevData,
            [selectedSeason]: [] // Empty array for no data
          }));
        }
      } catch (err) {
        console.error(`Error fetching data for season ${selectedSeason}:`, err);
        setError(`Failed to load data for IPL ${selectedSeason}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle season change
  const handleSeasonChange = (newSeason) => {
    setSeason(newSeason);
    
    // Always fetch fresh data for 2025
    if (newSeason === "2025") {
      // Immediately set isLiveData to true when selecting 2025
      setIsLiveData(true);
      // Force a refresh of the data
      fetchDataForSeason(newSeason);
    }
  };

  // Function to manually refresh 2025 data
  const refreshLiveData = () => {
    if (season === "2025") {
      // Just call the fetchDataForSeason - it now handles showing existing data while loading
      fetchDataForSeason("2025");
    }
  };

  // Render loading state
  if (loading && !teamPointsData[season]) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-primary">IPL All-Seasons Stats Dashboard (2008–2025)</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg font-medium text-gray-600">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">IPL All-Seasons Stats Dashboard (2008–2025)</h1>

      <Tabs defaultValue="points" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="points">Team Points Table</TabsTrigger>
          <TabsTrigger value="player-stats">Player Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="points">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl text-blue-800 flex items-center">
                    Team Points Table
                    {isLiveData && !loading && (
                      <div className="ml-3 flex items-center">
                        <span className="h-3 w-3 rounded-full bg-red-600 mr-1.5 animate-pulse"></span>
                        <span className="text-sm font-normal text-red-600">LIVE</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Season {season} IPL Team Standings
                    {season === "2025" && (
                      <button 
                        onClick={refreshLiveData} 
                        className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center text-xs"
                        disabled={loading}
                      >
                        <Activity className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Refreshing..." : "Refresh"}
                      </button>
                    )}
                  </CardDescription>
                </div>
                <div className="mt-4 md:mt-0">
                  <Select value={season} onValueChange={handleSeasonChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Season" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSeasons.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          IPL {year}
                          {year === "2025" && (
                            <span className="ml-2 h-2 w-2 inline-block rounded-full bg-red-600"></span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading && !teamPointsData[season] && (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg font-medium text-gray-600 flex items-center">
                    Loading data...
                  </div>
                </div>
              )}
              
              {loading && teamPointsData[season] && teamPointsData[season].length > 0 && season === "2025" && (
                <div className="mb-4">
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertTitle>Updating Live Data</AlertTitle>
                    <AlertDescription>
                      Showing existing data while fetching the latest live information...
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {error && !loading && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {teamPointsData[season] && teamPointsData[season].length > 0 && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <Table>
                    <TableCaption>
                      IPL {season} Season Team Points Table
                      {season === "2025" && (
                        <span className="ml-2 text-red-600 font-medium">
                          {loading ? "(Refreshing...)" : "(Live data)"}
                        </span>
                      )}
                    </TableCaption>
                    <TableHeader className="bg-blue-50">
                      <TableRow>
                        <TableHead className="text-blue-900">Position</TableHead>
                        <TableHead className="text-blue-900">Team</TableHead>
                        <TableHead className="text-blue-900 text-center">Matches</TableHead>
                        <TableHead className="text-blue-900 text-center">Wins</TableHead>
                        <TableHead className="text-blue-900 text-center">Losses</TableHead>
                        <TableHead className="text-blue-900 text-center">Points</TableHead>
                        <TableHead className="text-blue-900 text-center">NRR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamPointsData[season].map((team, index) => (
                        <TableRow key={team.Team || team.team} className={index < 4 ? "bg-blue-50/50" : ""}>
                          <TableCell className="font-medium">
                            {index + 1}
                            {index < 4 && (
                              <Badge className="ml-2 bg-blue-600">
                                {index === 0 ? "1st" : index === 1 ? "2nd" : "Q"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{team.Team || team.team}</TableCell>
                          <TableCell className="text-center">{team.Played || team.played || team.matches}</TableCell>
                          <TableCell className="text-center">{team.Won || team.won || team.wins}</TableCell>
                          <TableCell className="text-center">{team.Lost || team.lost || team.losses}</TableCell>
                          <TableCell className="text-center font-bold">{team.Points || team.points}</TableCell>
                          <TableCell className={`text-center ${parseFloat(team.NRR || team.nrr || 0) > 0 ? "text-green-600" : "text-red-600"}`}>
                            {team.NRR || team.nrr}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {!loading && (!teamPointsData[season] || teamPointsData[season].length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No data available for IPL {season}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="player-stats">
          {/* Using our existing PlayerStatsComponent */}
          <PlayerStatsComponent season={season} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsDashboard;