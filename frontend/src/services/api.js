import React from 'react';
import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 요청 로깅 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', response.status, response.data);
      return response;
    },
    (error) => {
      console.error('❌ API Response Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

export const paperService = {
  // 기본 연결 테스트
  async testConnection() {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  },

  // 논문 검색 (기본)
  async searchPapers(query, maxResults = 10) {
    try {
      const response = await api.get('/api/papers/search', {
        params: { q: query, max_results: maxResults }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Paper search failed: ${error.response?.data?.message || error.message}`);
    }
  },

  // arXiv API 테스트
  async testArxiv() {
    try {
      const response = await api.get('/api/papers/test');
      return response.data;
    } catch (error) {
      throw new Error(`arXiv test failed: ${error.response?.data?.message || error.message}`);
    }
  },

  // 카테고리 목록 가져오기
  async getCategories() {
    try {
      const response = await api.get('/api/papers/categories');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.response?.data?.message || error.message}`);
    }
  }
};

export const researchService = {
  // 연구 분석 (논문 검색 + AI 분석)
  async analyzeResearch(researchTopic, maxPapers = 10, searchType = 'general') {
    try {
      const response = await api.post('/api/research/analyze', {
        researchTopic,
        maxPapers,
        searchType
      });
      return response.data;
    } catch (error) {
      throw new Error(`Research analysis failed: ${error.response?.data?.message || error.message}`);
    }
  },

  // 초록 생성
  async generateAbstract(researchInfo, selectedPaperIds = []) {
    try {
      const response = await api.post('/api/research/generate-abstract', {
        researchInfo,
        selectedPaperIds
      });
      return response.data;
    } catch (error) {
      throw new Error(`Abstract generation failed: ${error.response?.data?.message || error.message}`);
    }
  },

  // 개별 논문 요약
  async summarizePaper(paperId) {
    try {
      const response = await api.post('/api/research/summarize-paper', {
        paperId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Paper summarization failed: ${error.response?.data?.message || error.message}`);
    }
  },

  // Claude API 테스트
  async testClaude() {
    try {
      const response = await api.get('/api/research/test-claude');
      return response.data;
    } catch (error) {
      throw new Error(`Claude test failed: ${error.response?.data?.message || error.message}`);
    }
  }
};

// 에러 처리 유틸리티
export const handleApiError = (error) => {
  if (error.response) {
    // 서버 응답 에러
    return error.response.data?.message || error.response.data?.error || 'Server error occurred';
  } else if (error.request) {
    // 네트워크 에러
    return 'Network error - please check your connection and make sure the server is running';
  } else {
    // 기타 에러
    return error.message || 'An unexpected error occurred';
  }
};

// 로딩 상태 관리 훅
export const useApiLoading = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const executeRequest = async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executeRequest };
};

export default api;