
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
