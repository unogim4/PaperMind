const axios = require('axios');
const xml2js = require('xml2js');

class ArxivService {
  constructor() {
    this.baseUrl = 'http://export.arxiv.org/api/query';
    this.parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: true,
      trim: true
    });
  }

  // 논문 검색
  async searchPapers(query, maxResults = 10) {
    try {
      console.log(`🔍 [arXiv] 검색 시작: "${query}" (최대 ${maxResults}개)`);

      const params = new URLSearchParams({
        search_query: `all:${query}`,
        start: 0,
        max_results: maxResults,
        sortBy: 'relevance',
        sortOrder: 'descending'
      });

      const response = await axios.get(`${this.baseUrl}?${params}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'PaperMind/1.0 (Academic Research Tool)'
        }
      });

      console.log(`📡 [arXiv] API 응답 수신: ${response.data.length} bytes`);

      // XML 파싱
      const result = await this.parser.parseStringPromise(response.data);
      
      if (!result.feed || !result.feed.entry) {
        console.warn('⚠️ [arXiv] 검색 결과가 없습니다');
        return [];
      }

      // 단일 결과도 배열로 변환
      const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
      
      const papers = entries.map(entry => this.parseEntry(entry));
      
      console.log(`✅ [arXiv] ${papers.length}개 논문 파싱 완료`);
      return papers;

    } catch (error) {
      console.error('❌ [arXiv] 검색 실패:', error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error('arXiv 서버 응답 시간이 초과되었습니다. 다시 시도해주세요.');
      }
      throw new Error(`논문 검색에 실패했습니다: ${error.message}`);
    }
  }

  // arXiv 엔트리 파싱
  parseEntry(entry) {
    try {
      // ID 추출 (arXiv ID)
      const id = entry.id ? entry.id.split('/').pop().split('v')[0] : 'unknown';

      // 저자 정보 파싱
      let authors = [];
      if (entry.author) {
        if (Array.isArray(entry.author)) {
          authors = entry.author.map(author => ({
            name: author.name || 'Unknown'
          }));
        } else {
          authors = [{ name: entry.author.name || 'Unknown' }];
        }
      }

      // 카테고리 파싱
      let categories = [];
      if (entry.category) {
        if (Array.isArray(entry.category)) {
          categories = entry.category.map(cat => cat.term || cat);
        } else {
          categories = [entry.category.term || entry.category];
        }
      }

      // 링크 파싱
      let pdfUrl = '';
      let abstractUrl = '';
      
      if (entry.link) {
        const links = Array.isArray(entry.link) ? entry.link : [entry.link];
        
        for (const link of links) {
          if (link.type === 'application/pdf' || link.href?.includes('.pdf')) {
            pdfUrl = link.href;
          } else if (link.type === 'text/html' || link.rel === 'alternate') {
            abstractUrl = link.href;
          }
        }
      }

      // 날짜 파싱
      const publishedDate = entry.published ? new Date(entry.published) : null;
      const updatedDate = entry.updated ? new Date(entry.updated) : null;

      return {
        id,
        title: this.cleanText(entry.title) || 'No Title',
        authors,
        summary: this.cleanText(entry.summary) || 'No Abstract Available',
        categories,
        primaryCategory: categories[0] || 'Unknown',
        published: publishedDate?.toISOString().split('T')[0] || 'Unknown',
        updated: updatedDate?.toISOString().split('T')[0] || 'Unknown',
        pdfUrl,
        abstractUrl: abstractUrl || `https://arxiv.org/abs/${id}`,
        arxivId: id,
        
        // PaperMind 추가 필드들
        relevanceScore: 0, // Claude가 나중에 분석
        aiAnalysis: null,
        selected: false
      };

    } catch (error) {
      console.error('Entry 파싱 실패:', error);
      return {
        id: 'parse-error',
        title: 'Parsing Error',
        authors: [],
        summary: 'Failed to parse paper information',
        categories: [],
        primaryCategory: 'Unknown',
        published: 'Unknown',
        updated: 'Unknown',
        pdfUrl: '',
        abstractUrl: '',
        arxivId: 'error',
        relevanceScore: 0,
        aiAnalysis: null,
        selected: false
      };
    }
  }

  // 텍스트 정리 (HTML 태그, 불필요한 공백 제거)
  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/\s+/g, ' ')    // 여러 공백을 하나로
      .replace(/\n+/g, ' ')    // 줄바꿈을 공백으로
      .trim();                 // 앞뒤 공백 제거
  }

  // 검색어 유효성 검사
  validateQuery(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('검색어가 올바르지 않습니다.');
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      throw new Error('검색어는 최소 2자 이상이어야 합니다.');
    }

    if (trimmedQuery.length > 200) {
      throw new Error('검색어는 200자를 초과할 수 없습니다.');
    }

    return trimmedQuery;
  }

  // 카테고리별 검색
  async searchByCategory(category, maxResults = 10) {
    const categoryQuery = `cat:${category}`;
    return this.searchPapers(categoryQuery, maxResults);
  }

  // 저자별 검색
  async searchByAuthor(authorName, maxResults = 10) {
    const authorQuery = `au:"${authorName}"`;
    return this.searchPapers(authorQuery, maxResults);
  }

  // 최신 논문 검색
  async getRecentPapers(category = '', maxResults = 10) {
    const query = category ? `cat:${category}` : 'all:machine learning';
    const params = new URLSearchParams({
      search_query: query,
      start: 0,
      max_results: maxResults,
      sortBy: 'submittedDate',
      sortOrder: 'descending'
    });

    try {
      const response = await axios.get(`${this.baseUrl}?${params}`);
      const result = await this.parser.parseStringPromise(response.data);
      
      if (!result.feed || !result.feed.entry) {
        return [];
      }

      const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
      return entries.map(entry => this.parseEntry(entry));

    } catch (error) {
      console.error('최신 논문 검색 실패:', error);
      throw new Error('최신 논문을 가져오는데 실패했습니다.');
    }
  }
}

module.exports = ArxivService;