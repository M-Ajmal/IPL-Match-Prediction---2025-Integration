
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { 
  BarChart, 
  Home, 
  Map, 
  Settings, 
  Users, 
  ChartPie, 
  UserRound, 
  TableProperties, 
  User 
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { title: "Dashboard", path: "/", icon: Home },
    { title: "Team Analysis", path: "/team-analysis", icon: Users },
    { title: "Match Prediction", path: "/match-prediction", icon: ChartPie },
    { title: "Team Player Viewer", path: "/team-players", icon: UserRound },
    { title: "IPL Stats Dashboard", path: "/stats-dashboard", icon: TableProperties },
    { title: "About Me", path: "/about-me", icon: User },
  ];

  return (
    <div className="hidden lg:block border-r h-[calc(100vh-4rem)] w-64 sticky top-16">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-link flex items-center gap-3",
                  location.pathname === item.path
                    ? "nav-link-active"
                    : "nav-link-inactive"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
