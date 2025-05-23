import React from 'react';

export default function Portfolio() {
  return (
    <div className="flex h-screen bg-gray-50 p-4">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Column - Profile */}
        <div className="md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
          <div className="flex justify-center mb-6">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 p-1 shadow-lg">
              <div className="h-full w-full rounded-full bg-gray-800 flex items-center justify-center text-white text-3xl font-bold">
                AM
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-1">Ajmal Mansoor</h1>
          <p className="text-gray-300 text-center mb-8 text-sm">Data Science Undergraduate</p>
          
          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-40 p-4 rounded-xl">
              <h3 className="text-teal-300 text-sm font-medium uppercase tracking-wider mb-2">Education</h3>
              <p className="font-medium">NSBM Green University</p>
              <p className="text-sm text-gray-300">BSc in Data Science</p>
              <p className="text-sm text-gray-300">3rd Year, 1st Semester</p>
            </div>
            
            <div className="bg-gray-800 bg-opacity-40 p-4 rounded-xl">
              <h3 className="text-teal-300 text-sm font-medium uppercase tracking-wider mb-2">Location</h3>
              <p>Sri Lanka</p>
            </div>
            
            <div className="mt-auto pt-4">
              <p className="italic text-center text-gray-300 text-sm border-t border-gray-700 pt-4">
                "Turning data into actionable insights"
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Skills & Details */}
        <div className="md:w-2/3 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">About Me</h2>
            <p className="text-gray-600">
              Data Science student seeking an internship opportunity to apply my analytical skills and technical knowledge in a professional environment.
            </p>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-4">Technical Expertise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Data Science</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">Python</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">R</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">SQL</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">Statistical Analysis</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Visualization</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100">Tableau</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100">Power BI</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100">Matplotlib</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100">Seaborn</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10v8H5V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Development</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100">React JS</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100">HTML/CSS</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100">Node.js</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100">MongoDB</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Big Data Tools</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-100">AWS</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-100">PySpark</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-100">Hadoop</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-100">Jupyter</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Project Experience</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Data visualization dashboards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Predictive modeling for business insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Academic research using statistical methods</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Soft Skills</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  <span>Analytical thinking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  <span>Problem-solving approach</span>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  <span>Effective communication</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}