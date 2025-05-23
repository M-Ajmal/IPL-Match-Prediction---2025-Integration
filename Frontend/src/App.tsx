
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TeamAnalysis from "./pages/TeamAnalysis";
import MatchPrediction from "./pages/MatchPrediction";
import TeamPlayers from "./pages/TeamPlayers";
import StatsDashboard from "./pages/StatsDashboard";
import AboutMe from "./pages/AboutMe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/team-analysis" element={
            <Layout>
              <TeamAnalysis />
            </Layout>
          } />
          <Route path="/team-analysis/:teamId" element={
            <Layout>
              <TeamAnalysis />
            </Layout>
          } />
          <Route path="/match-prediction" element={
            <Layout>
              <MatchPrediction />
            </Layout>
          } />
          <Route path="/team-players" element={
            <Layout>
              <TeamPlayers />
            </Layout>
          } />
          <Route path="/team-players/:teamId" element={
            <Layout>
              <TeamPlayers />
            </Layout>
          } />
          <Route path="/stats-dashboard" element={
            <Layout>
              <StatsDashboard />
            </Layout>
          } />
          <Route path="/about-me" element={
            <Layout>
              <AboutMe />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
