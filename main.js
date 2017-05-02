'use strict';

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const Rx = require('rx');
const subject = new Rx.Subject();
rl.on('line', (line) => {
    subject.onNext(line);
    rl.prompt();
}).on('error', (error) => {
    subject.onError(error);
}).on('close', () => {
    subject.onCompleted();
});


// feature 1: echo
subject.subscribe((line) => {
    console.log(`[${Date.now()}] you said: "${line}".`);
});



// feature 2: uppercase
subject.map((line) => {
    return line.toUpperCase();
}).subscribe((line) => {
    console.log(`[${Date.now()}] you said (reversed): "${line}".`);
});




// feature 3: batch echo every 3 seconds
subject.buffer(() => {
    return Rx.Observable.timer(3000);
}).filter((lines) => {
    return lines.length > 0;
}).subscribe((lines) => {
    console.log(`[${Date.now()}] you said (in past 3 seconds): "${lines.join(', ')}".`);
});



// feature 4: debounce 1 second
subject.debounce(500).subscribe((line) => {
    console.log(`[${Date.now()}] you said (debounce 0.5 second): "${line}".`);
});

rl.prompt();