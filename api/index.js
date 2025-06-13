const express = require('express');
const cors = require('cors');
const ArxivService = require('../backend/services/arxivService');
const ClaudeService = require('../backend/services/claudeService');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 서비스 인스턴스
const arxivService = new ArxivService();
const claudeService = new ClaudeService();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PaperMind API'
  });
});

// 논문 검색 테스트
app.get('/api/papers/test', async (req, res) => {
  try {
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

// 논문 검색
app.get('/api/papers/search', async (req, res) => {
  try {
    const { q: query, max_results = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const papers = await arxivService.searchPapers(query, parseInt(max_results));

    res.json({
      success: true,
      query: query,
      count: papers.length,
      papers: papers
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to search papers',
      message: error.message
    });
  }
});

// 연구 분석
app.post('/api/research/analyze', async (req, res) => {
  try {
    const { researchTopic, maxPapers = 10 } = req.body;

    if (!researchTopic) {
      return res.status(400).json({
        error: 'Research topic is required'
      });
    }

    // Claude API 키 확인
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({
        error: 'Claude API key not configured'
      });
    }

    // 1단계: arXiv에서 논문 검색
    const papers = await arxivService.searchPapers(researchTopic, maxPapers);

    if (papers.length === 0) {
      return res.json({
        success: true,
        message: 'No papers found for this topic',
        researchTopic,
        analyzedPapers: []
      });
    }

    // 2단계: Claude로 논문 분석
    const analyzedPapers = await claudeService.analyzePapers(papers, researchTopic);

    res.json({
      success: true,
      researchTopic,
      totalPapers: papers.length,
      analyzedPapers: analyzedPapers,
      topRelevantPapers: analyzedPapers
        .filter(p => p.analysis.relevance_score > 60)
        .slice(0, 5)
    });

  } catch (error) {
    console.error('Research analysis error:', error);
    res.status(500).json({
      error: 'Research analysis failed',
      message: error.message
    });
  }
});

// 초록 생성
app.post('/api/research/generate-abstract', async (req, res) => {
  try {
    const { researchInfo, selectedPaperIds = [] } = req.body;

    if (!researchInfo || !researchInfo.title) {
      return res.status(400).json({
        error: 'Research information with title is required'
      });
    }

    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({
        error: 'Claude API key not configured'
      });
    }

    // 모크 선택된 논문 데이터
    let selectedPapers = [];
    if (selectedPaperIds && selectedPaperIds.length > 0) {
      selectedPapers = selectedPaperIds.map(id => ({
        id: id,
        title: `Reference Paper ${id}`,
        authors: ['Author Name'],
        published: '2023-01-01'
      }));
    }

    const result = await claudeService.generateAbstract(researchInfo, selectedPapers);

    res.json({
      success: true,
      researchInfo,
      generatedAbstract: result.abstract,
      wordCount: result.wordCount,
      basedOnPapers: result.basedOnPapers
    });

  } catch (error) {
    console.error('Abstract generation error:', error);
    res.status(500).json({
      error: 'Abstract generation failed',
      message: error.message
    });
  }
});

// Claude API 테스트
app.get('/api/research/test-claude', async (req, res) => {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Claude API key not configured'
      });
    }

    const testPapers = await arxivService.searchPapers('machine learning', 2);
    const testResult = await claudeService.analyzePapers(testPapers, 'machine learning');

    res.json({
      success: true,
      message: '🤖 Claude API connection successful!',
      testAnalysis: testResult.map(paper => ({
        title: paper.title.substring(0, 50) + '...',
        relevanceScore: paper.analysis.relevance_score,
        keyInsights: paper.analysis.key_insights
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Claude API test failed',
      message: error.message
    });
  }
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '🧠 PaperMind API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      papers: '/api/papers',
      research: '/api/research'
    }
  });
});

module.exports = app;