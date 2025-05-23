import React, { useState } from "react";
import MatchSimulator from "@/components/MatchSimulator";
import LiveMatchPredictor from "@/components/LiveMatchPredictor";
import { Button } from "@/components/ui/button"; // or use Tailwind buttons
import { motion, AnimatePresence } from "framer-motion";

const MatchPrediction = () => {
  const [activeTab, setActiveTab] = useState<"simulator" | "live">("simulator");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Match Prediction Simulator</h1>
        <p className="text-muted-foreground">
          Simulate IPL 2025 matches with our machine learning model
        </p>
      </div>

      {/* Tab Switcher with Animation */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex space-x-4 justify-center">
            <Button
              variant={activeTab === "simulator" ? "default" : "outline"}
              onClick={() => setActiveTab("simulator")}
            >
              Match Simulator
            </Button>
            <Button
              variant={activeTab === "live" ? "default" : "outline"}
              onClick={() => setActiveTab("live")}
            >
              Live Match Predictor
            </Button>
          </div>

          {/* Animated View Swap */}
          <div className="mt-6 min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === "simulator" ? (
                <motion.div
                  key="simulator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <MatchSimulator />
                </motion.div>
              ) : (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <LiveMatchPredictor />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Original ML Model & Metrics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h3 className="text-lg font-semibold mb-3">About Our ML Model</h3>
          <p className="text-gray-700 mb-4">
            Our match prediction model utilizes machine learning algorithms trained on 
            comprehensive IPL data from 2008-2024, including team performance metrics, 
            player statistics, venue characteristics, and historical matchups.
          </p>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Model Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Historical head-to-head records</li>
              <li>Team form in recent matches</li>
              <li>Venue-specific performance metrics</li>
              <li>Toss decision impact analysis</li>
              <li>Batting/bowling strength indices</li>
              <li>Player availability and performance</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
          <div className="space-y-4">
            {[
              { label: "Accuracy", value: 76 },
              { label: "Precision", value: 72 },
              { label: "Recall", value: 69 },
              { label: "F1 Score", value: 70 },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className="text-sm font-bold">{metric.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              Performance metrics based on backtesting against IPL 2021-2024 seasons, with 
              5-fold cross-validation to ensure model stability and reliability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchPrediction;
