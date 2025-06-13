import React, { useState, useEffect } from 'react';

const PaperAnalysis = ({ researchTopic, researchData, onAnalysisComplete }) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    // 실제 API 데이터 사용
    if (researchData && researchData.analysisData) {
      loadRealData();
    } else {
      // 폴백으로 시뮤레이션 데이터 사용
      simulateAnalysis();
    }
  }, [researchTopic, researchData]);

  const loadRealData = () => {
    setLoading(true);
    try {
      const apiData = researchData.analysisData;
      if (apiData.success && apiData.analyzedPapers) {
        // API 응답을 한국어로 번역
        const translatedPapers = apiData.analyzedPapers.map(paper => ({
          ...paper,
          analysis: {
            ...paper.analysis,
            key_insights: translateToKorean(paper.analysis.key_insights),
            methodology: translateToKorean(paper.analysis.methodology),
            significance: translateToKorean(paper.analysis.significance)
          }
        }));
        setPapers(translatedPapers);
      } else {
        console.log('실제 API 데이터 없음, 모크 데이터 사용');
        simulateAnalysis();
      }
    } catch (error) {
      console.error('실제 데이터 로드 오류:', error);
      simulateAnalysis();
    } finally {
      setLoading(false);
    }
  };

  // 간단한 한국어 번역 (실제로는 번역 API 사용 가능)
  const translateToKorean = (englishText) => {
    const translations = {
      'Reveals significant vulnerabilities': 'BERT 모델의 주요 취약점을 발견',
      'Comparative analysis': '비교 분석 연구',
      'Introduces a novel': '새로운 접근법을 소개',
      'Critical for understanding': '이해에 중요한 연구',
      'Provides valuable insights': '귀중한 통찰력을 제공',
      'Demonstrates how': '어떻게 가능한지를 보여줌'
    };
    
    let translatedText = englishText;
    Object.keys(translations).forEach(key => {
      if (translatedText.includes(key)) {
        translatedText = translatedText.replace(key, translations[key]);
      }
    });
    
    return translatedText;
  };

  const simulateAnalysis = () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockPapers = [
        {
          id: "2109.11308",
          title: "Breaking BERT: Understanding its Vulnerabilities for Named Entity Recognition through Adversarial Attack",
          authors: ["Anne Dirkson", "Suzan Verberne", "Wessel Kraaij"],
          summary: "Both generic and domain-specific BERT models are widely used for natural language processing (NLP) tasks. In this paper we investigate the vulnerability of BERT models to variation in input data for Named Entity Recognition (NER) through adversarial attack...",
          published: "2021-09-23T11:47:27Z",
          categories: ["cs.CL", "cs.IR"],
          pdfUrl: "http://arxiv.org/pdf/2109.11308v3",
          arxivUrl: "http://arxiv.org/abs/2109.11308v3",
          analysis: {
            relevance_score: 95,
            key_insights: "BERT 모델의 개체명 인식에서 적대적 공격을 통한 중대한 취약점을 발견. 20-45%의 개체가 문맥 변화로 완전히 잘못 분류될 수 있음을 보여줌.",
            methodology: "적대적 공격 테스트, BERT 모델 견고성의 체계적 평가",
            significance: "프로덕션 환경에서 BERT의 한계를 이해하는 데 중요한 연구."
          }
        },
        {
          id: "2103.11792",
          title: "Comparing the Performance of NLP Toolkits and Evaluation measures in Legal Tech",
          authors: ["Muhammad Zohaib Khan"],
          summary: "Recent developments in Natural Language Processing have led to the introduction of state-of-the-art Neural Language Models, enabled with unsupervised transferable learning, using different pretraining objectives...",
          published: "2021-03-12T11:06:32Z",
          categories: ["cs.CL", "cs.LG"],
          pdfUrl: "http://arxiv.org/pdf/2103.11792v1",
          arxivUrl: "http://arxiv.org/abs/2103.11792v1",
          analysis: {
            relevance_score: 85,
            key_insights: "법률 도메인에서 XLNet과 BERT 모델의 비교 분석, 도메인 적응 기술과 성능 평가에 초점을 맞춤.",
            methodology: "신경 언어 모델의 비교 분석, 실증적 평가",
            significance: "BERT 모델의 도메인 적응에 대한 귀중한 통찰력 제공."
          }
        },
        {
          id: "2201.02010",
          title: "Self-Training Vision Language BERTs with a Unified Conditional Model",
          authors: ["Xiaofeng Yang", "Fengmao Lv", "Fayao Liu", "Guosheng Lin"],
          summary: "Natural language BERTs are trained with language corpus in a self-supervised manner. Unlike natural language BERTs, vision language BERTs need paired data to train...",
          published: "2022-01-06T11:00:52Z",
          categories: ["cs.CV", "cs.CL"],
          pdfUrl: "http://arxiv.org/pdf/2201.02010v2",
          arxivUrl: "http://arxiv.org/abs/2201.02010v2",
          analysis: {
            relevance_score: 80,
            key_insights: "라벨이 없는 이미지 데이터를 사용한 Vision Language BERT의 새로운 자가 훈련 접근법 소개.",
            methodology: "자기 지도 학습, 조건부 모델링, 제로샷 학습 기술",
            significance: "BERT 아키텍처가 멀티모달 작업에 적응될 수 있음을 보여줌."
          }
        }
      ];

      setPapers(mockPapers);
      setLoading(false);
    }, 2000);
  };

  const handlePaperToggle = (paperId) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  const handleContinue = () => {
    const selectedPaperData = papers.filter(paper => 
      selectedPapers.includes(paper.id)
    );
    onAnalysisComplete(selectedPaperData);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">논문 분석 중</h2>
          <p className="text-gray-600 mb-4">
            <strong>"{researchTopic}"</strong> 주제로<br/>AI가 논문을 분석하고 있습니다
          </p>
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 카드 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">논문 분석 결과</h2>
              <p className="text-gray-600">
                <strong>"{researchTopic}"</strong> 주제로 <span className="font-bold text-blue-600">{papers.length}개</span> 논문 발견
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              >
                <option value="relevance">관련성순</option>
                <option value="date">최신순</option>
                <option value="title">제목순</option>
              </select>
              
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                {selectedPapers.length}개 선택
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 논문 카드들 */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className={`bg-white rounded-2xl shadow-md transition-all duration-200 ${
              selectedPapers.includes(paper.id)
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-lg'
            }`}
          >
            <div className="p-6">
              {/* 논문 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {/* 관련성 점수 */}
                    <div className={`${getScoreColor(paper.analysis.relevance_score)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                      {paper.analysis.relevance_score}% 관련
                    </div>
                    
                    {/* 카테고리 */}
                    {paper.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {category}
                      </span>
                    ))}
                    
                    {/* 날짜 */}
                    <span className="text-sm text-gray-500">
                      {new Date(paper.published).getFullYear()}년
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                    {paper.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    저자: {paper.authors.join(', ')}
                  </p>
                </div>
                
                {/* 체크박스 */}
                <label className="flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={selectedPapers.includes(paper.id)}
                    onChange={() => handlePaperToggle(paper.id)}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">선택</span>
                </label>
              </div>

              {/* 초록 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-gray-900 mb-2 text-sm">📄 초록</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {paper.summary.length > 300 
                    ? `${paper.summary.substring(0, 300)}...` 
                    : paper.summary}
                </p>
              </div>

              {/* AI 분석 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-sm">
                  <span className="text-lg mr-2">🤖</span>
                  AI 분석 결과
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold text-gray-800 mb-1 text-xs">💡 핵심 인사이트</h5>
                    <p className="text-sm text-gray-700">{paper.analysis.key_insights}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-gray-800 mb-1 text-xs">🔬 연구 방법</h5>
                    <p className="text-sm text-gray-700">{paper.analysis.methodology}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-gray-800 mb-1 text-xs">⭐ 연구 의의</h5>
                    <p className="text-sm text-gray-700">{paper.analysis.significance}</p>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex space-x-2">
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                >
                  📄 PDF
                </a>
                <a
                  href={paper.arxivUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  🔗 arXiv
                </a>
                <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors">
                  📋 요약
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 액션 카드 */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">선택된 논문으로 초록 생성</h3>
              <p className="text-sm text-gray-600">
                {selectedPapers.length > 0 
                  ? `${selectedPapers.length}개 논문이 선택되었습니다` 
                  : '논문을 선택해주세요'}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedPapers(papers.map(p => p.id))}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                전체 선택
              </button>
              
              <button
                onClick={() => setSelectedPapers([])}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                선택 해제
              </button>
              
              <button
                onClick={handleContinue}
                disabled={selectedPapers.length === 0}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  selectedPapers.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                }`}
              >
                📝 초록 생성 ({selectedPapers.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperAnalysis;