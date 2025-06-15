import React, { useState } from 'react';
import { mcpApi } from '../services/api';

const McpKeywordOptimizer = ({ onKeywordSelect, onSearchResults }) => {
  const [userQuery, setUserQuery] = useState('');
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimizeKeywords = async () => {
    if (!userQuery.trim()) {
      setError('검색할 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🤖 MCP 키워드 최적화 시작:', userQuery);
      
      const result = await mcpApi.optimizeKeywords(userQuery.trim());
      
      if (result.success) {
        setOptimization(result.data);
        console.log('✅ 키워드 최적화 완료:', result.data.keywords);
      } else {
        throw new Error(result.message || '키워드 최적화에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 키워드 최적화 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordClick = async (keyword) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 선택된 키워드로 검색:', keyword);
      
      const result = await mcpApi.smartSearch(userQuery, keyword, 10);
      
      if (result.success) {
        console.log(`✅ 검색 완료: ${result.data.papers.length}개 논문 발견`);
        if (onSearchResults) {
          onSearchResults(result.data.papers);
        }
        if (onKeywordSelect) {
          onKeywordSelect(keyword);
        }
      } else {
        throw new Error(result.message || '검색에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 검색 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleOptimizeKeywords();
    }
  };

  const exampleQueries = [
    { text: "🎬 AI 영화 제작", query: "AI를 활용한 영화 제작 기술에 관한 최신 논문을 찾아달라" },
    { text: "🏥 의료 AI", query: "의료 영상 진단을 위한 딥러닝 연구 논문" },
    { text: "🤖 자율주행", query: "자율주행 자동차의 컴퓨터 비전 기술 논문" },
    { text: "🎓 교육 AI", query: "교육 분야에서의 인공지능 활용 연구" },
    { text: "🔬 연구 방법론", query: "머신러닝 연구 방법론과 평가 지표" },
    { text: "📊 데이터 과학", query: "빅데이터 분석과 데이터 마이닝 기법" }
  ];

  const handleExampleClick = (example) => {
    setUserQuery(example.query);
    setOptimization(null);
    setError(null);
  };

  return (
    <div className="bg-white border-2 border-dashed border-blue-400 rounded-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold border border-blue-300 mr-4">
            🔗 MCP 연동
          </div>
          <h2 className="text-xl font-bold text-black">mcp 연동으로 인한 검색</h2>
        </div>
      </div>

      {/* 설명 */}
      <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="font-bold text-black mb-2">검색 방법</h3>
        <p className="text-gray-600 text-sm mb-3">
          자연어로 원하는 연구 주제를 설명하면 AI가 최적의 학술 검색어를 생성합니다
        </p>
        <p className="text-gray-600 text-sm">
          예시: "mcp에 관한 최신 논문을 찾아줘", "이 검색을 사용하는 방법을 따르자"
        </p>
      </div>

      {/* 입력 영역 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-black mb-2">
          📝 연구 주제를 자연어로 설명해주세요
        </label>
        <textarea
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="예: AI 영화 관련 논문을 찾아달라..."
          className="w-full h-20 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 resize-none"
          disabled={loading}
        />
      </div>

      {/* 예시 버튼들 */}
      <div className="mb-6">
        <div className="text-sm font-medium text-black mb-3">🎯 추천 검색</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="bg-gray-50 hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-lg p-3 text-left transition-colors"
              disabled={loading}
            >
              <div className="font-medium text-sm text-black">{example.text}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 최적화 버튼 */}
      <button
        onClick={handleOptimizeKeywords}
        disabled={loading || !userQuery.trim()}
        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all border-2 ${
          loading || !userQuery.trim()
            ? 'bg-gray-400 border-gray-400 cursor-not-allowed'
            : 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            MCP AI 분석 중...
          </div>
        ) : (
          '🤖 키워드 최적화'
        )}
      </button>

      {/* 에러 표시 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="flex items-start">
            <div className="text-red-500 mr-2">❌</div>
            <div>
              <div className="font-bold text-red-800">오류 발생</div>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* 최적화 결과 */}
      {optimization && (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">
              🤖 MCP 분석 결과
            </h3>
            <div className="text-sm text-blue-600 font-medium">
              신뢰도: {optimization.confidence}%
            </div>
          </div>

          {optimization.analysisKorean && (
            <div className="mb-4 p-3 bg-white border-2 border-blue-200 rounded-lg">
              <div className="text-sm font-bold text-black mb-1">💭 AI 분석</div>
              <div className="text-gray-700">{optimization.analysisKorean}</div>
            </div>
          )}

          <div className="mb-4">
            <div className="text-sm font-bold text-black mb-3">
              ✨ 최적화된 검색어 (클릭하여 즉시 검색)
            </div>
            <div className="space-y-2">
              {optimization.keywords.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => handleKeywordClick(keyword)}
                  disabled={loading}
                  className={`block w-full text-left px-4 py-3 bg-white hover:bg-blue-50 border-2 border-blue-300 hover:border-blue-500 rounded-lg transition-all ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-black">{keyword}</span>
                    <span className="text-blue-600 text-sm font-bold">🔍 검색</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {optimization.reasoning && (
            <div className="p-3 bg-white border-2 border-blue-200 rounded-lg">
              <div className="text-sm font-bold text-black mb-1">🎯 선택 이유</div>
              <div className="text-gray-700 text-sm">{optimization.reasoning}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default McpKeywordOptimizer;