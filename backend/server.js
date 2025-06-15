const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // 포트 변경

// 미들웨어 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// 라우트 설정
app.get('/', (req, res) => {
  res.json({
    message: '🧠 PaperMind Backend Server',
    version: '1.0.0',
    status: 'running',
    features: ['MCP Integration', 'Claude AI', 'arXiv Search']
  });
});

// API 상태 확인
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      nodeVersion: process.version,
      claudeConfigured: !!process.env.CLAUDE_API_KEY
    }
  });
});

// MCP 라우트 연결
try {
  const mcpRoutes = require('./routes/mcp');
  app.use('/api/mcp', mcpRoutes);
  console.log('✅ MCP routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load MCP routes:', error.message);
}

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 핸들링
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
    'GET /',
    'GET /api/health',
    'POST /api/mcp/optimize-keywords',
    'POST /api/mcp/smart-search',
    'POST /api/mcp/generate-abstract',
      'GET /api/mcp/health'
      ]
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 PaperMind Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 MCP endpoints: http://localhost:${PORT}/api/mcp/`);
});

module.exports = app;