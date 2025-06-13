const express = require('express');
const ArxivService = require('../services/arxivService');

const router = express.Router();
const arxivService = new ArxivService();

/**
 * GET /api/papers/search
 * 논문 검색 API
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      q: query, 
      max_results = 10, 
      category,
      author,
      title 
    } = req.query;

    if (!query && !category && !author && !title) {
      return res.status(400).json({
        error: 'Search query is required',
        message: 'Please provide at least one search parameter: q, category, author, or title'
      });
    }

    let papers;

    // 검색 타입에 따라 다른 메서드 호출
    if (query) {
      papers = await arxivService.searchPapers(query, parseInt(max_results));
    } else if (category) {
      papers = await arxivService.searchByCategory(category, parseInt(max_results));
    } else if (author) {
      papers = await arxivService.searchByAuthor(author, parseInt(max_results));
    } else if (title) {
      papers = await arxivService.searchByTitle(title, parseInt(max_results));
    }

    res.json({
      success: true,
      query: query || category || author || title,
      count: papers.length,
      papers: papers
    });

  } catch (error) {
    console.error('Papers search error:', error);
    res.status(500).json({
      error: 'Failed to search papers',
      message: error.message
    });
  }
});

/**
 * GET /api/papers/categories
 * 주요 arXiv 카테고리 목록
 */
router.get('/categories', (req, res) => {
  const categories = {
    'cs.AI': 'Artificial Intelligence',
    'cs.CL': 'Computation and Language',
    'cs.CV': 'Computer Vision and Pattern Recognition',
    'cs.LG': 'Machine Learning',
    'cs.NE': 'Neural and Evolutionary Computing',
    'stat.ML': 'Machine Learning (Statistics)',
    'q-bio.NC': 'Neurons and Cognition',
    'physics.bio-ph': 'Biological Physics',
    'math.ST': 'Statistics Theory',
    'econ.EM': 'Econometrics'
  };

  res.json({
    success: true,
    categories: categories
  });
});

/**
 * POST /api/papers/advanced-search
 * 고급 검색 API
 */
router.post('/advanced-search', async (req, res) => {
  try {
    const { 
      title, 
      author, 
      category, 
      abstract, 
      max_results = 10 
    } = req.body;

    const papers = await arxivService.advancedSearch({
      title,
      author,
      category,
      abstract
    }, parseInt(max_results));

    res.json({
      success: true,
      searchCriteria: { title, author, category, abstract },
      count: papers.length,
      papers: papers
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      error: 'Advanced search failed',
      message: error.message
    });
  }
});

/**
 * GET /api/papers/test
 * API 테스트용 엔드포인트
 */
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing arXiv API connection...');
    
    // 간단한 테스트 검색
    const testPapers = await arxivService.searchPapers('deep learning', 3);
    
    res.json({
      success: true,
      message: '🎉 arXiv API connection successful!',
      sampleCount: testPapers.length,
      samplePapers: testPapers.map(paper => ({
        id: paper.id,
        title: paper.title.substring(0, 100) + '...',
        authors: paper.authors.slice(0, 2),
        category: paper.categories[0]
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'arXiv API test failed',
      message: error.message
    });
  }
});

module.exports = router;