const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  // MCP 키워드 최적화 - 자연어를 학술 검색어로 변환
  async optimizeKeywords(userQuery, language = 'ko') {
    try {
      console.log(`🤖 [Claude] MCP 키워드 최적화 요청: "${userQuery}"`);
      
      const prompt = `당신은 학술 논문 검색 전문가입니다. 사용자의 자연어 요청을 분석해서 arXiv에서 효과적인 검색을 위한 최적화된 영어 키워드들을 생성해주세요.

사용자 요청: "${userQuery}"

다음 형식으로 정확히 응답해주세요:

{
  "originalQuery": "${userQuery}",
  "analysisKorean": "사용자 요청에 대한 간단한 분석 (한국어)",
  "strategy": "검색 전략 설명 (한국어)", 
  "keywords": [
    "keyword1",
    "keyword2", 
    "keyword3",
    "keyword4",
    "keyword5"
  ],
  "confidence": 85,
  "reasoning": "이 키워드들을 선택한 이유 (한국어)"
}

규칙:
1. keywords는 반드시 영어로 작성
2. arXiv 검색에 최적화된 학술 용어 사용
3. 5개의 키워드 생성 (구체적 → 일반적 순서)
4. confidence는 60-95 사이의 숫자
5. JSON 형식만 응답 (다른 텍스트 추가 금지)`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const responseText = message.content[0].text.trim();
      console.log(`📝 [Claude] Raw response: ${responseText}`);

      // JSON 파싱 시도
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('⚠️ [Claude] JSON 파싱 실패, 텍스트에서 키워드 추출 시도');
        result = this.extractKeywordsFromText(responseText, userQuery);
      }

      // 결과 검증 및 기본값 설정
      if (!result.keywords || !Array.isArray(result.keywords) || result.keywords.length === 0) {
        console.warn('⚠️ [Claude] 키워드 추출 실패, 기본 키워드 사용');
        result = this.generateFallbackKeywords(userQuery);
      }

      console.log(`✅ [Claude] 최적화 완료: ${result.keywords.length}개 키워드 생성`);
      return result;

    } catch (error) {
      console.error('❌ [Claude] MCP 최적화 실패:', error.message);
      return this.generateFallbackKeywords(userQuery);
    }
  }

  // 텍스트에서 키워드 추출 (JSON 파싱 실패 시 백업)
  extractKeywordsFromText(text, originalQuery) {
    const lines = text.split('\n');
    const keywords = [];
    
    // "keyword" 또는 따옴표로 둘러싸인 영어 단어들 찾기
    for (const line of lines) {
      const englishMatches = line.match(/"([a-zA-Z\s]+)"/g);
      if (englishMatches) {
        englishMatches.forEach(match => {
          const keyword = match.replace(/"/g, '').trim();
          if (keyword && keyword.length > 2 && keywords.length < 5) {
            keywords.push(keyword);
          }
        });
      }
    }

    return {
      originalQuery,
      analysisKorean: "텍스트에서 키워드를 추출했습니다.",
      strategy: "Claude 응답에서 추출한 검색어",
      keywords: keywords.length > 0 ? keywords : this.getDefaultKeywords(originalQuery),
      confidence: 65,
      reasoning: "텍스트 파싱을 통해 추출된 키워드"
    };
  }

  // 기본 키워드 생성 (모든 방법 실패 시)
  generateFallbackKeywords(userQuery) {
    const keywordMap = {
      '영화': ['film production', 'cinema technology', 'movie industry', 'film studies', 'entertainment technology'],
      '의료': ['medical imaging', 'healthcare AI', 'clinical diagnosis', 'medical technology', 'biomedical engineering'],
      '자율주행': ['autonomous driving', 'self driving cars', 'vehicle automation', 'transportation AI', 'robotics navigation'],
      '교육': ['educational technology', 'learning systems', 'online education', 'e-learning platforms', 'educational AI'],
      '딥러닝': ['deep learning', 'neural networks', 'machine learning', 'artificial intelligence', 'computer vision'],
      'AI': ['artificial intelligence', 'machine learning', 'neural networks', 'deep learning', 'AI applications']
    };

    let keywords = ['artificial intelligence', 'machine learning', 'computer science', 'technology research', 'data analysis'];

    // 한국어 키워드 매칭
    for (const [korean, english] of Object.entries(keywordMap)) {
      if (userQuery.includes(korean)) {
        keywords = english;
        break;
      }
    }

    return {
      originalQuery: userQuery,
      analysisKorean: "기본 키워드 매핑을 사용했습니다.",
      strategy: "사전 정의된 키워드 매핑",
      keywords,
      confidence: 60,
      reasoning: "사용자 요청에서 주요 키워드를 매핑하여 생성"
    };
  }

  // MCP 초록 생성 - 선택된 논문들을 바탕으로 학술 초록 생성
  async generateAbstract(researchInfo, referencePapers, searchKeyword) {
    try {
      console.log(`📝 [Claude] MCP 초록 생성 요청: "${researchInfo.title}"`);
      
      // 참고논문 정보 요약
      const paperSummaries = referencePapers.slice(0, 5).map((paper, index) => {
        return `${index + 1}. ${paper.title}\n   저자: ${paper.authors?.map(a => a.name || a).join(', ') || 'Unknown'}\n   초록: ${(paper.summary || '').substring(0, 200)}...\n   관련성: ${paper.relevanceScore || 50}점`;
      }).join('\n\n');

      const prompt = `당신은 학술 논문 작성 전문가입니다. 주어진 연구 정보와 참고논문들을 바탕으로 고품질의 학술 초록을 생성해주세요.

연구 정보:
- 제목: ${researchInfo.title}
- 목적: ${researchInfo.objective || '명시되지 않음'}
- 방법론: ${researchInfo.methodology || '명시되지 않음'}
- 기대 결과: ${researchInfo.expectedResults || '명시되지 않음'}
- 검색 키워드: ${searchKeyword || '명시되지 않음'}

참고 논문들:
${paperSummaries}

다음 형식으로 정확히 응답해주세요:

{
  "abstract": "생성된 초록 내용 (한국어, 150-300단어)",
  "wordCount": 250,
  "structure": {
    "background": "배경 및 동기",
    "objective": "연구 목적",
    "methodology": "연구 방법",
    "expectedResults": "기대 효과",
    "significance": "연구의 의의"
  },
  "confidence": 85,
  "suggestions": ["개선 제안 1", "개선 제안 2"],
  "referencedPapers": ["활용된 주요 논문 제목들"]
}

규칙:
1. 학술적이고 전문적인 톤 유지
2. 논리적 흐름으로 구성 (배경→목적→방법→결과→의의)
3. 참고논문의 핵심 내용을 자연스럽게 반영
4. 구체적이고 측정 가능한 표현 사용
5. JSON 형식만 응답 (다른 텍스트 추가 금지)`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const responseText = message.content[0].text.trim();
      console.log(`📝 [Claude] 초록 생성 응답 수신`);

      // JSON 파싱 시도
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('⚠️ [Claude] JSON 파싱 실패, 텍스트에서 초록 추출 시도');
        result = this.extractAbstractFromText(responseText, researchInfo);
      }

      // 결과 검증 및 기본값 설정
      if (!result.abstract || result.abstract.length < 50) {
        console.warn('⚠️ [Claude] 초록 생성 실패, 기본 초록 생성');
        result = this.generateFallbackAbstract(researchInfo, referencePapers);
      }

      console.log(`✅ [Claude] 초록 생성 완료: ${result.wordCount || result.abstract.length}자`);
      return result;

    } catch (error) {
      console.error('❌ [Claude] 초록 생성 실패:', error.message);
      return this.generateFallbackAbstract(researchInfo, referencePapers);
    }
  }

  // 텍스트에서 초록 추출 (JSON 파싱 실패 시 백업)
  extractAbstractFromText(text, researchInfo) {
    // 텍스트에서 초록 부분을 찾아 추출
    const lines = text.split('\n');
    let abstractText = '';
    
    for (const line of lines) {
      if (line.trim().length > 100 && !line.includes('{') && !line.includes('}')) {
        abstractText = line.trim();
        break;
      }
    }

    if (!abstractText) {
      abstractText = text.replace(/[{}"]/g, '').substring(0, 300) + '...';
    }

    return {
      abstract: abstractText,
      wordCount: abstractText.length,
      structure: {
        background: '배경 정보 추출됨',
        objective: researchInfo.objective || '목적 명시 필요',
        methodology: researchInfo.methodology || '방법론 명시 필요',
        expectedResults: '결과 예상됨',
        significance: '연구 의의 있음'
      },
      confidence: 60,
      suggestions: ['더 구체적인 연구 정보 제공', '참고논문 추가 검토'],
      referencedPapers: ['텍스트 파싱으로 추출된 내용']
    };
  }

  // 기본 초록 생성 (모든 방법 실패 시)
  generateFallbackAbstract(researchInfo, referencePapers) {
    const abstract = `${researchInfo.title}에 관한 연구이다. ${researchInfo.objective || '본 연구의 목적은 해당 분야의 발전에 기여하는 것이다.'} ${researchInfo.methodology || '체계적인 연구 방법론을 통해 분석을 수행한다.'} ${referencePapers.length}개의 관련 논문을 참고하여 ${researchInfo.expectedResults || '의미있는 결과를 도출할 것으로 기대된다.'} 본 연구는 해당 분야의 이론적 토대를 강화하고 실무적 시사점을 제공할 것이다.`;

    return {
      abstract,
      wordCount: abstract.length,
      structure: {
        background: '연구 배경',
        objective: researchInfo.objective || '연구 목적',
        methodology: researchInfo.methodology || '연구 방법',
        expectedResults: researchInfo.expectedResults || '기대 결과',
        significance: '연구의 의의'
      },
      confidence: 50,
      suggestions: ['더 구체적인 연구 계획 수립', '추가 문헌 조사'],
      referencedPapers: referencePapers.slice(0, 3).map(p => p.title)
    };
  }

  // 개별 논문 관련성 분석
  async analyzePaperRelevance(paper, searchContext) {
    try {
      const prompt = `논문 관련성을 분석해주세요.

검색 맥락: "${searchContext}"

논문 정보:
- 제목: ${paper.title}
- 저자: ${paper.authors?.map(a => a.name || a).join(', ') || '저자 정보 없음'}
- 초록: ${paper.summary || '초록 없음'}
- 카테고리: ${paper.category || '카테고리 없음'}

다음 형식으로 응답:
{
  "relevanceScore": 85,
  "reasoning": "관련성이 높은 이유",
  "keyInsights": ["핵심 인사이트 1", "핵심 인사이트 2"],
  "methodology": "연구 방법론"
}

점수 기준: 90-100(매우 관련), 70-89(관련), 50-69(부분 관련), 30-49(약간 관련), 0-29(무관련)`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      const result = JSON.parse(message.content[0].text.trim());
      return {
        ...paper,
        relevanceScore: result.relevanceScore || 50,
        aiAnalysis: {
          reasoning: result.reasoning || '분석 결과 없음',
          keyInsights: result.keyInsights || [],
          methodology: result.methodology || '방법론 정보 없음'
        }
      };

    } catch (error) {
      console.error('논문 분석 실패:', error);
      return {
        ...paper,
        relevanceScore: 50,
        aiAnalysis: {
          reasoning: '분석 실패',
          keyInsights: [],
          methodology: '정보 없음'
        }
      };
    }
  }
}

module.exports = ClaudeService;