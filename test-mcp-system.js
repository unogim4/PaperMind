#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5001';

console.log('🚀 PaperMind MCP 시스템 테스트 시작\n');

async function testMCPSystem() {
  try {
    // 1. 서버 상태 확인
    console.log('1️⃣ 서버 상태 확인...');
    const healthResponse = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ 서버 정상:', healthResponse.data.status);
    
    // 2. MCP 상태 확인
    console.log('\n2️⃣ MCP 서비스 상태 확인...');
    const mcpHealthResponse = await axios.get(`${API_BASE}/api/mcp/health`);
    console.log('✅ MCP 서비스:', mcpHealthResponse.data.status);
    console.log('   Claude API:', mcpHealthResponse.data.status.claude);
    
    // 3. 키워드 최적화 테스트
    console.log('\n3️⃣ MCP 키워드 최적화 테스트...');
    const optimizeResponse = await axios.post(`${API_BASE}/api/mcp/optimize-keywords`, {
      userQuery: 'AI 영화 관련 논문을 찾아달라'
    });
    
    if (optimizeResponse.data.success) {
      const data = optimizeResponse.data.data;
      console.log('✅ 키워드 최적화 성공:');
      console.log(`   분석: ${data.analysisKorean}`);
      console.log(`   신뢰도: ${data.confidence}%`);
      console.log(`   키워드: ${data.keywords.join(', ')}`);
      
      // 4. 스마트 검색 테스트
      console.log('\n4️⃣ MCP 스마트 검색 테스트...');
      const searchResponse = await axios.post(`${API_BASE}/api/mcp/smart-search`, {
        userQuery: 'AI 영화 관련 논문을 찾아달라',
        selectedKeyword: data.keywords[0],
        maxResults: 5
      });
      
      if (searchResponse.data.success) {
        const searchData = searchResponse.data.data;
        console.log('✅ 스마트 검색 성공:');
        console.log(`   검색 키워드: ${searchData.searchKeyword}`);
        console.log(`   발견된 논문: ${searchData.papers.length}개`);
        console.log(`   평균 관련성: ${searchData.stats.averageRelevance}점`);
        
        // 상위 3개 논문 출력
        console.log('\n📚 상위 논문 목록:');
        searchData.papers.slice(0, 3).forEach((paper, index) => {
          console.log(`${index + 1}. ${paper.title}`);
          console.log(`   관련성: ${paper.relevanceScore || 50}점`);
          console.log(`   저자: ${paper.authors.map(a => a.name || a).join(', ')}`);
          console.log('');
        });
        
        console.log('🎉 모든 테스트 통과! MCP 시스템이 완벽하게 작동합니다.');
        
      } else {
        console.log('❌ 스마트 검색 실패:', searchResponse.data.message);
      }
      
    } else {
      console.log('❌ 키워드 최적화 실패:', optimizeResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 해결책:');
      console.log('   1. 백엔드 서버가 실행 중인지 확인하세요');
      console.log('   2. cd backend && npm run dev');
      console.log('   3. 포트 5001에서 서버가 실행되는지 확인하세요');
    } else if (error.response?.status === 500) {
      console.log('\n💡 해결책:');
      console.log('   1. .env 파일에 CLAUDE_API_KEY가 설정되어 있는지 확인하세요');
      console.log('   2. Claude API 키가 유효한지 확인하세요');
      console.log('   3. 백엔드 콘솔에서 에러 메시지를 확인하세요');
    }
  }
}

// 테스트 실행
testMCPSystem();