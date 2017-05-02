// ws-client.rx.js

'use strict';

const Rx = require('rx');

let index = 0;

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const readlineSubject = new Rx.Subject();
rl.on('line', (line) => {
    readlineSubject.onNext({
        index: index++,
        content: line
    });
    rl.prompt();
}).on('error', (error) => {
    readlineSubject.onError(error);
}).on('close', () => {
    readlineSubject.onCompleted();
});

const socketSubject = new Rx.Subject();
const socket = require('socket.io-client')('ws://localhost:22222/', {
    transports: [
        'websocket'
    ]
});
socket.on('connect', () => {
    socketSubject.onNext({
        type: 'online'
    });

    socket.on('disconnect', () => {
        socketSubject.onNext({
            type: 'offline'
        });
    });

    socket.on('message', (message) => {
        socketSubject.onNext({
            type: 'message',
            content: message
        });
    });
});

socketSubject.filter((x) => {
    return x.type === 'online';
}).subscribe(() => {
    console.log(`${socket.id} joint.`);

    readlineSubject.subscribe((line) => {
        console.log(`${socket.id} says: "(${line.index}) ${line.content}".`);
        socket.emit('message', line);
    }, () => {}, () => {
        socket.disconnect();
    });
});

socketSubject.filter((x) => {
    return x.type === 'message';
}).subscribe((x) => {
    console.log(x.content);
});

socketSubject.filter((x) => {
    return x.type === 'offline';
}).subscribe(() => {
    console.log(`bye.`);
});

rl.prompt();