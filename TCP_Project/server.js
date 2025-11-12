const net = require('net');
const fs = require('fs');
const path = require('path');

const PORT = 6000;
const HOST = '0.0.0.0';
const MAX_CONNECTIONS = 5;
const USER_TIMEOUT = 30000;
const ADMIN_TIMEOUT = 10000;
let connections = new Map();
let totalTraffic = 0;
let messageLog = [];
const STATS_FILE = 'server_stats.txt';
const SERVER_FILES = './server_files';

if (!fs.existsSync(SERVER_FILES)) fs.mkdirSync(SERVER_FILES);

const server = net.createServer((socket) => {
  if (connections.size >= MAX_CONNECTIONS) {
    socket.write(' Server is full, try again later.\n');
    socket.end();
    return;
  }

  const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
  const role = connections.size === 0 ? 'admin' : 'user';
  connections.set(socket, { id: clientId, role, messages: 0, lastActive: Date.now() });

  
