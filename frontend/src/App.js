import React, { useState } from 'react';
import './App.css';
import ResearchDashboard from './components/ResearchDashboard';
import PaperAnalysis from './components/PaperAnalysis';
import AbstractGenerator from './components/AbstractGenerator';

function App() {
  const [currentStep, setCurrentStep] = useState('dashboard'); // dashboard, analysis, abstract
  const [researchData, setResearchData] = useState(null);
  const [analyzedPapers, setAnalyzedPapers] = useState([]);

  const handleResearchStart = (data) => {
    setResearchData(data);
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = (papers) => {
    setAnalyzedPapers(papers);
    setCurrentStep('abstract');
  };

  const handleBackToDashboard = () => {
    setCurrentStep('dashboard');
    setResearchData(null);
    setAnalyzedPapers([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네이버 스타일 헤더 */}
      {currentStep !== 'dashboard' && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                {/* 로고 */}
                <button 
                  onClick={handleBackToDashboard}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">🧠</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">PaperMind</h1>
                  </div>
                </button>
                
                {/* 단계 표시 */}
                <div className="hidden md:flex items-center space-x-1 ml-8">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentStep === 'dashboard' ? 'bg-green-100 text-green-800 font-semibold' : 
                    currentStep === 'analysis' || currentStep === 'abstract' ? 'bg-gray-100 text-gray-600' : 'text-gray-400'
                  }`}>
                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                      currentStep === 'dashboard' ? 'bg-green-500 text-white' : 
                      currentStep === 'analysis' || currentStep === 'abstract' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>1</span>
                    <span>주제 입력</span>
                  </div>
                  
                  <div className="text-gray-300">→</div>
                  
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentStep === 'analysis' ? 'bg-green-100 text-green-800 font-semibold' : 
                    currentStep === 'abstract' ? 'bg-gray-100 text-gray-600' : 'text-gray-400'
                  }`}>
                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                      currentStep === 'analysis' ? 'bg-green-500 text-white' : 
                      currentStep === 'abstract' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>2</span>
                    <span>논문 분석</span>
                  </div>
                  
                  <div className="text-gray-300">→</div>
                  
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentStep === 'abstract' ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-400'
                  }`}>
                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                      currentStep === 'abstract' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>3</span>
                    <span>초록 생성</span>
                  </div>
                </div>
              </div>

              {/* 뒤로가기 버튼 */}
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">처음으로 돌아가기</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 메인 컨텐츠 */}
      <main>
        {currentStep === 'dashboard' && (
          <ResearchDashboard onResearchStart={handleResearchStart} />
        )}
        
        {currentStep === 'analysis' && (
          <PaperAnalysis 
            researchTopic={researchData?.topic}
            researchData={researchData}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}
        
        {currentStep === 'abstract' && (
          <AbstractGenerator 
            researchData={researchData}
            analyzedPapers={analyzedPapers}
          />
        )}
      </main>

      {/* 푸터 */}
      {currentStep === 'dashboard' && (
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
                <span className="text-2xl">🧠</span>
                <span className="font-bold text-lg">PaperMind</span>
                <span className="text-gray-400">|</span>
                <span className="text-sm">Powered by Claude AI & arXiv</span>
              </div>
              <p className="text-sm text-gray-500">
                학술 연구를 더 스마트하고, 빠르고, 접근하기 쉽게 만듭니다
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;