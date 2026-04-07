require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const initSocket = require('./socket');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);
initSocket(httpServer);
connectDB().catch(err => console.error('DB connection failed:', err));
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));