import React, { useState, useCallback } from 'react';
import { analyzeSkinImage, fileToBase64 } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import { ImageAnalysisOverlay } from './components/ImageAnalysisOverlay';
import { RadialScore } from './components/RadialScore';
import { LesionList } from './components/LesionList';

const DEMO_IMAGE = "https://picsum.photos/800/800?random=1";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeLesionId, setActiveLesionId] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setAppState(AppState.IDLE);
      setAnalysis(null);
      setError(null);
    }
  };

  const startAnalysis = async () => {
    if (!imageFile) return;

    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const base64 = await fileToBase64(imageFile);
      const result = await analyzeSkinImage(base64);
      setAnalysis(result);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setAppState(AppState.ERROR);
    }
  };

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setAppState(AppState.IDLE);
      setAnalysis(null);
      setError(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              DermaScan AI
            </h1>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Image Area */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div 
              className={`
                relative w-full aspect-[4/3] lg:aspect-auto lg:h-[calc(100vh-12rem)] 
                bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all
                ${!imageUrl ? 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30' : 'border-transparent shadow-xl overflow-hidden bg-slate-900'}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {!imageUrl ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">Upload Face Photo</h3>
                  <p className="text-slate-500 mb-6 text-sm">Drag & drop or click to browse</p>
                  <label className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors shadow-sm">
                    Select File
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                  </label>
                </div>
              ) : (
                <>
                  {/* Analysis Overlay Component */}
                  <ImageAnalysisOverlay 
                    imageUrl={imageUrl} 
                    lesions={analysis?.lesions || []}
                    activeLesionId={activeLesionId}
                    onLesionSelect={setActiveLesionId}
                  />

                  {/* Scanning Effect Overlay */}
                  {appState === AppState.ANALYZING && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-20">
                      <div className="absolute inset-0 bg-blue-500/10" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-scan" />
                    </div>
                  )}

                  {/* Reset Button (only visible on hover or if idle) */}
                  <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                     <label className="bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm cursor-pointer backdrop-blur-sm">
                        Change Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                     </label>
                  </div>
                </>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${appState === AppState.SUCCESS ? 'bg-green-500' : appState === AppState.ERROR ? 'bg-red-500' : 'bg-slate-300'}`} />
                  <span className="text-sm font-medium text-slate-600">
                    {appState === AppState.IDLE && "Ready for analysis"}
                    {appState === AppState.ANALYZING && "Scanning facial features..."}
                    {appState === AppState.SUCCESS && "Analysis complete"}
                    {appState === AppState.ERROR && "Analysis failed"}
                  </span>
               </div>
               
               {appState !== AppState.ANALYZING && appState !== AppState.SUCCESS && (
                 <button 
                  onClick={startAnalysis}
                  disabled={!imageUrl}
                  className={`
                    px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all
                    ${imageUrl 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                  `}
                 >
                   Analyze Skin
                 </button>
               )}
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Results Area */}
          <div className="lg:col-span-5 h-[calc(100vh-8rem)] flex flex-col gap-6">
            {!analysis ? (
              <div className="h-full bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No Analysis Yet</h3>
                <p className="text-slate-500 max-w-xs mt-2">Upload a photo and click "Analyze" to see detailed dermatological insights.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full gap-4">
                {/* Score Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-800">Skin Condition</h2>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {analysis.lesions.length} Lesions Detected
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 flex-shrink-0">
                      <RadialScore score={analysis.overallScore} />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-blue-500 pl-3">
                        {analysis.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Findings List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex-grow overflow-hidden flex flex-col">
                  <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Detailed Findings
                  </h3>
                  <LesionList 
                    lesions={analysis.lesions} 
                    activeLesionId={activeLesionId}
                    onLesionHover={setActiveLesionId}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-400 text-xs">
          <p>
            Disclaimer: This tool uses Artificial Intelligence for analysis and is not a substitute for professional medical advice. 
            Always consult a certified dermatologist for diagnosis and treatment.
          </p>
        </div>
      </footer>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;