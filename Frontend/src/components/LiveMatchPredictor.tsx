import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronUp, Timer, Target, Activity, TrendingUp } from "lucide-react";

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

const LiveMatchPredictor = () => {
  const [battingTeam, setBattingTeam] = useState("");
  const [bowlingTeam, setBowlingTeam] = useState("");
  const [venue, setVenue] = useState("");
  const [target, setTarget] = useState("");
  const [currentScore, setCurrentScore] = useState("");
  const [ballsPlayed, setBallsPlayed] = useState("");
  const [wicketsFallen, setWicketsFallen] = useState("");
  
  const [simulated, setSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [venueOptions, setVenueOptions] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);
  
  // Accordion state
  const [openMatchDetails, setOpenMatchDetails] = useState(true);
  const [openRunRateAnalysis, setOpenRunRateAnalysis] = useState(false);
  const [openWinProbability, setOpenWinProbability] = useState(false);
  
  // API base URL - change this to match your server configuration
  const API_BASE_URL = 'http://localhost:5000';
  
  // Fetch venues when component mounts
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/venues`)
      .then(response => response.json())
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

  // Reset team2 when team1 changes
  useEffect(() => {
    setBowlingTeam("");
  }, [battingTeam]);

  const handleSimulate = () => {
    setLoading(true);
  
    const requestData = {
      batting_team: battingTeam,
      bowling_team: bowlingTeam,
      venue,
      target: parseInt(target),
      current_score: parseInt(currentScore),
      balls_played: parseInt(ballsPlayed),
      wickets_fallen: parseInt(wicketsFallen),
    };
  
    console.log("Sending request to /api/predict_match_ongoing:", requestData);
  
    fetch(`${API_BASE_URL}/api/predict_match_ongoing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setPredictionResult(data);
        setSimulated(true);
        setLoading(false);
        setOpenMatchDetails(true);
      })
      .catch((error) => {
        console.error("❌ Error predicting match outcome:", error.message);
        alert(`Prediction failed: ${error.message}`);
        setLoading(false);
      });
  };
  
  const getTeamColor = (teamId) => {
    const team = teamOptions.find(t => t.value === teamId);
    return team ? team.color : "#666666";
  };

  const calculateRequiredRunRate = () => {
    if (!target || !currentScore || !ballsPlayed) return null;
    
    const remainingRuns = parseInt(target) - parseInt(currentScore);
    const remainingBalls = 120 - parseInt(ballsPlayed);
    
    if (remainingBalls <= 0) return null;
    
    return (remainingRuns / (remainingBalls / 6)).toFixed(2);
  };  

  const getRunRateDifferential = () => {
    const requiredRR = calculateRequiredRunRate();
    const currentRR = calculateCurrentRunRate();
    
    if (requiredRR === null) return null;
    
    return (parseFloat(currentRR) - parseFloat(requiredRR)).toFixed(2);
  };
  
  const calculateCurrentRunRate = () => {
    if (!currentScore || !ballsPlayed || parseInt(ballsPlayed) === 0) return "0.00";
    return ((parseInt(currentScore) / (parseInt(ballsPlayed) / 6))).toFixed(2);
  };

  const getOversPlayed = () => {
    if (!ballsPlayed) return "0.0";
    const overs = Math.floor(parseInt(ballsPlayed) / 6);
    const balls = parseInt(ballsPlayed) % 6;
    return `${overs}.${balls}`;
  };

  const getRemainingOvers = () => {
    if (!ballsPlayed) return "20.0";
    const totalBalls = 120;
    const remainingBalls = totalBalls - parseInt(ballsPlayed);
    const overs = Math.floor(remainingBalls / 6);
    const balls = remainingBalls % 6;
    return `${overs}.${balls}`;
  };

  // Helper to safely parse the required run rate for the width calculation
  const getRequiredRunRateForWidth = () => {
    const rrr = calculateRequiredRunRate();
    return rrr === null ? 0 : parseFloat(rrr);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
      <Card className="w-full shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardTitle className="text-2xl font-bold flex items-center justify-center text-white">
            <Timer className="mr-3" size={24} />
            IPL LIVE MATCH PREDICTOR
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Inputs */}
            <div className="space-y-4 bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg text-center border-b pb-2 text-blue-800">MATCH DETAILS</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="battingTeam" className="text-sm font-medium">Batting Team</Label>
                  <Select value={battingTeam} onValueChange={setBattingTeam}>
                    <SelectTrigger id="battingTeam" className="bg-white">
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
                  <Label htmlFor="bowlingTeam" className="text-sm font-medium">Bowling Team</Label>
                  <Select value={bowlingTeam} onValueChange={setBowlingTeam}>
                    <SelectTrigger id="bowlingTeam" className="bg-white">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions
                        .filter(team => team.value !== battingTeam)
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
                <Label htmlFor="venue" className="text-sm font-medium">Venue</Label>
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
                  <Label htmlFor="target" className="text-sm font-medium flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Target
                  </Label>
                  <Input 
                    id="target"
                    type="number" 
                    value={target} 
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Target score"
                    min="0"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentScore" className="text-sm font-medium">Current Score</Label>
                  <Input 
                    id="currentScore"
                    type="number" 
                    value={currentScore} 
                    onChange={(e) => setCurrentScore(e.target.value)}
                    placeholder="Current score"
                    min="0"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ballsPlayed" className="text-sm font-medium">Balls Played</Label>
                  <Input 
                    id="ballsPlayed"
                    type="number" 
                    value={ballsPlayed} 
                    onChange={(e) => setBallsPlayed(e.target.value)}
                    placeholder="Balls played"
                    min="0"
                    max="120"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wicketsFallen" className="text-sm font-medium">Wickets Fallen</Label>
                  <Input 
                    id="wicketsFallen"
                    type="number" 
                    value={wicketsFallen} 
                    onChange={(e) => setWicketsFallen(e.target.value)}
                    placeholder="Wickets fallen"
                    min="0"
                    max="10"
                    className="bg-white"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSimulate} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 transition-all duration-300"
                disabled={!battingTeam || !bowlingTeam || !venue || !target || !currentScore || !ballsPlayed || !wicketsFallen || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calculating Outcome...
                  </>
                ) : (
                  <>PREDICT MATCH OUTCOME</>
                )}
              </Button>
              
              {/* Prediction Summary */}
              {predictionResult && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center border-b border-blue-200 pb-2 mb-3">
                    <h3 className="font-bold text-lg text-blue-800">
                      MATCH PREDICTION
                    </h3>
                  </div>
                  
                  <div className="space-y-4 mt-3">
                    {/* Team Matchup */}
                    <div className="flex items-center justify-center text-lg font-bold gap-3">
                      <div className="text-right" style={{ color: getTeamColor(battingTeam) }}>
                        {battingTeam.split(' ').slice(-1)[0]}
                      </div>
                      <div className="text-center text-gray-600">vs</div>
                      <div className="text-left" style={{ color: getTeamColor(bowlingTeam) }}>
                        {bowlingTeam.split(' ').slice(-1)[0]}
                      </div>
                    </div>
                    
                    {/* Batting Team Win Probability */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{battingTeam}</span>
                        <span className="font-bold text-sm">{(predictionResult.batting_team_win_probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full" 
                          style={{
                            width: `${(predictionResult.batting_team_win_probability * 100).toFixed(1)}%`,
                            backgroundColor: getTeamColor(battingTeam)
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Bowling Team Win Probability */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{bowlingTeam}</span>
                        <span className="font-bold text-sm">{(predictionResult.bowling_team_win_probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full" 
                          style={{
                            width: `${(predictionResult.bowling_team_win_probability * 100).toFixed(1)}%`,
                            backgroundColor: getTeamColor(bowlingTeam)
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Winner Prediction */}
                    <div className="text-center mt-2 font-bold">
                      {predictionResult.batting_team_win_probability > predictionResult.bowling_team_win_probability ? (
                        <div className="text-lg" style={{ color: getTeamColor(battingTeam) }}>
                          {battingTeam} likely to win
                        </div>
                      ) : (
                        <div className="text-lg" style={{ color: getTeamColor(bowlingTeam) }}>
                          {bowlingTeam} likely to win
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
                    <Timer className="w-16 h-16 text-blue-400" />
                  </div>
                  <p className="text-center text-lg font-medium mt-4">Fill in the match details and click Predict to see the live match analysis</p>
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
                        {Object.entries(predictionResult.key_factors).map(([factor, value], idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded border">
                            <p className="text-sm">
                              <span className="font-medium block text-blue-800">{formatFactorName(factor)}</span>
                              <span className="block mt-1">
                                {typeof value === 'object' 
                                  ? JSON.stringify(value) 
                                  : typeof value === 'number' 
                                    ? formatFactorValue(value)
                                    : value}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accordion Sections */}
                  <div className="divide-y">
                    {/* Match Details Section */}
                    <div className="border-b">
                      <button 
                        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenMatchDetails(!openMatchDetails)}
                      >
                        <div className="flex items-center font-bold text-blue-800">
                          <Activity className="mr-2" size={18} />
                          MATCH DETAILS
                        </div>
                        {openMatchDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {openMatchDetails && (
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Match Situation */}
                            <div className="p-3 rounded-lg bg-blue-50">
                              <div className="text-center mb-2 pb-1 border-b border-blue-100">
                                <h3 className="font-bold text-md text-blue-800">
                                  MATCH SITUATION
                                </h3>
                              </div>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Target: </span>
                                  {target}
                                </p>
                                <p>
                                  <span className="font-medium">Current Score: </span>
                                  {currentScore}/{wicketsFallen}
                                </p>
                                <p>
                                  <span className="font-medium">Overs: </span>
                                  {getOversPlayed()}/{20}
                                </p>
                                <p>
                                  <span className="font-medium">Remaining: </span>
                                  {getRemainingOvers()} overs
                                </p>
                                <p>
                                  <span className="font-medium">Venue: </span>
                                  {venue}
                                </p>
                              </div>
                            </div>

                            {/* Required Stats */}
                            <div className="p-3 rounded-lg bg-indigo-50">
                              <div className="text-center mb-2 pb-1 border-b border-indigo-100">
                                <h3 className="font-bold text-md text-indigo-800">
                                  CHASE ANALYSIS
                                </h3>
                              </div>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Runs needed: </span>
                                  {target && currentScore ? (parseInt(target) - parseInt(currentScore)) : "-"}
                                </p>
                                <p>
                                  <span className="font-medium">Current RR: </span>
                                  {calculateCurrentRunRate()}
                                </p>
                                <p>
                                  <span className="font-medium">Required RR: </span>
                                  {calculateRequiredRunRate() || "-"}
                                </p>
                                <p>
                                  <span className="font-medium">Win Probability: </span>
                                  {predictionResult ? `${(predictionResult.batting_team_win_probability * 100).toFixed(1)}%` : "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Run Rate Analysis Section */}
                    <div className="border-b">
                      <button 
                        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenRunRateAnalysis(!openRunRateAnalysis)}
                      >
                        <div className="flex items-center font-bold text-blue-800">
                          <TrendingUp className="mr-2" size={18} />
                          RUN RATE ANALYSIS
                        </div>
                        {openRunRateAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {openRunRateAnalysis && (
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-4">
                            {/* Run Rate Comparison */}
                            <div className="p-3 rounded-lg bg-gray-50">
                              <div className="text-center mb-3">
                                <h4 className="font-semibold text-gray-700">Run Rate Analysis</h4>
                              </div>
                              
                              <div className="space-y-4">
                                {/* Current Run Rate */}
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium text-sm">Current Run Rate</span>
                                    <span className="font-bold text-sm">{calculateCurrentRunRate()}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                      className="h-3 rounded-full bg-blue-500" 
                                      style={{
                                        width: `${Math.min(100, (parseFloat(calculateCurrentRunRate()) / 12) * 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Required Run Rate - FIXED HERE */}
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium text-sm">Required Run Rate</span>
                                    <span className="font-bold text-sm">{calculateRequiredRunRate() || "-"}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                      className="h-3 rounded-full bg-indigo-500" 
                                      style={{
                                        width: `${Math.min(100, (getRequiredRunRateForWidth() / 12) * 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Run Rate Differential */}
                                {calculateRequiredRunRate() && (
                                  <div className="mt-4 p-3 bg-white rounded-lg border">
                                    <div className="text-center">
                                      <span className="font-medium">Run Rate Differential: </span>
                                      <span className={
                                        parseFloat(calculateCurrentRunRate()) >= parseFloat(calculateRequiredRunRate())
                                          ? "text-green-600 font-bold"
                                          : "text-red-600 font-bold"
                                      }>
                                        {getRunRateDifferential()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Win Probability Section */}
                    <div>
                      <button 
                        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenWinProbability(!openWinProbability)}
                      >
                        <div className="flex items-center font-bold text-blue-800">
                          <Activity className="mr-2" size={18} />
                          WIN PROBABILITY ANALYSIS
                        </div>
                        {openWinProbability ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {openWinProbability && predictionResult && (
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-4">
                            {/* Win Probability Chart */}
                            <div className="p-3 rounded-lg bg-gray-50">
                              <div className="text-center mb-3">
                                <h4 className="font-semibold text-gray-700">Win Probability</h4>
                              </div>
                              
                              {/* Batting Team */}
                              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: `${getTeamColor(battingTeam)}10` }}>
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium" style={{ color: getTeamColor(battingTeam) }}>{battingTeam}</span>
                                  <span className="font-bold">{(predictionResult.batting_team_win_probability * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-5">
                                  <div 
                                    className="h-5 rounded-full flex items-center justify-center text-xs text-white font-bold" 
                                    style={{
                                      width: `${(predictionResult.batting_team_win_probability * 100).toFixed(1)}%`,
                                      backgroundColor: getTeamColor(battingTeam)
                                    }}
                                  >
                                    {(predictionResult.batting_team_win_probability * 100) > 10 ? `${(predictionResult.batting_team_win_probability * 100).toFixed(1)}%` : ''}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bowling Team */}
                              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: `${getTeamColor(bowlingTeam)}10` }}>
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium" style={{ color: getTeamColor(bowlingTeam) }}>{bowlingTeam}</span>
                                  <span className="font-bold">{(predictionResult.bowling_team_win_probability * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-5">
                                  <div 
                                    className="h-5 rounded-full flex items-center justify-center text-xs text-white font-bold" 
                                    style={{
                                      width: `${(predictionResult.bowling_team_win_probability * 100).toFixed(1)}%`,
                                      backgroundColor: getTeamColor(bowlingTeam)
                                    }}
                                  >
                                    {(predictionResult.bowling_team_win_probability * 100) > 10 ? `${(predictionResult.bowling_team_win_probability * 100).toFixed(1)}%` : ''}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Key Win Factors */}
                              {predictionResult.win_factors && (
                                <div className="mt-4 p-3 bg-white rounded-lg border">
                                  <h5 className="font-medium text-center mb-2">Key Win Factors</h5>
                                  <ul className="text-sm space-y-1 list-disc pl-5">
                                    {Object.entries(predictionResult.win_factors).map(([factor, value], idx) => (
                                      <li key={idx}>
                                        <span className="font-medium">{formatFactorName(factor)}: </span>
                                        {typeof value === 'number' ? 
                                          value.toFixed(2) : 
                                          value.toString()}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            {/* Match Recommendation */}
                            {predictionResult.recommendation && (
                              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                                <h5 className="font-medium text-center mb-2 text-blue-800">Match Insight</h5>
                                <p className="text-sm text-center">
                                  {predictionResult.recommendation}
                                </p>
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

// Helper function to format factor names
const formatFactorName = (factor) => {
  return factor
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to format factor values
const formatFactorValue = (value) => {
  if (typeof value === 'number') {
    // Format percentages and regular numbers differently
    if (value > 0 && value < 1) {
      return `${(value * 100).toFixed(1)}%`;
    } else {
      return value.toFixed(2);
    }
  }
  return value.toString();
};

export default LiveMatchPredictor;