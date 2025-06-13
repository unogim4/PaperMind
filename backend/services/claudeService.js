const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  /**
   * 논문들을 분석하고 관련성 점수 부여
   * @param {Array} papers - arXiv에서 가져온 논문 리스트
   * @param {string} researchTopic - 연구 주제
   * @returns {Array} 분석된 논문 리스트 (관련성 점수 포함)
   */
  async analyzePapers(papers, researchTopic) {
    try {
      console.log(`🤖 Claude analyzing ${papers.length} papers for topic: "${researchTopic}"`);

      const analysisPrompt = this.createAnalysisPrompt(papers, researchTopic);
      
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: analysisPrompt
        }]
      });

      const analysisResult = this.parseAnalysisResponse(response.content[0].text);
      
      // 원본 논문에 분석 결과 추가
      return this.mergePapersWithAnalysis(papers, analysisResult);

    } catch (error) {
      console.error('❌ Claude API Error:', error.message);
      throw new Error(`Paper analysis failed: ${error.message}`);
    }
  }

  /**
   * 논문 분석용 프롬프트 생성
   */
  createAnalysisPrompt(papers, researchTopic) {
    const paperSummaries = papers.map((paper, index) => 
      `${index + 1}. ID: ${paper.id}
Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Abstract: ${paper.summary.substring(0, 500)}...
Categories: ${paper.categories.join(', ')}
---`
    ).join('\n\n');

    return `
You are an expert academic research assistant. I'm researching "${researchTopic}" and need your help analyzing these papers from arXiv.

Please analyze each paper and provide:
1. Relevance score (0-100) - how relevant this paper is to the research topic
2. Key insights - main contributions relevant to the topic
3. Methodology - research methods used
4. Significance - why this paper is important

PAPERS TO ANALYZE:
${paperSummaries}

Please respond in this JSON format:
{
  "analysis": [
    {
      "paper_id": "paper_id_here",
      "relevance_score": 85,
      "key_insights": "Brief summary of key insights",
      "methodology": "Research methods used",
      "significance": "Why this paper matters"
    }
  ]
}

Focus on practical relevance to "${researchTopic}" research.
`;
  }

  /**
   * Claude 응답 파싱
   */
  parseAnalysisResponse(responseText) {
    try {
      // JSON 부분만 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Response parsing error:', error);
      // 파싱 실패 시 기본값 반환
      return { analysis: [] };
    }
  }

  /**
   * 원본 논문과 분석 결과 병합
   */
  mergePapersWithAnalysis(papers, analysisResult) {
    return papers.map(paper => {
      const analysis = analysisResult.analysis?.find(
        a => a.paper_id === paper.id
      );

      return {
        ...paper,
        analysis: analysis || {
          relevance_score: 0,
          key_insights: 'Analysis not available',
          methodology: 'Not analyzed',
          significance: 'Not analyzed'
        }
      };
    }).sort((a, b) => b.analysis.relevance_score - a.analysis.relevance_score);
  }

  /**
   * 연구 주제와 선별된 논문들로 초록 생성
   * @param {Object} researchInfo - 연구 정보
   * @param {Array} selectedPapers - 선별된 논문들
   * @returns {string} 생성된 초록
   */
  async generateAbstract(researchInfo, selectedPapers) {
    try {
      console.log(`📝 Generating abstract for: "${researchInfo.title}"`);

      const abstractPrompt = this.createAbstractPrompt(researchInfo, selectedPapers);
      
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: abstractPrompt
        }]
      });

      // 안전한 응답 처리
      const abstractText = response.content && response.content[0] && response.content[0].text 
        ? response.content[0].text.trim() 
        : 'Abstract generation completed but content is not available';

      return {
        abstract: abstractText,
        wordCount: abstractText.split(' ').length,
        basedOnPapers: selectedPapers.length
      };

    } catch (error) {
      console.error('❌ Abstract generation error:', error.message);
      console.error('Full error:', error);
      throw new Error(`Abstract generation failed: ${error.message}`);
    }
  }

  /**
   * 초록 생성용 프롬프트
   */
  createAbstractPrompt(researchInfo, selectedPapers) {
    // selectedPapers가 비어있거나 잘못된 데이터인 경우 처리
    let paperReferences = '';
    
    if (selectedPapers && selectedPapers.length > 0) {
      paperReferences = selectedPapers.map(paper => {
        // 안전한 속성 접근
        const title = paper?.title || 'Unknown title';
        const authors = paper?.authors && paper.authors.length > 0 
          ? paper.authors[0] 
          : 'Unknown author';
        const year = paper?.published 
          ? paper.published.split('-')[0] 
          : 'Unknown year';
        
        return `- ${title} (${authors} et al., ${year})`;
      }).join('\n');
    } else {
      paperReferences = '- No specific reference papers provided';
    }

    return `
You are an expert academic writer. Please write a structured abstract for this research project.

RESEARCH INFORMATION:
Title: ${researchInfo.title}
Objective: ${researchInfo.objective || 'Not specified'}
Method: ${researchInfo.method || 'Not specified'}
Field: ${researchInfo.field || 'Not specified'}

REFERENCE PAPERS:
${paperReferences}

Please write a professional academic abstract (150-200 words) with these sections:
1. Background/Context
2. Objective  
3. Methods
4. Expected Results/Significance

The abstract should:
- Be scholarly and precise
- Reference the current state of research
- Clearly state the research gap and contribution
- Use appropriate academic language
- Be suitable for journal submission

Write the abstract in ${researchInfo.language || 'English'}.
`;
  }

  /**
   * 논문 요약 생성 (짧은 버전)
   */
  async summarizePaper(paper) {
    try {
      const prompt = `
Please provide a concise summary of this academic paper:

Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Abstract: ${paper.summary}

Provide a 2-3 sentence summary focusing on:
1. Main contribution
2. Key methodology
3. Significance

Keep it concise and accessible.
`;

      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      return response.content[0].text.trim();

    } catch (error) {
      console.error('Paper summary error:', error);
      return 'Summary not available';
    }
  }

  /**
   * API 키 확인
   */
  checkApiKey() {
    return !!process.env.CLAUDE_API_KEY;
  }
}

module.exports = ClaudeService;