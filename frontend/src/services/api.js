import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // 포트 변경

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 로깅
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // 네트워크 에러 처리
    if (!error.response) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    
    // HTTP 상태 코드별 에러 처리
    switch (error.response.status) {
      case 400:
        throw new Error(error.response.data?.message || '잘못된 요청입니다.');
      case 401:
        throw new Error('인증이 필요합니다.');
      case 403:
        throw new Error('접근 권한이 없습니다.');
      case 404:
        throw new Error('요청한 리소스를 찾을 수 없습니다.');
      case 429:
        throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      case 500:
        throw new Error(error.response.data?.message || '서버 오류가 발생했습니다.');
      default:
        throw new Error(error.response.data?.message || '알 수 없는 오류가 발생했습니다.');
    }
  }
);

// MCP API 함수들
export const mcpApi = {
  // MCP 키워드 최적화
  optimizeKeywords: async (userQuery, language = 'ko') => {
    try {
      const response = await apiClient.post('/api/mcp/optimize-keywords', {
        userQuery,
        language
      });
      return response.data;
    } catch (error) {
      console.error('MCP keyword optimization failed:', error);
      throw error;
    }
  },

  // MCP 스마트 검색
  smartSearch: async (userQuery, selectedKeyword = null, maxResults = 10) => {
    try {
      const response = await apiClient.post('/api/mcp/smart-search', {
        userQuery,
        selectedKeyword,
        maxResults
      });
      return response.data;
    } catch (error) {
      console.error('MCP smart search failed:', error);
      throw error;
    }
  },

  // MCP 상태 확인
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/api/mcp/health');
      return response.data;
    } catch (error) {
      console.error('MCP health check failed:', error);
      throw error;
    }
  },

  // MCP 초록 생성
  generateAbstract: async (researchInfo, referencePapers, searchKeyword) => {
    try {
      const response = await apiClient.post('/api/mcp/generate-abstract', {
        researchInfo,
        referencePapers,
        searchKeyword
      });
      return response.data;
    } catch (error) {
      console.error('MCP abstract generation failed:', error);
      throw error;
    }
  },

  // 키워드 검증
  validateKeyword: async (keyword) => {
    try {
      const response = await apiClient.post('/api/mcp/validate-keyword', {
        keyword
      });
      return response.data;
    } catch (error) {
      console.error('Keyword validation failed:', error);
      throw error;
    }
  }
};

// 기존 API들
export const paperApi = {
  // 논문 검색
  searchPapers: async (searchParams) => {
    try {
      const response = await apiClient.post('/api/papers/search', searchParams);
      return response.data;
    } catch (error) {
      console.error('Paper search failed:', error);
      throw error;
    }
  },

  // 논문 상세 정보 가져오기
  getPaperDetails: async (paperId) => {
    try {
      const response = await apiClient.get(`/api/papers/${paperId}`);
      return response.data;
    } catch (error) {
      console.error('Get paper details failed:', error);
      throw error;
    }
  }
};

export const healthApi = {
  // 서버 상태 확인
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

export default apiClient;