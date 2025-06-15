import React, { useState } from 'react';
import { mcpApi } from '../services/api';

const AbstractGenerator = ({ selectedPapers, searchKeyword }) => {
  const [researchInfo, setResearchInfo] = useState({
    title: '',
    objective: '',
    methodology: '',
    expectedResults: '',
    language: 'korean'
  });
  const [generatedAbstract, setGeneratedAbstract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateAbstract = async () => {
    if (!researchInfo.title.trim()) {
      setError('연구 제목을 입력해주세요.');
      return;
    }

    if (selectedPapers.length === 0) {
      setError('참고할 논문을 최소 1개 이상 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📝 MCP 초록 생성 시작:', researchInfo.title);
      
      const result = await mcpApi.generateAbstract(
        researchInfo,
        selectedPapers,
        searchKeyword
      );
      
      if (result.success) {
        setGeneratedAbstract(result.data);
        console.log('✅ 초록 생성 완료');
      } else {
        throw new Error(result.message || '초록 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 초록 생성 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAbstract = () => {
    navigator.clipboard.writeText(generatedAbstract.abstract).then(() => {
      alert('초록이 클립보드에 복사되었습니다!');
    }).catch(() => {
      alert('복사에 실패했습니다. 텍스트를 직접 선택해서 복사해주세요.');
    });
  };

  const handleDownloadAbstract = () => {
    const content = `${researchInfo.title}\n\n${generatedAbstract.abstract}\n\n단어 수: ${generatedAbstract.wordCount}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${researchInfo.title}_초록.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exampleTitles = [
    "AI 기반 영화 제작 기술의 창의성과 효율성 향상 연구",
    "의료 영상 진단을 위한 딥러닝 모델의 정확도 개선",
    "자율주행 자동차의 컴퓨터 비전 기술 최적화 방안",
    "교육 분야 AI 활용을 통한 개인화 학습 효과 분석"
  ];

  return (
    <div className="bg-white border-2 border-green-400 rounded-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-300 mr-4">
            📝 MCP 초록 생성
          </div>
          <h2 className="text-xl font-bold text-black">AI 기반 학술 초록 자동 생성</h2>
        </div>
        {selectedPapers.length > 0 && (
          <div className="text-sm text-green-600 font-medium">
            {selectedPapers.length}개 논문 선택됨
          </div>
        )}
      </div>

      {/* 선택된 논문이 없을 때 안내 */}
      {selectedPapers.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
          <div className="text-yellow-800 font-medium mb-2">⚠️ 논문을 먼저 선택해주세요</div>
          <div className="text-yellow-700 text-sm">
            위의 검색 결과에서 참고할 논문들을 체크박스로 선택한 후 초록을 생성해보세요.
          </div>
        </div>
      )}

      {/* 연구 정보 입력 폼 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-black mb-2">
            📋 연구 제목 *
          </label>
          <input
            type="text"
            value={researchInfo.title}
            onChange={(e) => setResearchInfo({ ...researchInfo, title: e.target.value })}
            placeholder="예: AI 기반 영화 제작 기술의 창의성과 효율성 향상 연구"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 transition-colors"
            disabled={loading}
          />
          
          {/* 예시 제목 버튼들 */}
          <div className="mt-2">
            <div className="text-xs text-gray-600 mb-2">💡 예시 제목:</div>
            <div className="flex flex-wrap gap-2">
              {exampleTitles.map((title, index) => (
                <button
                  key={index}
                  onClick={() => setResearchInfo({ ...researchInfo, title })}
                  className="text-xs bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-800 px-2 py-1 rounded border border-gray-300 hover:border-green-400 transition-colors"
                  disabled={loading}
                >
                  {title.substring(0, 20)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">
            🎯 연구 목적
          </label>
          <textarea
            value={researchInfo.objective}
            onChange={(e) => setResearchInfo({ ...researchInfo, objective: e.target.value })}
            placeholder="이 연구의 주요 목적과 해결하고자 하는 문제를 설명해주세요"
            className="w-full h-20 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 resize-none transition-colors"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">
            🔬 연구 방법론
          </label>
          <textarea
            value={researchInfo.methodology}
            onChange={(e) => setResearchInfo({ ...researchInfo, methodology: e.target.value })}
            placeholder="사용할 연구 방법, 실험 설계, 분석 기법 등을 설명해주세요"
            className="w-full h-20 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 resize-none transition-colors"
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-black mb-2">
            📊 기대 결과
          </label>
          <textarea
            value={researchInfo.expectedResults}
            onChange={(e) => setResearchInfo({ ...researchInfo, expectedResults: e.target.value })}
            placeholder="예상되는 연구 결과와 기대 효과를 설명해주세요"
            className="w-full h-16 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 resize-none transition-colors"
            disabled={loading}
          />
        </div>
      </div>

      {/* 참고 논문 미리보기 */}
      {selectedPapers.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <h3 className="text-sm font-bold text-black mb-3">
            📚 참고 논문 ({selectedPapers.length}개)
          </h3>
          <div className="space-y-2">
            {selectedPapers.slice(0, 3).map((paper, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-blue-800">{index + 1}. {paper.title}</span>
                {paper.relevanceScore && (
                  <span className="ml-2 bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                    {paper.relevanceScore}점
                  </span>
                )}
              </div>
            ))}
            {selectedPapers.length > 3 && (
              <div className="text-sm text-blue-600">... 외 {selectedPapers.length - 3}개</div>
            )}
          </div>
        </div>
      )}

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerateAbstract}
        disabled={loading || !researchInfo.title.trim() || selectedPapers.length === 0}
        className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all border-2 ${
          loading || !researchInfo.title.trim() || selectedPapers.length === 0
            ? 'bg-gray-400 border-gray-400 cursor-not-allowed'
            : 'bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            MCP AI가 초록을 생성하는 중...
          </div>
        ) : (
          '📝 MCP 초록 생성하기'
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

      {/* 생성된 초록 표시 */}
      {generatedAbstract && (
        <div className="mt-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">
              📄 생성된 초록
            </h3>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <span>신뢰도: {generatedAbstract.confidence}%</span>
              <span>|</span>
              <span>단어 수: {generatedAbstract.wordCount}</span>
            </div>
          </div>

          {/* 초록 내용 */}
          <div className="mb-4 p-4 bg-white border-2 border-green-200 rounded-lg">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {generatedAbstract.abstract}
            </p>
          </div>

          {/* 구조 분석 */}
          {generatedAbstract.structure && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-green-800 mb-2">📋 구조 분석</h4>
                <div className="space-y-1 text-xs text-gray-700">
                  <div><span className="font-medium">배경:</span> {generatedAbstract.structure.background}</div>
                  <div><span className="font-medium">목적:</span> {generatedAbstract.structure.objective}</div>
                  <div><span className="font-medium">방법:</span> {generatedAbstract.structure.methodology}</div>
                  <div><span className="font-medium">결과:</span> {generatedAbstract.structure.expectedResults}</div>
                  <div><span className="font-medium">의의:</span> {generatedAbstract.structure.significance}</div>
                </div>
              </div>

              <div className="bg-white border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-green-800 mb-2">💡 개선 제안</h4>
                <ul className="space-y-1 text-xs text-gray-700">
                  {generatedAbstract.suggestions?.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyAbstract}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded border-2 border-blue-300 hover:bg-blue-200 transition-colors"
            >
              <span className="mr-2">📋</span>
              클립보드에 복사
            </button>
            
            <button
              onClick={handleDownloadAbstract}
              className="flex items-center px-4 py-2 bg-green-100 text-green-800 font-medium rounded border-2 border-green-300 hover:bg-green-200 transition-colors"
            >
              <span className="mr-2">💾</span>
              텍스트 파일 다운로드
            </button>

            <button
              onClick={() => setGeneratedAbstract(null)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded border-2 border-gray-300 hover:bg-gray-200 transition-colors"
            >
              <span className="mr-2">🔄</span>
              다시 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbstractGenerator;