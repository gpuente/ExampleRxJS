'use strict';

const Rx = require('rx');

const app = require('http').createServer();
const io = require('socket.io')(app);
const subject = new Rx.Subject();
io.on('connection', (socket) => {
    console.log(`CONNECTION: ${socket.id}`);

    subject.onNext({
        socket: socket,
        type: 'online'
    });

    socket.on('disconnect', () => {
        subject.onNext({
            socket: socket,
            type: 'offline'
        });
    });

    socket.on('message', (message) => {
        subject.onNext({
            socket: socket,
            type: 'message',
            index: message.index,
            content: message.content
        });
    });
});

subject.filter((x) => {
    return x.type === 'online';
}).subscribe(
    (x) => {
        console.log(`${x.socket.id} joint.`);
        x.socket.broadcast.emit('message', `${x.socket.id} online.`);
    }
);

subject.filter((x) => {
    return x.type === 'offline';
}).subscribe(
    (x) => {
        console.log(`${x.socket.id} left.`);
        x.socket.broadcast.emit('message', `${x.socket.id} offline.`);
    }
);

subject.filter((x) => {
    return x.type === 'message';
}).buffer(() => {
    return Rx.Observable.timer(3000);
}).filter((xs) => {
    return xs.length > 0;
}).subscribe(
    (xs) => {
        for (const x of xs) {
            console.log(`${x.socket.id} say: "(${x.index}) ${x.content}".`);
            x.socket.broadcast.emit('message', `${x.socket.id} say: "(${x.index}) ${x.content}".`);            
        }
    }
);

app.listen(22222);
console.log(`ready`);