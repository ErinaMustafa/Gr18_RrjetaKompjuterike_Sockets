
const net = require('net');
const fs = require('fs');
const path = require('path');

const PORTI = 4000;
const IP_ADRESA = '0.0.0.0';
const MAKS_KLIENTE = 4;


const ADMIN_PASSWORD = 'letmein';

if (!fs.existsSync('./server_files')) fs.mkdirSync('./server_files');

let klientet = [];
let statistika = {
    lidhjeAktive: 0,
    mesazhePerKlient: {},
    trafikuTotalBytes: 0,
};

setInterval(() => {
    let statsData = `${new Date().toLocaleString()}\n` +
        `Lidhje aktive: ${statistika.lidhjeAktive}\n` +
        `Trafik total: ${statistika.trafikuTotalBytes} bytes\n` +
        `------------------------------\n`;
    fs.writeFileSync('server_stats.txt', statsData);
}, 10000);

const server = net.createServer((socket) => {

    if (klientet.length >= MAKS_KLIENTE) {
        socket.write('Serveri është i mbushur. Prit pak...\n');
        socket.destroy();
        return;
    }

    const adresaKlientit = `${socket.remoteAddress}:${socket.remotePort}`;
    socket.isAdmin = false;
    socket.adminAttempts = 0; 
    klientet.push(socket);
    statistika.lidhjeAktive++;
    statistika.mesazhePerKlient[adresaKlientit] = 0;

    console.log(` Klient i ri u lidh: ${adresaKlientit}`);

    socket.setTimeout(30000);
    socket.on('timeout', () => {
        socket.write('Nuk u dërgua asnjë mesazh për 30 sekonda, lidhja po mbyllet.\n');
        socket.destroy();
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

      case '/search':
      if (!args[1]) return socket.write('Usage: /search <keyword>\n');
      fs.readdir(SERVER_FILES, (err, files) => {
        if (err) return socket.write('Error reading directory\n');
        const matches = files.filter(f => f.includes(args[1]));
        socket.write('Found:\n' + (matches.join('\n') || 'No matches') + '\n');
      });
      break;

    default:
      socket.write('Unknown command.\n');
  }
}

function sendStats(socket) {
  const stats = `
Active connections: ${connections.size}
Clients:
${Array.from(connections.values())
  .map(c => ` - ${c.id} (${c.role}) [${c.messages} msgs]`)
  .join('\n')}
Total traffic: ${totalTraffic} bytes
`;
  socket.write(stats + '\n');
}

function updateStatsFile() {
  const content = `
Time: ${new Date().toISOString()}
Active connections: ${connections.size}
Total traffic: ${totalTraffic} bytes
Clients:
${Array.from(connections.values())
  .map(c => ` - ${c.id} (${c.role}) [${c.messages} msgs]`)
  .join('\n')}
`;
  fs.writeFileSync(STATS_FILE, content);
}

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});