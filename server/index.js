require('dotenv').config();
const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const initSocket = require('./socket');

const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);
connectDB().catch(err => console.error('DB connection failed:', err));
httpServer.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));