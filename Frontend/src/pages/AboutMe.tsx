import React, { useState } from 'react';
import { Code, ChevronRight, Award, Terminal, PieChart, Users, BookOpen } from 'lucide-react';

function GroupPortfolio() {
  const [activeTab, setActiveTab] = useState('project');
  
  const groupMembers = [
    { id: 26775, name: "W G M M Ajmal Mansoor", avatar: "AM" },
    { id: 30452, name: "K B A Pasandul", avatar: "AP" },
    { id: 27818, name: "H A B S Mahanama", avatar: "SM" },
    { id: 29793, name: "S S Chandrasinghe ", avatar: "SC" },
    { id: 30486, name: "R V Pathirana", avatar: "VK" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white p-8">
          <div className="text-center animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">IPL Cricket Match Prediction System</h1>
            <p className="text-blue-200 mb-1">Data Visualization & Analysis Project</p>
            <p className="text-blue-100 text-sm">NSBM Green University | Year 3, Semester 1</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button 
              onClick={() => setActiveTab('project')} 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${activeTab === 'project' ? 'bg-white text-blue-800' : 'bg-blue-800 text-white hover:bg-blue-700'}`}
            >
              <PieChart size={18} />
              <span>Project</span>
            </button>
            <button 
              onClick={() => setActiveTab('team')} 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${activeTab === 'team' ? 'bg-white text-blue-800' : 'bg-blue-800 text-white hover:bg-blue-700'}`}
            >
              <Users size={18} />
              <span>Team</span>
            </button>
            <button 
              onClick={() => setActiveTab('code')} 
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${activeTab === 'code' ? 'bg-white text-blue-800' : 'bg-blue-800 text-white hover:bg-blue-700'}`}
            >
              <Code size={18} />
              <span>Model Code</span>
            </button>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          {activeTab === 'project' && (
            <div className="animate-slideUp">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 border border-blue-100">
                <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                  <Award className="mr-2" size={24} />
                  Project Overview
                </h2>
                <p className="text-gray-700 mb-4">
                  Our team developed an advanced IPL Cricket Match Prediction System using machine learning techniques to predict match outcomes with high accuracy. The project combines data analysis, visualization, and predictive modeling to create a powerful tool for cricket enthusiasts and analysts.
                </p>
                <div className="flex items-center text-blue-700">
                  <Terminal size={18} className="mr-2" />
                  <span className="font-semibold">Model Accuracy: 99.83% with RandomForest</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <PieChart size={20} className="mr-2 text-blue-600" />
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ChevronRight size={18} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Advanced data preprocessing of IPL match statistics</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight size={18} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Interactive data visualizations of match trends and player performance</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight size={18} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Ensemble machine learning model with RandomForest and XGBoost</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight size={18} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>User-friendly interface for making predictions on upcoming matches</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <BookOpen size={20} className="mr-2 text-blue-600" />
                    Academic Value
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This project demonstrates practical applications of data science concepts learned during our third year at NSBM Green University. Special thanks to Lakni miss for her guidance and support in teaching essential data visualization concepts.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">Data Preprocessing</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">Visualization</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">Machine Learning</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">Ensemble Methods</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'team' && (
            <div className="animate-slideUp">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Users className="mr-2" size={24} />
                Team Members
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupMembers.map((member, index) => (
                  <div key={member.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-24 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-r ${
                        index === 0 ? 'from-blue-600 to-indigo-700' : 
                        index === 1 ? 'from-purple-600 to-pink-700' :
                        index === 2 ? 'from-teal-600 to-green-700' :
                        index === 3 ? 'from-amber-600 to-orange-700' :
                        'from-rose-600 to-red-700'
                      }`}>
                        <div className={`absolute w-full h-full ${
                          index === 0 ? 'animate-pulse' : 
                          index === 1 ? 'animate-bounce' :
                          index === 2 ? 'animate-ping opacity-75' :
                          index === 3 ? 'animate-spin-slow' :
                          'animate-wave'
                        }`}>
                          {[...Array(6)].map((_, i) => (
                            <div 
                              key={i}
                              className="absolute rounded-full bg-white opacity-10"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: `${Math.random() * 50 + 10}px`,
                                height: `${Math.random() * 50 + 10}px`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 right-0 m-4">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-lg ${
                          index === 0 ? 'bg-blue-700' : 
                          index === 1 ? 'bg-purple-700' :
                          index === 2 ? 'bg-teal-700' :
                          index === 3 ? 'bg-amber-700' :
                          'bg-rose-700'
                        }`}>
                          {member.avatar}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800">{member.name}</h3>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">ID: {member.id}</span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Contributed to data preprocessing, model training, and visualization components of the IPL Cricket Prediction System.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'code' && (
            <div className="animate-slideUp">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Code className="mr-2" size={24} />
                Model Code
              </h2>
              
              <div className="bg-gray-900 text-gray-200 rounded-xl p-5 overflow-auto mb-6">
                <pre className="text-sm">
                  <code>
{`import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

def train_model(original_data_path, data_2025_path):
    print("Starting model training...")

    # Load original(2008-2024) and 2025 data
    original_data = pd.read_csv(original_data_path)
    data_2025 = pd.read_csv(data_2025_path)

    # Combine both datasets
    combined_data = pd.concat([original_data, data_2025], ignore_index=True)
    combined_data.to_csv('processed/combined_training_data.csv', index=False)
    print("Combined training data saved.")

    # Split features and target
    X = combined_data.iloc[:, :-1]
    y = combined_data.iloc[:, -1]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    # Train model
    model = RandomForestClassifier()
    model.fit(X_train, y_train)

    # Evaluate model
    accuracy = accuracy_score(y_test, model.predict(X_test))

    # Save trained model
    joblib.dump(model, 'processed/ipl_predictor_model.joblib')

    return model, accuracy

original_data = 'processed/original_data_preprocessed.csv'
data_2025 = 'processed/ipl_2025_raw.csv'
train_model(original_data, data_2025)
`}
                  </code>
                </pre>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">Model Performance</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                  <p className="font-mono text-sm">
                    Original data shape: (222789, 10)<br />
                    2025 data shape: (271, 10)<br />
                    Combined data shape: (223060, 10)
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-blue-800 mb-2">RandomForest Model</h4>
                    <p className="text-sm text-gray-600 mb-2">Accuracy: <span className="font-bold text-green-600">0.9983</span></p>
                    <div className="text-xs font-mono overflow-x-auto">
                      precision: 1.00<br />
                      recall: 1.00<br />
                      f1-score: 1.00
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-blue-800 mb-2">XGBoost Model</h4>
                    <p className="text-sm text-gray-600 mb-2">Accuracy: <span className="font-bold text-green-600">0.9307</span></p>
                    <div className="text-xs font-mono overflow-x-auto">
                      Best model: RandomForest with accuracy 0.9983
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
          <p className="text-gray-600 text-sm">
            NSBM Green University | Year 3, Semester 1 | Data Visualization Project
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Special thanks to Lakni Miss for guidance and support
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = `
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes wave {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  .animate-wave {
    animation: wave 2s ease-in-out infinite;
  }
  
  .animate-fadeIn {
    animation: fadeIn 1s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.5s ease-out;
  }
`;

const StyleSheet = () => {
  return <style>{styles}</style>
};

const StyledGroupPortfolio = () => (
  <>
    <StyleSheet />
    <GroupPortfolio />
  </>
);

export default StyledGroupPortfolio;