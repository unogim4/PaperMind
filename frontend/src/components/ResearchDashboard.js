import React, { useState, useEffect } from 'react';
import McpKeywordOptimizer from './McpKeywordOptimizer';
import PaperList from './PaperList';
import AbstractGenerator from './AbstractGenerator';
import { healthApi } from '../services/api';

const ResearchDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [serverStatus, setServerStatus] = useState('checking');

  // 서버 상태 확인
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      await healthApi.checkHealth();
      setServerStatus('connected');
      console.log('✅ 서버 연결 확인');
    } catch (error) {
      setServerStatus('disconnected');
      console.error('❌ 서버 연결 실패:', error.message);
    }
  };

  const handleSearchResults = (searchResults) => {
    setPapers(searchResults);
    console.log(`📋 검색 결과 업데이트: ${searchResults.length}개 논문`);
  };

  const handleKeywordSelect = (keyword) => {
    setSelectedKeyword(keyword);
    console.log(`🔍 선택된 키워드: ${keyword}`);
  };

  const handlePaperSelect = (selectedPaperIds) => {
    const selected = papers.filter((paper, index) => 
      selectedPaperIds.includes(paper.id || index.toString())
    );
    setSelectedPapers(selected);
    console.log(`📝 선택된 논문: ${selected.length}개`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 - 심플한 디자인 */}
      <div className="bg-white border-2 border-black">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <h1 className="text-4xl font-bold text-black">🧠 PaperMind</h1>
          <p className="text-lg text-gray-600 mt-2">
            AI-powered academic paper research assistant
          </p>
          
          {/* 서버 상태 - 우상단 */}
          <div className="absolute top-4 right-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              serverStatus === 'connected' 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                serverStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              {serverStatus === 'connected' ? '연결됨' : '연결 안됨'}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* MCP 키워드 최적화 섹션 */}
        <div className="mb-8">
          <McpKeywordOptimizer 
            onKeywordSelect={handleKeywordSelect}
            onSearchResults={handleSearchResults}
          />
        </div>

        {/* 검색 결과 섹션 */}
        {papers.length > 0 && (
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                📚 검색 결과 ({papers.length}개)
              </h2>
              {selectedKeyword && (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg border border-blue-300">
                  키워드: {selectedKeyword}
                </div>
              )}
            </div>
            
            <PaperList 
              papers={papers}
              loading={false}
              onSelectPaper={handlePaperSelect}
            />
          </div>
        )}

        {/* 초록 생성 섹션 */}
        {selectedPapers.length > 0 && (
          <div className="mt-8">
            <AbstractGenerator 
              selectedPapers={selectedPapers}
              searchKeyword={selectedKeyword}
            />
          </div>
        )}

        {/* 사용 가이드 (검색 결과가 없을 때만) */}
        {papers.length === 0 && (
          <div className="bg-white border-2 border-gray-300 rounded-lg p-8">
            <h3 className="text-xl font-bold text-black mb-6 text-center">
              🚀 PaperMind 사용 방법
            </h3>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-blue-300">
                  <span className="text-blue-600 text-2xl">📝</span>
                </div>
                <h4 className="font-bold text-black mb-2">1. 자연어 입력</h4>
                <p className="text-gray-600 text-sm">
                  "AI 영화 관련 논문을 찾아달라"처럼 자연스럽게 요청
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-green-300">
                  <span className="text-green-600 text-2xl">🤖</span>
                </div>
                <h4 className="font-bold text-black mb-2">2. AI 분석</h4>
                <p className="text-gray-600 text-sm">
                  MCP가 요청을 분석하여 최적의 학술 검색어를 생성
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-purple-300">
                  <span className="text-purple-600 text-2xl">🔍</span>
                </div>
                <h4 className="font-bold text-black mb-2">3. 키워드 선택</h4>
                <p className="text-gray-600 text-sm">
                  생성된 키워드 중 하나를 클릭하여 즉시 검색 실행
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-orange-300">
                  <span className="text-orange-600 text-2xl">📊</span>
                </div>
                <h4 className="font-bold text-black mb-2">4. 결과 분석</h4>
                <p className="text-gray-600 text-sm">
                  AI가 논문 관련성을 분석하여 점수별로 정렬된 결과 제공
                </p>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
              <p className="text-blue-800 font-medium">
                💡 위의 MCP 연동 검색을 사용해서 논문을 찾아보세요!
              </p>
            </div>
          </div>
        )}

        {/* 통계 섹션 - 하단 */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white border-2 border-blue-300 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">20,000+</div>
            <div className="text-gray-600">arXiv 논문</div>
          </div>
          
          <div className="bg-white border-2 border-green-300 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">AI 기반</div>
            <div className="text-gray-600">관련성 분석</div>
          </div>
          
          <div className="bg-white border-2 border-purple-300 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">실시간</div>
            <div className="text-gray-600">검색 및 분석</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchDashboard;