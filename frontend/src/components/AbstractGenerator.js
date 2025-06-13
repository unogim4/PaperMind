import React, { useState } from 'react';
import { researchService, handleApiError } from '../services/api';

const AbstractGenerator = ({ researchData, analyzedPapers }) => {
  const [researchInfo, setResearchInfo] = useState({
    title: '',
    objective: '',
    method: '',
    field: '',
    language: 'Korean'
  });
  const [generatedAbstract, setGeneratedAbstract] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleInputChange = (field, value) => {
    setResearchInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateAbstract = async () => {
    if (!researchInfo.title.trim()) {
      alert('연구 제목을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 실제 API를 통해 초록 생성 시작...');
      
      const selectedPaperIds = analyzedPapers.map(paper => paper.id);
      const result = await researchService.generateAbstract(researchInfo, selectedPaperIds);
      
      console.log('✅ 초록 생성 성공:', result);
      
      setGeneratedAbstract(result.generatedAbstract);
      setWordCount(result.wordCount);
      
      // 성공 메시지
      alert('🎉 AI 초록이 성공적으로 생성되었습니다!');
      
    } catch (error) {
      console.error('❌ 초록 생성 실패:', error);
      alert(`초록 생성 실패: ${handleApiError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAbstract = () => {
    navigator.clipboard.writeText(generatedAbstract);
    alert('초록이 클립보드에 복사되었습니다!');
  };

  const handleDownloadAbstract = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedAbstract], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${researchInfo.title.replace(/[^a-z0-9가-힣]/gi, '_')}_초록.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            AI 초록 생성
          </h2>
          <p className="text-gray-600">
            선택한 <span className="font-semibold text-green-600">{analyzedPapers.length}개</span>의 논문을 바탕으로 연구 초록을 생성합니다
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 왼쪽 - 연구 정보 입력 */}
          <div className="space-y-6">
            {/* 연구 정보 폼 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📝</span>
                연구 정보 입력
              </h3>
              
              <div className="space-y-4">
                {/* 연구 제목 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    연구 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={researchInfo.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="연구 제목을 입력하세요"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* 연구 목적 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    연구 목적
                  </label>
                  <textarea
                    value={researchInfo.objective}
                    onChange={(e) => handleInputChange('objective', e.target.value)}
                    placeholder="이 연구의 주요 목적은 무엇인가요?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none transition-colors"
                  />
                </div>

                {/* 연구 방법 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    연구 방법
                  </label>
                  <textarea
                    value={researchInfo.method}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                    placeholder="목적 달성을 위해 어떤 방법을 사용할 예정인가요?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none transition-colors"
                  />
                </div>

                {/* 연구 분야 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    연구 분야
                  </label>
                  <input
                    type="text"
                    value={researchInfo.field}
                    onChange={(e) => handleInputChange('field', e.target.value)}
                    placeholder="예: 컴퓨터과학, 기계학습, 자연어처리"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* 언어 선택 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    초록 언어
                  </label>
                  <select
                    value={researchInfo.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none bg-white"
                  >
                    <option value="Korean">한국어</option>
                    <option value="English">영어</option>
                  </select>
                </div>
              </div>

              {/* 생성 버튼 */}
              <button
                onClick={handleGenerateAbstract}
                disabled={loading || !researchInfo.title.trim()}
                className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                  loading || !researchInfo.title.trim()
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    AI가 초록을 생성하고 있습니다...
                  </div>
                ) : (
                  '🤖 AI 초록 생성하기'
                )}
              </button>
            </div>

            {/* 선택된 논문 요약 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">📚</span>
                선택된 논문 ({analyzedPapers.length}개)
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {analyzedPapers.map((paper) => (
                  <div key={paper.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border">
                    <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                      paper.analysis.relevance_score >= 90 ? 'bg-green-500' :
                      paper.analysis.relevance_score >= 80 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}>
                      {paper.analysis.relevance_score}%
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                        {paper.title.length > 50 ? `${paper.title.substring(0, 50)}...` : paper.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {paper.authors[0]} 외 ({new Date(paper.published).getFullYear()})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 - 생성된 초록 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="text-2xl mr-2">✍️</span>
                  생성된 초록
                </h3>
                {generatedAbstract && (
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {wordCount}단어
                  </div>
                )}
              </div>

              {generatedAbstract ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-green-500 min-h-96">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
                        {generatedAbstract}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleCopyAbstract}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                    >
                      📋 복사하기
                    </button>
                    
                    <button
                      onClick={handleDownloadAbstract}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                    >
                      💾 파일로 저장
                    </button>
                    
                    <button
                      onClick={handleGenerateAbstract}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
                    >
                      🔄 다시 생성
                    </button>
                  </div>

                  {/* 품질 지표 */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{wordCount}</div>
                      <div className="text-sm text-gray-600">단어 수</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600 mb-1">{analyzedPapers.length}</div>
                      <div className="text-sm text-gray-600">참고 논문</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600 mb-1">AI</div>
                      <div className="text-sm text-gray-600">생성됨</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📝</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    초록 생성 준비 완료
                  </h4>
                  <p className="text-gray-600 mb-4">
                    연구 정보를 입력하고 "AI 초록 생성하기" 버튼을 클릭하세요
                  </p>
                  <div className="bg-gray-100 rounded-lg p-4 max-w-sm mx-auto">
                    <p className="text-sm text-gray-600">
                      AI가 선택된 논문들을 분석하여<br />
                      전문적인 초록을 생성해드립니다
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 도움말 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                <span className="text-xl mr-2">💡</span>
                더 나은 초록을 위한 팁
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>연구 목적을 구체적으로 작성해주세요</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>사용할 방법론을 명확히 설명해주세요</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>연구 분야를 정확히 입력해주세요</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>여러 번 생성해서 가장 적합한 초록을 선택하세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbstractGenerator;