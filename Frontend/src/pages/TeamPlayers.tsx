import { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "http://localhost:5000";

const TeamPlayers = () => {
  const { teamId } = useParams();
  const [selectedTeam, setSelectedTeam] = useState(teamId || "mi");
  const [roleFilter, setRoleFilter] = useState("All");
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (url, setState, setLoading) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setState(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(`${BASE_URL}/api/player`, setTeams, setLoadingTeams);
    fetchData(`${BASE_URL}/api/player/roles`, setRoles, setLoadingRoles);
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchData(`${BASE_URL}/api/player/${selectedTeam}`, setTeamInfo, () => {});
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedTeam) {
      setLoadingPlayers(true);
      fetchData(
        `${BASE_URL}/api/player/${selectedTeam}/players?role=${roleFilter}`,
        setPlayers,
        setLoadingPlayers
      );
    }
  }, [selectedTeam, roleFilter]);

  const handleTeamChange = (value) => {
    setSelectedTeam(value);
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
  };

  const getStatDisplay = (player) => {
    return `Role: ${player.role || "N/A"}`;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Batsman":
        return "bg-blue-500";
      case "Bowler":
        return "bg-indigo-600";
      case "All-Rounder":
        return "bg-cyan-600";
      case "Wicketkeeper":
        return "bg-blue-700";
      default:
        return "bg-gray-500";
    }
  };

  const isBrightColor = (hex) => {
    if (!hex || hex.length !== 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Team Player Viewer</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-2">Select Team</label>
            <Select value={selectedTeam} onValueChange={handleTeamChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-2">Filter by Role</label>
            <Select value={roleFilter} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {teamInfo && (
          <div
            className="p-4 rounded-lg shadow-md mb-6"
            style={{
              backgroundColor:
                teamInfo.name === "Chennai Super Kings" ? "#FFCC00" : teamInfo.color || "#0080FF",
            }}
          >
            <h2
              className={`text-2xl font-bold ${
                teamInfo.name === "Chennai Super Kings" ? "text-white" : "text-white"
              }`}
            >
              {teamInfo.name} Squad
            </h2>
            <p
              className={`${
                teamInfo.name === "Chennai Super Kings" ? "text-white" : "text-blue-100"
              }`}
            >
              {players.length} Player{players.length !== 1 ? "s" : ""}{" "}
              {roleFilter !== "All" ? `(${roleFilter})` : ""}
            </p>
          </div>
        )}
      </div>

      {loadingPlayers ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player, index) => {
            const baseColor = teamInfo?.color || "#0080FF";
            const isBright = isBrightColor(baseColor);
            const textColor = isBright ? "text-black" : "text-white";
            const cardBgColor = isBright ? `${baseColor}DD` : `${baseColor}F2`;

            return (
              <Card
              key={index}
              className="overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
              style={{
                backgroundColor: cardBgColor,
                border: `2px solid ${baseColor}`,         // 🔥 team-colored border frame
                boxShadow: `0 4px 20px ${baseColor}66`,   // 💡 optional glow effect
              }}
            >
            
                <CardContent className="p-0">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 rounded-t-2xl"></div>
                    <div className="flex justify-center pt-6 pb-2 relative z-20">
                      <a
                        href={player["Detail Page URL"]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="relative group-hover:scale-105 transition-transform duration-300">
                          <div
                            className="absolute inset-0 rounded-full border-4 animate-pulse blur-sm"
                            style={{ borderColor: baseColor }}
                          ></div>
                          <Avatar
                            className="h-28 w-28 border-4 border-white ring-offset-2"
                            style={{ boxShadow: `0 0 0 4px ${baseColor}` }}
                          >
                            <AvatarImage
                              src={player["Image URL"]}
                              alt={player["Player Name"]}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                              {player["Player Name"]
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </a>
                    </div>
                    <div className={`p-4 text-center relative z-20`}>
                    <h3
  className={`text-lg font-bold ${
    teamInfo?.name === "Chennai Super Kings" ? "text-white" : textColor
  }`}
>
  {player["Player Name"]}
</h3>

                      <Badge
                        className={`mt-1 text-xs px-3 py-1 rounded-full ${textColor}`}
                        style={{ backgroundColor: baseColor }}
                      >
                        {player.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-white text-center">
                    <p className="text-sm text-gray-600 font-medium">
                      {getStatDisplay(player)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamPlayers;
