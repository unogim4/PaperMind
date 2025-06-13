import React, { useState, useEffect } from 'react';
import { paperService, researchService, handleApiError } from '../services/api';

const ResearchDashboard = ({ onResearchStart }) => {
  const [researchTopic, setResearchTopic] = useState('');
  const [maxPapers, setMaxPapers] = useState(5);
  const [searchType, setSearchType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      await paperService.testConnection();
      setServerStatus('connected');
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!researchTopic.trim()) return;

    setLoading(true);
    try {
      // 실제 API 호출
      const analysisData = await researchService.analyzeResearch(
        researchTopic.trim(),
        maxPapers,
        searchType
      );

      onResearchStart({
        topic: researchTopic.trim(),
        maxPapers,
        searchType,
        analysisData // 실제 데이터 전달
      });
    } catch (error) {
      alert(`연구 분석 실패: ${handleApiError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const exampleTopics = [
    'machine learning',
    'computer vision', 
    'natural language processing',
    'deep learning',
    'reinforcement learning',
    'neural networks'
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🧠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PaperMind</h1>
                <p className="text-sm text-gray-600">AI 논문 연구 도우미</p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              serverStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{serverStatus === 'connected' ? '연결됨' : '연결 안됨'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        
        {/* 검색 카드 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 text-lg">🔍</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">논문 검색</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="연구 주제를 입력하세요 (예: machine learning)"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading || !researchTopic.trim() || serverStatus !== 'connected'}
                className={`absolute right-2 top-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  loading || !researchTopic.trim() || serverStatus !== 'connected'
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? '검색중...' : '검색'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={maxPapers}
                onChange={(e) => setMaxPapers(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value={3}>3개 논문</option>
                <option value={5}>5개 논문</option>
                <option value={10}>10개 논문</option>
              </select>
              
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="general">일반 검색</option>
                <option value="category">카테고리별</option>
                <option value="author">저자별</option>
              </select>
            </div>
          </form>
        </div>

        {/* 인기 주제 카드 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-orange-600 text-lg">🔥</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">인기 연구 주제</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {exampleTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => setResearchTopic(topic)}
                className="px-4 py-2 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* 기능 소개 그리드 */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* 스마트 검색 */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">스마트 검색</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              arXiv에서 AI 기반으로<br/>
              관련 논문을 찾아드립니다
            </p>
            <div className="mt-4 flex items-center text-xs text-blue-600">
              <span className="font-medium">arXiv 연동</span>
            </div>
          </div>
          
          {/* AI 분석 */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">AI 분석</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Claude AI가 논문의<br/>
              관련성과 핵심 내용을 분석
            </p>
            <div className="mt-4 flex items-center text-xs text-purple-600">
              <span className="font-medium">Claude 연동</span>
            </div>
          </div>
          
          {/* 초록 생성 */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">초록 생성</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              연구 주제에 맞는<br/>
              전문적인 초록을 자동 생성
            </p>
            <div className="mt-4 flex items-center text-xs text-green-600">
              <span className="font-medium">AI 생성</span>
            </div>
          </div>
        </div>

        {/* 서비스 통계 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-gray-600 text-lg">📊</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">서비스 정보</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">arXiv</div>
              <div className="text-xs text-gray-600">논문 데이터</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">Claude</div>
              <div className="text-xs text-gray-600">AI 엔진</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">실시간</div>
              <div className="text-xs text-gray-600">분석</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">무료</div>
              <div className="text-xs text-gray-600">서비스</div>
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼들 */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={checkServerConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            🔄 연결 상태 확인
          </button>
          <button 
            onClick={() => setResearchTopic('')}
            className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            🗑️ 입력 초기화
          </button>
        </div>

        {/* 서버 연결 에러 */}
        {serverStatus === 'disconnected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-lg mr-2">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">서버 연결 실패</p>
                <p className="text-red-600 text-sm">백엔드 서버가 실행 중인지 확인해주세요</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchDashboard;