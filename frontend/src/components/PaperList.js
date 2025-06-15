import React, { useState } from 'react';

const PaperList = ({ papers, loading, onSelectPaper }) => {
  const [selectedPapers, setSelectedPapers] = useState(new Set());

  const handlePaperSelect = (paperId) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(paperId)) {
      newSelected.delete(paperId);
    } else {
      newSelected.add(paperId);
    }
    setSelectedPapers(newSelected);
    
    if (onSelectPaper) {
      onSelectPaper(Array.from(newSelected));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return '저자 정보 없음';
    if (authors.length <= 3) {
      return authors.map(author => author.name || author).join(', ');
    }
    return `${authors.slice(0, 3).map(author => author.name || author).join(', ')} 외 ${authors.length - 3}명`;
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getRelevanceColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-lg text-gray-600">논문을 검색하는 중입니다...</span>
        </div>
      </div>
    );
  }

  if (!papers || papers.length === 0) {
    return (
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500 mb-4">
          <div className="text-6xl mb-4">📄</div>
        </div>
        <h3 className="text-lg font-bold text-black mb-2">검색 결과가 없습니다</h3>
        <p className="text-gray-600">다른 키워드로 검색해보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 선택된 논문 요약 */}
      {selectedPapers.size > 0 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-sm font-bold text-green-800 mb-2">
            ✅ 선택된 논문 ({selectedPapers.size}개)
          </h3>
          <p className="text-sm text-green-700">
            이 논문들을 바탕으로 초록을 생성할 수 있습니다.
          </p>
        </div>
      )}

      {/* 논문 목록 */}
      {papers.map((paper, index) => (
        <div
          key={paper.id || index}
          className={`bg-white border-2 rounded-lg p-6 transition-all ${
            selectedPapers.has(paper.id || index.toString())
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {/* 선택 체크박스와 관련성 점수 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={selectedPapers.has(paper.id || index.toString())}
                onChange={() => handlePaperSelect(paper.id || index.toString())}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-black mb-2 leading-tight">
                  {paper.title || '제목 없음'}
                </h3>
              </div>
            </div>
            
            {/* 관련성 점수 */}
            {paper.relevanceScore && (
              <div className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getRelevanceColor(paper.relevanceScore)}`}>
                {paper.relevanceScore}점
              </div>
            )}
          </div>

          {/* 메타데이터 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <span className="font-medium text-black mr-2">저자:</span>
              {formatAuthors(paper.authors)}
            </div>
            <div className="flex items-center">
              <span className="font-medium text-black mr-2">발표:</span>
              {formatDate(paper.published)}
            </div>
            {paper.primaryCategory && (
              <div className="flex items-center">
                <span className="font-medium text-black mr-2">분야:</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-300 text-xs">
                  {paper.primaryCategory}
                </span>
              </div>
            )}
          </div>

          {/* 초록 */}
          {paper.summary && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-black mb-2">📄 초록</h4>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                {truncateText(paper.summary)}
              </p>
            </div>
          )}

          {/* AI 분석 결과 */}
          {paper.aiAnalysis && paper.aiAnalysis.reasoning && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-black mb-2">🤖 AI 분석</h4>
              <div className="bg-blue-50 p-3 rounded border-2 border-blue-200">
                <p className="text-blue-800 text-sm">{paper.aiAnalysis.reasoning}</p>
                {paper.aiAnalysis.keyInsights && paper.aiAnalysis.keyInsights.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-bold text-blue-900 mb-1">핵심 인사이트:</div>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {paper.aiAnalysis.keyInsights.map((insight, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-600 mr-1">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-3">
            {paper.abstractUrl && (
              <a
                href={paper.abstractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded border-2 border-blue-300 hover:bg-blue-200 transition-colors"
              >
                <span className="mr-1">🔗</span>
                원문 보기
              </a>
            )}
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded border-2 border-red-300 hover:bg-red-200 transition-colors"
              >
                <span className="mr-1">📄</span>
                PDF 다운로드
              </a>
            )}
            <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded border-2 border-gray-300 hover:bg-gray-200 transition-colors">
              <span className="mr-1">⭐</span>
              즐겨찾기
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaperList;