const express = require('express');
const router = express.Router();
const ClaudeService = require('../services/claudeService');
const ArxivService = require('../services/arxivService');

const claudeService = new ClaudeService();
const arxivService = new ArxivService();

// MCP 키워드 최적화 API
router.post('/optimize-keywords', async (req, res) => {
  try {
    const { userQuery, language = 'ko' } = req.body;

    if (!userQuery || typeof userQuery !== 'string') {
      return res.status(400).json({
        error: '사용자 요청이 필요합니다.',
        code: 'MISSING_QUERY'
      });
    }

    console.log(`🚀 [MCP] 키워드 최적화 요청: "${userQuery}"`);

    // Claude를 통한 키워드 최적화
    const optimization = await claudeService.optimizeKeywords(userQuery, language);

    console.log(`✅ [MCP] 최적화 완료: ${optimization.keywords.length}개 키워드`);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: optimization
    });

  } catch (error) {
    console.error('❌ [MCP] 키워드 최적화 실패:', error);
    res.status(500).json({
      error: '키워드 최적화에 실패했습니다.',
      message: error.message,
      code: 'OPTIMIZATION_FAILED'
    });
  }
});

// MCP 통합 스마트 검색 API
router.post('/smart-search', async (req, res) => {
  try {
    const { userQuery, selectedKeyword, maxResults = 10 } = req.body;

    if (!userQuery && !selectedKeyword) {
      return res.status(400).json({
        error: '검색어 또는 선택된 키워드가 필요합니다.',
        code: 'MISSING_SEARCH_TERM'
      });
    }

    console.log(`🔍 [MCP] 스마트 검색 시작`);
    console.log(`   - 원본 쿼리: "${userQuery}"`);
    console.log(`   - 선택 키워드: "${selectedKeyword}"`);

    // 1단계: 키워드 최적화 (선택된 키워드가 없을 때만)
    let searchKeyword = selectedKeyword;
    let optimization = null;

    if (!selectedKeyword && userQuery) {
      console.log(`🤖 [MCP] 키워드 자동 최적화 실행`);
      optimization = await claudeService.optimizeKeywords(userQuery);
      searchKeyword = optimization.keywords[0]; // 첫 번째 키워드 사용
    }

    if (!searchKeyword) {
      throw new Error('검색할 키워드를 찾을 수 없습니다.');
    }

    // 2단계: arXiv 검색
    console.log(`📚 [MCP] arXiv 검색: "${searchKeyword}"`);
    const papers = await arxivService.searchPapers(searchKeyword, maxResults);

    if (papers.length === 0) {
      return res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          papers: [],
          searchKeyword,
          optimization,
          message: '검색 결과가 없습니다. 다른 키워드를 시도해보세요.'
        }
      });
    }

    // 3단계: 논문 관련성 분석 (상위 5개만)
    console.log(`🧠 [MCP] AI 분석 시작: ${Math.min(papers.length, 5)}개 논문`);
    const analysisPromises = papers.slice(0, 5).map(paper => 
      claudeService.analyzePaperRelevance(paper, userQuery || selectedKeyword)
    );

    const analyzedPapers = await Promise.all(analysisPromises);
    
    // 나머지 논문들은 기본 점수로 설정
    const remainingPapers = papers.slice(5).map(paper => ({
      ...paper,
      relevanceScore: 50,
      aiAnalysis: {
        reasoning: '상위 5개 논문만 AI 분석이 적용됩니다.',
        keyInsights: [],
        methodology: '분석되지 않음'
      }
    }));

    const allPapers = [...analyzedPapers, ...remainingPapers];

    // 관련성 점수순으로 정렬
    allPapers.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    console.log(`✅ [MCP] 스마트 검색 완료: ${allPapers.length}개 논문, 평균 관련성 ${
      Math.round(allPapers.reduce((sum, p) => sum + (p.relevanceScore || 0), 0) / allPapers.length)
    }점`);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        papers: allPapers,
        searchKeyword,
        optimization,
        stats: {
          totalPapers: allPapers.length,
          averageRelevance: Math.round(allPapers.reduce((sum, p) => sum + (p.relevanceScore || 0), 0) / allPapers.length),
          analyzedPapers: Math.min(papers.length, 5)
        }
      }
    });

  } catch (error) {
    console.error('❌ [MCP] 스마트 검색 실패:', error);
    res.status(500).json({
      error: '스마트 검색에 실패했습니다.',
      message: error.message,
      code: 'SMART_SEARCH_FAILED'
    });
  }
});

// MCP 상태 확인 API
router.get('/health', async (req, res) => {
  try {
    const status = {
      mcp: 'healthy',
      claude: process.env.CLAUDE_API_KEY ? 'configured' : 'not_configured',
      arxiv: 'healthy',
      timestamp: new Date().toISOString()
    };

    // Claude API 간단 테스트
    if (process.env.CLAUDE_API_KEY) {
      try {
        await claudeService.optimizeKeywords('test query');
        status.claude = 'working';
      } catch (error) {
        status.claude = 'error';
        status.claudeError = error.message;
      }
    }

    res.json({
      success: true,
      status,
      message: 'MCP 서비스가 정상 작동 중입니다.'
    });

  } catch (error) {
    res.status(500).json({
      error: 'MCP 상태 확인 실패',
      message: error.message
    });
  }
});

// MCP 초록 생성 API
router.post('/generate-abstract', async (req, res) => {
  try {
    const { researchInfo, referencePapers, searchKeyword } = req.body;

    // 입력 검증
    if (!researchInfo || !researchInfo.title) {
      return res.status(400).json({
        error: '연구 제목이 필요합니다.',
        code: 'MISSING_TITLE'
      });
    }

    if (!referencePapers || referencePapers.length === 0) {
      return res.status(400).json({
        error: '참고할 논문이 최소 1개 이상 필요합니다.',
        code: 'MISSING_PAPERS'
      });
    }

    console.log(`📝 [MCP] 초록 생성 요청: "${researchInfo.title}"`);
    console.log(`   - 참고논문: ${referencePapers.length}개`);
    console.log(`   - 검색키워드: "${searchKeyword}"`);

    // Claude를 통한 초록 생성
    const abstractResult = await claudeService.generateAbstract(
      researchInfo, 
      referencePapers, 
      searchKeyword
    );

    console.log(`✅ [MCP] 초록 생성 완료: ${abstractResult.wordCount}자`);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: abstractResult
    });

  } catch (error) {
    console.error('❌ [MCP] 초록 생성 실패:', error);
    res.status(500).json({
      error: '초록 생성에 실패했습니다.',
      message: error.message,
      code: 'ABSTRACT_GENERATION_FAILED'
    });
  }
});

// 키워드 검증 API
router.post('/validate-keyword', async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({
        error: '키워드가 필요합니다.',
        code: 'MISSING_KEYWORD'
      });
    }

    // 간단한 검색으로 결과 개수 확인
    const papers = await arxivService.searchPapers(keyword, 5);
    
    res.json({
      success: true,
      keyword,
      resultCount: papers.length,
      valid: papers.length > 0,
      message: papers.length > 0 ? 
        `"${keyword}"로 ${papers.length}개의 논문을 찾았습니다.` :
        `"${keyword}"에 대한 검색 결과가 없습니다.`
    });

  } catch (error) {
    res.status(500).json({
      error: '키워드 검증 실패',
      message: error.message
    });
  }
});

module.exports = router;