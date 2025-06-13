const express = require('express');
const ArxivService = require('../services/arxivService');
const ClaudeService = require('../services/claudeService');

const router = express.Router();
const arxivService = new ArxivService();
const claudeService = new ClaudeService();

/**
 * POST /api/research/analyze
 * 연구 주제 분석 - 논문 검색 + AI 분석
 */
router.post('/analyze', async (req, res) => {
  try {
    const { researchTopic, maxPapers = 10, searchType = 'general' } = req.body;

    if (!researchTopic) {
      return res.status(400).json({
        error: 'Research topic is required'
      });
    }

    // Claude API 키 확인
    if (!claudeService.checkApiKey()) {
      return res.status(500).json({
        error: 'Claude API key not configured',
        message: 'Please set CLAUDE_API_KEY in your environment variables'
      });
    }

    console.log(`🔍 Starting research analysis for: "${researchTopic}"`);

    // 1단계: arXiv에서 논문 검색
    let papers;
    switch (searchType) {
      case 'category':
        papers = await arxivService.searchByCategory(researchTopic, maxPapers);
        break;
      case 'author':
        papers = await arxivService.searchByAuthor(researchTopic, maxPapers);
        break;
      default:
        papers = await arxivService.searchPapers(researchTopic, maxPapers);
    }

    if (papers.length === 0) {
      return res.json({
        success: true,
        message: 'No papers found for this topic',
        researchTopic,
        papers: []
      });
    }

    // 2단계: Claude로 논문 분석
    const analyzedPapers = await claudeService.analyzePapers(papers, researchTopic);

    res.json({
      success: true,
      researchTopic,
      totalPapers: papers.length,
      analyzedPapers: analyzedPapers.map(paper => ({
        ...paper,
        // 긴 초록은 잘라서 전송
        summary: paper.summary.length > 300 
          ? paper.summary.substring(0, 300) + '...'
          : paper.summary
      })),
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

/**
 * POST /api/research/generate-abstract
 * 초록 생성
 */
router.post('/generate-abstract', async (req, res) => {
  try {
    const { researchInfo, selectedPaperIds } = req.body;

    if (!researchInfo || !researchInfo.title) {
      return res.status(400).json({
        error: 'Research information with title is required'
      });
    }

    if (!claudeService.checkApiKey()) {
      return res.status(500).json({
        error: 'Claude API key not configured'
      });
    }

    // selectedPaperIds가 있으면 실제 논문 데이터를 가져와야 함
    // 지금은 임시로 빈 배열 사용 (데이터베이스 없음)
    let selectedPapers = [];
    
    if (selectedPaperIds && selectedPaperIds.length > 0) {
      // 실제 구현에서는 데이터베이스에서 가져와야 함
      // 지금은 모크 데이터 사용
      selectedPapers = selectedPaperIds.map(id => ({
        id: id,
        title: `Reference Paper ${id}`,
        authors: ['Author Name'],
        published: '2023-01-01'
      }));
    }

    console.log(`📝 Generating abstract for: "${researchInfo.title}"`);

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

/**
 * POST /api/research/summarize-paper
 * 개별 논문 요약
 */
router.post('/summarize-paper', async (req, res) => {
  try {
    const { paperId } = req.body;

    if (!paperId) {
      return res.status(400).json({
        error: 'Paper ID is required'
      });
    }

    // 실제로는 데이터베이스나 캐시에서 논문 정보를 가져와야 함
    // 지금은 arXiv API로 다시 검색
    const papers = await arxivService.searchPapers(paperId, 1);
    
    if (papers.length === 0) {
      return res.status(404).json({
        error: 'Paper not found'
      });
    }

    const summary = await claudeService.summarizePaper(papers[0]);

    res.json({
      success: true,
      paperId,
      summary,
      paper: papers[0]
    });

  } catch (error) {
    console.error('Paper summarization error:', error);
    res.status(500).json({
      error: 'Paper summarization failed',
      message: error.message
    });
  }
});

/**
 * GET /api/research/test-claude
 * Claude API 연결 테스트
 */
router.get('/test-claude', async (req, res) => {
  try {
    if (!claudeService.checkApiKey()) {
      return res.status(500).json({
        success: false,
        error: 'Claude API key not configured',
        message: 'Please set CLAUDE_API_KEY in your environment variables'
      });
    }

    // 간단한 테스트 요청
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

module.exports = router;