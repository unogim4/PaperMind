const axios = require('axios');
const xml2js = require('xml2js');

class ArxivService {
  constructor() {
    this.baseURL = 'http://export.arxiv.org/api/query';
    this.parser = new xml2js.Parser();
  }

  /**
   * arXiv에서 논문 검색
   * @param {string} query - 검색어
   * @param {number} maxResults - 최대 결과 수
   * @returns {Array} 논문 리스트
   */
  async searchPapers(query, maxResults = 10) {
    try {
      console.log(`🔍 Searching arXiv for: "${query}"`);
      
      const params = {
        search_query: query,
        start: 0,
        max_results: maxResults,
        sortBy: 'relevance',
        sortOrder: 'descending'
      };

      const response = await axios.get(this.baseURL, { params });
      const parsedData = await this.parser.parseStringPromise(response.data);
      
      return this.formatPapers(parsedData);
    } catch (error) {
      console.error('❌ arXiv API Error:', error.message);
      throw new Error(`arXiv search failed: ${error.message}`);
    }
  }

  /**
   * XML 응답을 우리가 사용할 형태로 변환
   */
  formatPapers(data) {
    if (!data.feed || !data.feed.entry) {
      return [];
    }

    const entries = Array.isArray(data.feed.entry) 
      ? data.feed.entry 
      : [data.feed.entry];

    return entries.map(entry => ({
      id: this.extractArxivId(entry.id[0]),
      title: entry.title[0].trim(),
      authors: this.formatAuthors(entry.author),
      summary: entry.summary[0].trim(),
      published: entry.published[0],
      updated: entry.updated[0],
      categories: this.formatCategories(entry.category),
      pdfUrl: this.findPdfUrl(entry.link),
      arxivUrl: entry.id[0]
    }));
  }

  /**
   * arXiv ID 추출 (예: http://arxiv.org/abs/2301.07041 → 2301.07041)
   */
  extractArxivId(fullUrl) {
    const match = fullUrl.match(/(\d{4}\.\d{4,5})/);
    return match ? match[1] : fullUrl;
  }

  /**
   * 저자 정보 포맷팅
   */
  formatAuthors(authors) {
    if (!authors) return [];
    
    const authorList = Array.isArray(authors) ? authors : [authors];
    return authorList.map(author => author.name[0]);
  }

  /**
   * 카테고리 정보 포맷팅
   */
  formatCategories(categories) {
    if (!categories) return [];
    
    const catList = Array.isArray(categories) ? categories : [categories];
    return catList.map(cat => cat.$.term);
  }

  /**
   * PDF URL 찾기
   */
  findPdfUrl(links) {
    if (!links) return null;
    
    const linkList = Array.isArray(links) ? links : [links];
    const pdfLink = linkList.find(link => 
      link.$.type === 'application/pdf'
    );
    
    return pdfLink ? pdfLink.$.href : null;
  }

  /**
   * 특정 분야로 검색 (예: 컴퓨터 사이언스)
   */
  async searchByCategory(category, maxResults = 10) {
    const categoryQuery = `cat:${category}`;
    return this.searchPapers(categoryQuery, maxResults);
  }

  /**
   * 저자로 검색
   */
  async searchByAuthor(authorName, maxResults = 10) {
    const authorQuery = `au:"${authorName}"`;
    return this.searchPapers(authorQuery, maxResults);
  }

  /**
   * 제목으로 검색
   */
  async searchByTitle(title, maxResults = 10) {
    const titleQuery = `ti:"${title}"`;
    return this.searchPapers(titleQuery, maxResults);
  }

  /**
   * 복합 검색 (제목 + 카테고리)
   */
  async advancedSearch(options, maxResults = 10) {
    let queryParts = [];
    
    if (options.title) {
      queryParts.push(`ti:"${options.title}"`);
    }
    
    if (options.author) {
      queryParts.push(`au:"${options.author}"`);
    }
    
    if (options.category) {
      queryParts.push(`cat:${options.category}`);
    }
    
    if (options.abstract) {
      queryParts.push(`abs:"${options.abstract}"`);
    }

    const query = queryParts.join(' AND ');
    return this.searchPapers(query, maxResults);
  }
}

module.exports = ArxivService;