import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronDown, ChevronUp, Trophy, MapPin, Activity, TrendingUp } from "lucide-react";

const teamOptions = [
  { label: "Mumbai Indians", value: "Mumbai Indians", color: "#004BA0" },
  { label: "Chennai Super Kings", value: "Chennai Super Kings", color: "#FFD700" },
  { label: "Royal Challengers Bangalore", value: "Royal Challengers Bangalore", color: "#EC1C24" },
  { label: "Gujarat Titans", value: "Gujarat Titans", color: "#1D2951" },
  { label: "Lucknow Super Giants", value: "Lucknow Super Giants", color: "#A4DE02" },
  { label: "Punjab Kings", value: "Punjab Kings", color: "#ED1B24" },
  { label: "Rajasthan Royals", value: "Rajasthan Royals", color: "#FF1493" },
  { label: "Kolkata Knight Riders", value: "Kolkata Knight Riders", color: "#3A225D" },
  { label: "Sunrisers Hyderabad", value: "Sunrisers Hyderabad", color: "#FF822A" },
  { label: "Delhi Capitals", value: "Delhi Capitals", color: "#0078BC" },
];

const MatchSimulator = () => {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [venue, setVenue] = useState("");
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");
  const [simulated, setSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [venueOptions, setVenueOptions] = useState([]);
  const [team1Stats, setTeam1Stats] = useState(null);
  const [team2Stats, setTeam2Stats] = useState(null);
  const [team1VenueStats, setTeam1VenueStats] = useState(null);
  const [team2VenueStats, setTeam2VenueStats] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  
  // Accordion state
  const [openTeamAnalysis, setOpenTeamAnalysis] = useState(true);
  const [openVenueAnalysis, setOpenVenueAnalysis] = useState(false);
  const [openTossAnalysis, setOpenTossAnalysis] = useState(false);
  
  // API base URL - change this to match your server configuration
  const API_BASE_URL = 'http://localhost:5000';
  
  // Fetch venues when component mounts
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/venues`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.venues) {
          const formattedVenues = data.venues.map(venue => ({
            label: venue,
            value: venue
          }));
          setVenueOptions(formattedVenues);
        }
      })
      .catch(error => console.error('Error fetching venues:', error));
  }, []);

  // Reset toss winner when teams change
  useEffect(() => {
    setTossWinner("");
    setDecision("");
  }, [team1, team2]);

  // Fetch team stats when teams are selected
  useEffect(() => {
    if (team1) {
      fetchTeamStats(team1, setTeam1Stats);
    }
    if (team2) {
      fetchTeamStats(team2, setTeam2Stats);
    }
  }, [team1, team2]);

  // Fetch venue stats when venue and teams are selected
  useEffect(() => {
    if (venue && team1 && team2) {
      fetchVenueStats(venue, team1, team2);
    }
  }, [venue, team1, team2]);

  const fetchTeamStats = (teamName, setStateFn) => {
    fetch(`${API_BASE_URL}/api/team/${encodeURIComponent(teamName)}/stats`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setStateFn(data);
      })
      .catch(error => console.error(`Error fetching stats for ${teamName}:`, error));
  };

  const fetchVenueStats = (venueName, team1Name, team2Name) => {
    // Add error handling for venue name
    if (!venueName || !team1Name || !team2Name) {
      console.log("Missing required parameters for venue stats");
      return;
    }
  
    fetch(`${API_BASE_URL}/api/venue/${encodeURIComponent(venueName)}/stats`)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            console.log(`No stats found for venue: ${venueName}`);
            setTeam1VenueStats(null);
            setTeam2VenueStats(null);
            return null; // Return null instead of throwing to handle 404 gracefully
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data) return; // Handle the null case from a 404
        
        if (data.team_stats) {
          // Set team venue stats if they exist in the response
          setTeam1VenueStats(data.team_stats[team1Name] || null);
          setTeam2VenueStats(data.team_stats[team2Name] || null);
        } else {
          // Handle case where team_stats is missing
          console.log("Venue data doesn't contain team stats");
          setTeam1VenueStats(null);
          setTeam2VenueStats(null);
        }
      })
      .catch(error => {
        console.error(`Error fetching venue stats:`, error);
        // Set venue stats to null on error to handle UI gracefully
        setTeam1VenueStats(null);
        setTeam2VenueStats(null);
      });
  };
  

  const handleSimulate = () => {
    setLoading(true);
    
    // Create prediction request body
    const requestData = {
      team1: team1,
      team2: team2,
      venue: venue,
      toss_winner: tossWinner,
      toss_decision: decision === "bat" ? "bat" : "field"
    };
    
    // Call prediction API with better error handling
    fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => {
        if (!response.ok) {
          // Read the error message from the response
          return response.json().then(errorData => {
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
          }).catch(() => {
            // If we can't parse the error as JSON, throw a generic error
            throw new Error(`HTTP error! Status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        setPredictionResult(data);
        setSimulated(true);
        setLoading(false);
        // Open Team Analysis by default after simulation
        setOpenTeamAnalysis(true);
      })
      .catch(error => {
        console.error('Error predicting match:', error);
        setLoading(false);
        // Provide user-friendly error message
        alert(`Error making prediction: ${error.message || "Unknown error occurred"}`);
      });
  };
  
  const getTeamColor = (teamId) => {
    const team = teamOptions.find(t => t.value === teamId);
    return team ? team.color : "#666666";
  };

  const renderFormIndicator = (result) => {
    return result === 'W' ? (
      <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-1" title="Win"></span>
    ) : (
      <span className="inline-block w-4 h-4 rounded-full bg-red-500 mr-1" title="Loss"></span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
      <Card className="w-full shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <CardTitle className="text-2xl font-bold flex items-center justify-center text-white">
  <Trophy className="mr-3" size={24} />
  IPL MATCH PREDICTOR
</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Inputs */}
            <div className="space-y-4 bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg text-center border-b pb-2 text-blue-800">MATCH SETUP</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team1" className="text-sm font-medium">Team 1</Label>
                  <Select value={team1} onValueChange={setTeam1}>
                    <SelectTrigger id="team1" className="bg-white">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions.map(team => (
                        <SelectItem key={team.value} value={team.value}>
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: team.color }}></span>
                            {team.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team2" className="text-sm font-medium">Team 2</Label>
                  <Select value={team2} onValueChange={setTeam2}>
                    <SelectTrigger id="team2" className="bg-white">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions
                        .filter(team => team.value !== team1)
                        .map(team => (
                          <SelectItem key={team.value} value={team.value}>
                            <div className="flex items-center">
                              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: team.color }}></span>
                              {team.label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue" className="text-sm font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Venue
                </Label>
                <Select value={venue} onValueChange={setVenue}>
                  <SelectTrigger id="venue" className="bg-white">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venueOptions.map(venue => (
                      <SelectItem key={venue.value} value={venue.value}>
                        {venue.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="toss" className="text-sm font-medium">Toss Winner</Label>
                  <Select value={tossWinner} onValueChange={setTossWinner}>
                    <SelectTrigger id="toss" disabled={!team1 || !team2} className="bg-white">
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {team1 && (
                        <SelectItem value={team1}>
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getTeamColor(team1) }}></span>
                            {team1}
                          </div>
                        </SelectItem>
                      )}
                      {team2 && (
                        <SelectItem value={team2}>
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getTeamColor(team2) }}></span>
                            {team2}
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decision" className="text-sm font-medium">Toss Decision</Label>
                  <Select value={decision} onValueChange={setDecision} disabled={!tossWinner}>
                    <SelectTrigger id="decision" className="bg-white">
                      <SelectValue placeholder="Bat/Bowl?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bat">Bat First</SelectItem>
                      <SelectItem value="bowl">Bowl First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSimulate} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 transition-all duration-300"
                disabled={!team1 || !team2 || !venue || !tossWinner || !decision || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Simulating Match...
                  </>
                ) : (
                  <>PREDICT MATCH RESULT</>
                )}
              </Button>
              
              {/* Prediction Summary */}
              {predictionResult && predictionResult.prediction && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center border-b border-blue-200 pb-2 mb-3">
                    <h3 className="font-bold text-lg text-blue-800">
                      MATCH PREDICTION
                    </h3>
                  </div>
                  
                  <div className="space-y-4 mt-3">
                    {/* Team Matchup */}
                    <div className="flex items-center justify-center text-lg font-bold gap-3">
                      <div className="text-right" style={{ color: getTeamColor(team1) }}>
                        {team1.split(' ').slice(-1)[0]}
                      </div>
                      <div className="text-center text-gray-600">vs</div>
                      <div className="text-left" style={{ color: getTeamColor(team2) }}>
                        {team2.split(' ').slice(-1)[0]}
                      </div>
                    </div>
                    
                    {/* Team 1 Prediction */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{team1}</span>
                        <span className="font-bold text-sm">{(predictionResult.prediction[team1] * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full" 
                          style={{
                            width: `${(predictionResult.prediction[team1] * 100).toFixed(1)}%`,
                            backgroundColor: getTeamColor(team1)
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Team 2 Prediction */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{team2}</span>
                        <span className="font-bold text-sm">{(predictionResult.prediction[team2] * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full" 
                          style={{
                            width: `${(predictionResult.prediction[team2] * 100).toFixed(1)}%`,
                            backgroundColor: getTeamColor(team2)
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Winner Prediction */}
                    <div className="text-center mt-2 font-bold">
                      {predictionResult.prediction[team1] > predictionResult.prediction[team2] ? (
                        <div className="text-lg" style={{ color: getTeamColor(team1) }}>
                          {team1} likely to win
                        </div>
                      ) : (
                        <div className="text-lg" style={{ color: getTeamColor(team2) }}>
                          {team2} likely to win
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="bg-white rounded-lg shadow h-full">
              {!simulated ? (
                <div className="h-full flex items-center justify-center text-gray-500 flex-col space-y-2 p-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-blue-400" />
                  </div>
                  <p className="text-center text-lg font-medium mt-4">Fill in the match details and click Predict to see the match analysis</p>
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  {/* Key Factors */}
                  {predictionResult && predictionResult.key_factors && (
                    <div className="p-4 border-b">
                      <div className="text-center pb-2 mb-3">
                        <h3 className="font-bold text-lg text-blue-800 flex items-center justify-center">
                          <TrendingUp className="mr-2" size={20} />
                          KEY FACTORS
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(predictionResult.key_factors).map(([factor, value], idx) => {
                          // Check if value is an object with team and impact properties
                          const hasTeamImpact = value && typeof value === 'object' && 'team' in value && 'impact' in value;
                          
                          return (
                            <div key={idx} className="bg-gray-50 p-2 rounded border">
                              <p className="text-sm">
                                <span className="font-medium block text-blue-800">{formatFactorName(factor)}</span>
                                <span className="block mt-1">
                                  {hasTeamImpact 
                                    ? <span className="font-medium" style={{ color: getTeamColor(value.team) }}>{value.team} ({formatFactorValue(value.impact)})</span>
                                    : typeof value === 'string' 
                                      ? value 
                                      : typeof value === 'number' 
                                        ? formatFactorValue(value)
                                        : JSON.stringify(value)
                                  }
                                </span>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accordion Sections */}
                  <div className="divide-y">
                    {/* Team Analysis Section */}
                    <div className="border-b">
                      <button 
                        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenTeamAnalysis(!openTeamAnalysis)}
                      >
                        <div className="flex items-center font-bold text-blue-800">
                          <Activity className="mr-2" size={18} />
                          TEAM ANALYSIS
                        </div>
                        {openTeamAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {openTeamAnalysis && (
                        <div className="p-4">
                          {/* Teams Side by Side */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Team 1 Analysis */}
                            {team1Stats && (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${getTeamColor(team1)}10` }}>
                                <div className="text-center mb-2 pb-1 border-b" style={{ borderColor: `${getTeamColor(team1)}50` }}>
                                  <h3 className="font-bold text-md" style={{ color: getTeamColor(team1) }}>
                                    {team1.toUpperCase()}
                                  </h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <div className="flex items-center mt-1 justify-center">
                                      {team1Stats.recent_form && team1Stats.recent_form.map((result, idx) => (
                                        <span key={idx} className="flex items-center">
                                          {renderFormIndicator(result)}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-center text-xs mt-1 text-gray-500">Recent form</p>
                                  </div>
                                  <p>
                                    <span className="font-medium">Win rate: </span>
                                    {(team1Stats.win_rate * 100).toFixed(1)}%
                                  </p>
                                  <p>
                                    <span className="font-medium">Recent: </span>
                                    {(team1Stats.form_percentage * 100).toFixed(1)}%
                                  </p>
                                  <p>
                                    <span className="font-medium">Matches: </span>
                                    {team1Stats.total_matches}
                                  </p>
                                  <p>
                                    <span className="font-medium">Wins: </span>
                                    {team1Stats.total_wins}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Team 2 Analysis */}
                            {team2Stats && (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${getTeamColor(team2)}10` }}>
                                <div className="text-center mb-2 pb-1 border-b" style={{ borderColor: `${getTeamColor(team2)}50` }}>
                                  <h3 className="font-bold text-md" style={{ color: getTeamColor(team2) }}>
                                    {team2.toUpperCase()}
                                  </h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <div className="flex items-center mt-1 justify-center">
                                      {team2Stats.recent_form && team2Stats.recent_form.map((result, idx) => (
                                        <span key={idx} className="flex items-center">
                                          {renderFormIndicator(result)}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-center text-xs mt-1 text-gray-500">Recent form</p>
                                  </div>
                                  <p>
                                    <span className="font-medium">Win rate: </span>
                                    {(team2Stats.win_rate * 100).toFixed(1)}%
                                  </p>
                                  <p>
                                    <span className="font-medium">Recent: </span>
                                    {(team2Stats.form_percentage * 100).toFixed(1)}%
                                  </p>
                                  <p>
                                    <span className="font-medium">Matches: </span>
                                    {team2Stats.total_matches}
                                  </p>
                                  <p>
                                    <span className="font-medium">Wins: </span>
                                    {team2Stats.total_wins}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Venue Analysis Section */}
                    <div className="border-b">
                      <button 
                        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenVenueAnalysis(!openVenueAnalysis)}
                      >
                        <div className="flex items-center font-bold text-blue-800">
                          <MapPin className="mr-2" size={18} />
                          VENUE ANALYSIS
                        </div>
                        {openVenueAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {openVenueAnalysis && venue && (
                        <div className="p-4">
                          <div className="text-center mb-3">
                            <h4 className="font-semibold text-gray-700">{venue}</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Team 1 at Venue */}
                            {team1VenueStats ? (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${getTeamColor(team1)}10` }}>
                                <div className="text-center mb-2">
                                  <h3 className="font-bold text-sm" style={{ color: getTeamColor(team1) }}>
                                    {team1.split(' ').slice(-1)[0]}
                                  </h3>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="font-medium">Matches: </span>
                                    {team1VenueStats.played || 0}
                                  </p>
                                  <p>
                                    <span className="font-medium">Wins: </span>
                                    {team1VenueStats.wins || 0}
                                  </p>
                                  <p>
                                    <span className="font-medium">Win rate: </span>
                                    {((team1VenueStats.win_rate || 0) * 100).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-gray-100">
                                <div className="text-center">
                                  <p className="text-sm text-gray-500">No venue data available for {team1}</p>
                                </div>
                              </div>
                            )}

                            {/* Team 2 at Venue */}
                            {team2VenueStats ? (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${getTeamColor(team2)}10` }}>
                                <div className="text-center mb-2">
                                  <h3 className="font-bold text-sm" style={{ color: getTeamColor(team2) }}>
                                    {team2.split(' ').slice(-1)[0]}
                                  </h3>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="font-medium">Matches: </span>
                                    {team2VenueStats.played || 0}
                                  </p>
                                  <p>
                                    <span className="font-medium">Wins: </span>
                                    {team2VenueStats.wins || 0}
                                  </p>
                                  <p>
                                    <span className="font-medium">Win rate: </span>
                                    {((team2VenueStats.win_rate || 0) * 100).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-gray-100">
                                <div className="text-center">
                                  <p className="text-sm text-gray-500">No venue data available for {team2}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Toss Analysis Section */}
                    <div>
                      <button 
                        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenTossAnalysis(!openTossAnalysis)}
                      >
                        <div className="flex items-center font-bold text-blue-800">
                          <Trophy className="mr-2" size={18} />
                          TOSS ANALYSIS
                        </div>
                        {openTossAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {openTossAnalysis && team1Stats && team2Stats && (
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Team 1 Toss */}
                            {team1Stats.toss_stats && (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${getTeamColor(team1)}10` }}>
                                <div className="text-center mb-2">
                                  <h3 className="font-bold text-sm" style={{ color: getTeamColor(team1) }}>
                                    {team1} Toss Stats
                                  </h3>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="font-medium">Toss wins: </span>
                                    {team1Stats.toss_stats.toss_wins} / {team1Stats.toss_stats.toss_total} 
                                    ({(team1Stats.toss_stats.toss_win_rate * 100).toFixed(1)}%)
                                  </p>
                                  <p>
                                    <span className="font-medium">Wins after winning toss: </span>
                                    {team1Stats.toss_stats.wins_after_toss_win || 0}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Team 2 Toss */}
                            {team2Stats.toss_stats && (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${getTeamColor(team2)}10` }}>
                                <div className="text-center mb-2">
                                  <h3 className="font-bold text-sm" style={{ color: getTeamColor(team2) }}>
                                    {team2} Toss Stats
                                  </h3>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="font-medium">Toss wins: </span>
                                    {team2Stats.toss_stats.toss_wins} / {team2Stats.toss_stats.toss_total} 
                                    ({(team2Stats.toss_stats.toss_win_rate * 100).toFixed(1)}%)
                                  </p>
                                  <p>
                                    <span className="font-medium">Wins after winning toss: </span>
                                    {team2Stats.toss_stats.wins_after_toss_win || 0}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to format factor names for display
const formatFactorName = (factorName) => {
  if (!factorName) return "";
  
  // Replace underscores with spaces
  let formatted = factorName.replace(/_/g, ' ');
  
  // Capitalize first letter of each word
  formatted = formatted.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return formatted;
};

// Helper function to format factor values
const formatFactorValue = (value) => {
  if (typeof value === 'number') {
    // Check if it's a percentage value (between 0 and 1)
    if (value >= 0 && value <= 1) {
      return `${(value * 100).toFixed(1)}%`;
    }
    // For other numbers, just format to 2 decimal places
    return value.toFixed(2);
  }
  return value;
};

export default MatchSimulator;