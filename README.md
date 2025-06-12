# PaperMind 🧠

> AI-powered academic paper research assistant that finds relevant papers and generates abstracts

## ✨ Features

- **Smart Paper Discovery**: AI-driven paper search and relevance ranking
- **Automatic Abstract Generation**: Generate structured abstracts from research topics
- **MCP Integration**: Advanced AI analysis using Claude's Model Context Protocol
- **User-Friendly Interface**: Clean, intuitive web interface

## 🚀 Quick Start

```bash
# Install all dependencies
npm run install-all

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start the development servers
npm run dev
```

## 📁 Project Structure

```
PaperMind/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── backend/           # Express.js backend
│   ├── routes/
│   ├── services/
│   └── database/
├── mcp-server/        # MCP server for Claude integration
└── docs/             # Documentation
```

## 🛠 Development

1. Clone this repository
2. Run `npm run install-all` to install dependencies
3. Set up your environment variables in `backend/.env`
4. Run `npm run dev` to start all services

## 🔧 Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite
- **AI Integration**: Claude API + MCP Protocol
- **Paper Source**: arXiv API

## 📝 License

MIT License - see LICENSE file for details