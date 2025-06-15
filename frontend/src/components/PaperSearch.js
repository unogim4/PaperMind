import React, { useState } from 'react';

const PaperSearch = ({ onSearch, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [maxResults, setMaxResults] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch({
        query: searchQuery.trim(),
        field: searchField,
        maxResults
      });
    }
  };

  const searchFields = [
    { value: 'all', label: '전체' },
    { value: 'title', label: '제목' },
    { value: 'author', label: '저자' },
    { value: 'abstract', label: '초록' },
    { value: 'category', label: '카테고리' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 논문 검색</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 검색어 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            검색어
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="예: machine learning, deep neural networks..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* 검색 옵션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색 필드
            </label>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {searchFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색 결과 수
            </label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
              <option value={50}>50개</option>
            </select>
          </div>
        </div>

        {/* 검색 버튼 */}
        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            loading || !searchQuery.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              검색 중...
            </div>
          ) : (
            '🔍 논문 검색하기'
          )}
        </button>
      </form>

      {/* 검색 팁 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 검색 팁</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 영어 키워드를 사용하면 더 많은 결과를 얻을 수 있습니다</li>
          <li>• 여러 키워드는 공백으로 구분해주세요</li>
          <li>• 구체적인 기술명이나 방법론을 포함하면 정확도가 높아집니다</li>
        </ul>
      </div>
    </div>
  );
};

export default PaperSearch;