
const net = require('net');
const readline = require('readline');

const SERVER_IP = '127.0.0.1'; 
const SERVER_PORT = 4000;


const klient = new net.Socket();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});