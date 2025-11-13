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
    socket.write('Server is full, try again later.\n');
    socket.end();
    return;
  }

  const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
  const role = connections.size === 0 ? 'admin' : 'user';
  connections.set(socket, { id: clientId, role, messages: 0, lastActive: Date.now() });

  console.log(` New connection: ${clientId} (${role})`);
  socket.write(`Connected to server as ${role}\n`);

  socket.on('data', async (data) => {
    const client = connections.get(socket);
    if (!client) return;

    totalTraffic += data.length;
    client.lastActive = Date.now();

    const msg = data.toString().trim();
    client.messages++;
    messageLog.push(`[${new Date().toISOString()}] ${client.id}: ${msg}`);
    console.log(` [${client.id}] -> ${msg}`);

    if (client.role === 'admin' && msg.startsWith('/')) {
      await handleAdminCommand(socket, msg);
    } else if (msg.toUpperCase() === 'STATS') {
      sendStats(socket);
    } else {
      socket.write(`Server received: ${msg}\n`);
    }

    updateStatsFile();
  });

  socket.on('end', () => {
    console.log(` ${clientId} disconnected`);
    connections.delete(socket);
    updateStatsFile();
  });

  socket.on('error', () => {
    connections.delete(socket);
    updateStatsFile();
  });

  const interval = setInterval(() => {
    const client = connections.get(socket);
    if (!client) {
      clearInterval(interval);
      return;
    }
    const timeout = client.role === 'admin' ? ADMIN_TIMEOUT : USER_TIMEOUT;
    if (Date.now() - client.lastActive > timeout) {
      socket.write('Timeout, connection closed due to inactivity.\n');
      socket.end();
      connections.delete(socket);
      clearInterval(interval);
      updateStatsFile();
    }
  }, 5000);
});

async function handleAdminCommand(socket, msg) {
  const args = msg.split(' ');
  const cmd = args[0].toLowerCase();

  switch (cmd) {
    case '/list':
      fs.readdir(SERVER_FILES, (err, files) => {
        if (err) return socket.write('Error reading directory\n');
        socket.write('Files:\n' + files.join('\n') + '\n');
      });
      break;

    case '/read':
      if (!args[1]) return socket.write('Usage: /read <filename>\n');
      const readPath = path.join(SERVER_FILES, args[1]);
      if (fs.existsSync(readPath)) {
        const content = fs.readFileSync(readPath, 'utf8');
        socket.write(`\n${args[1]}:\n${content}\n`);
      } else socket.write('File not found.\n');
      break;

    case '/delete':
      if (!args[1]) return socket.write('Usage: /delete <filename>\n');
      const delPath = path.join(SERVER_FILES, args[1]);
      if (fs.existsSync(delPath)) {
        fs.unlinkSync(delPath);
        socket.write('File deleted.\n');
      } else socket.write('File not found.\n');
      break;

    case '/info':
      if (!args[1]) return socket.write('Usage: /info <filename>\n');
      const infoPath = path.join(SERVER_FILES, args[1]);
      if (fs.existsSync(infoPath)) {
        const stats = fs.statSync(infoPath);
        socket.write(
          `Info for ${args[1]}:\nSize: ${stats.size} bytes\nCreated: ${stats.birthtime}\nModified: ${stats.mtime}\n`
        );
      } else socket.write('File not found.\n');
      break;
