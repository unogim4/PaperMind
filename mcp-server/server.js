const dotenv = require('dotenv');
const WebSocket = require('ws');

// 환경변수 로드
dotenv.config();

class MCPServer {
  constructor() {
    this.port = process.env.MCP_PORT || 3001;
    this.wss = null;
  }

  start() {
    this.wss = new WebSocket.Server({ port: this.port });
    
    console.log(`🔌 MCP Server started on port ${this.port}`);
    
    this.wss.on('connection', (ws) => {
      console.log('📡 New MCP client connected');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing message:', error);
          ws.send(JSON.stringify({
            error: 'Invalid JSON message'
          }));
        }
      });
      
      ws.on('close', () => {
        console.log('🔌 MCP client disconnected');
      });
      
      // 연결 확인 메시지
      ws.send(JSON.stringify({
        type: 'connection',
        message: '🧠 PaperMind MCP Server connected',
        timestamp: new Date().toISOString()
      }));
    });
  }

  handleMessage(ws, data) {
    console.log('📨 Received message:', data);
    
    switch (data.action) {
      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        break;
        
      case 'analyzePapers':
        this.analyzePapers(ws, data.payload);
        break;
        
      case 'generateAbstract':
        this.generateAbstract(ws, data.payload);
        break;
        
      default:
        ws.send(JSON.stringify({
          error: `Unknown action: ${data.action}`
        }));
    }
  }

  analyzePapers(ws, payload) {
    // TODO: Claude API를 통한 논문 분석 로직
    console.log('🔍 Analyzing papers:', payload);
    
    ws.send(JSON.stringify({
      type: 'analysis_result',
      result: {
        status: 'completed',
        message: 'Paper analysis completed (mock)',
        papers: payload.papers || []
      }
    }));
  }

  generateAbstract(ws, payload) {
    // TODO: Claude API를 통한 초록 생성 로직
    console.log('📝 Generating abstract:', payload);
    
    ws.send(JSON.stringify({
      type: 'abstract_result',
      result: {
        status: 'completed',
        abstract: 'Generated abstract (mock implementation)',
        wordCount: 150
      }
    }));
  }
}

// 서버 시작
const server = new MCPServer();
server.start();

module.exports = MCPServer;