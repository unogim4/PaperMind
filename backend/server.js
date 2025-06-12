const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.get('/', (req, res) => {
  res.json({
    message: '🧠 PaperMind Backend Server',
    version: '1.0.0',
    status: 'running'
  });
});

// API 상태 확인
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 핸들링
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 PaperMind Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;