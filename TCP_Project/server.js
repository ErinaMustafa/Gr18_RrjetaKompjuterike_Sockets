
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

      socket.on('data', (data) => {
        const mesazhi = data.toString().trim();
        statistika.trafikuTotalBytes += Buffer.byteLength(data);
        statistika.mesazhePerKlient[adresaKlientit]++;

        console.log(`💬 [${adresaKlientit}]: ${mesazhi}`);
        fs.appendFileSync('server_log.txt', `[${new Date().toISOString()}] ${adresaKlientit}: ${mesazhi}\n`);

        // Kontroll për komandën ADMIN me fjalëkalim:
        // Miraton formatin: "ADMIN <password>"
        if (mesazhi.toUpperCase().startsWith('ADMIN')) {
            const parts = mesazhi.split(' ');
            if (parts.length < 2) {
                socket.write('Përdor: ADMIN <password>\n');
                return;
            }
            const provided = parts.slice(1).join(' ');
            socket.adminAttempts++;
            if (provided === ADMIN_PASSWORD) {
                socket.isAdmin = true;
                socket.write('Identifikim si ADMIN u kry me sukses.\n');
                console.log(`Klienti ${adresaKlientit} u bë ADMIN`);
            } else {
                socket.write('Fjalëkalim i pasaktë.\n');
                // Opsional: blloko pasi tre tentativat dështojnë
                if (socket.adminAttempts >= 3) {
                    socket.write('Shumë tentativë te pasakta. Lidhja po mbyllet.\n');
                    socket.destroy();
                }
            }
            return;
        }
