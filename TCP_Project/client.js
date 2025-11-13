
const net = require('net');
const readline = require('readline');

const SERVER_IP = '127.0.0.1'; 
const SERVER_PORT = 4000;


const klient = new net.Socket();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

klient.connect(SERVER_PORT, SERVER_IP, () => {
    console.log(' Lidhja me server u kry me sukses!');
    console.log('Shkruaj "ADMIN" për të hyrë si admin (do të kërkohet fjalëkalimi), ose shkruaj mesazh normal:');
});

klient.on('data', (data) => {
    console.log(` Nga serveri: ${data.toString()}`);
});

klient.on('close', () => {
    console.log(' Lidhja me serverin u mbyll.');
    process.exit(0);
});