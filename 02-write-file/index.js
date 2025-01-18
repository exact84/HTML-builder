const fs = require('fs');
const path = require('path');

const filename = 'file1.txt';

process.stdin.resume();
process.stdin.setEncoding('utf8');
const writeStream = fs.createWriteStream(path.join(__dirname, filename));

process.stdout.write('Enter data for saving in file:\n');
process.on('SIGINT', () => {
  process.stdout.write('Exit...');
  writeStream.end();
  process.stdin.pause();
});

process.stdin.on('data', (chunk) => {
  if (chunk.trim() === 'exit') {
    process.stdout.write('Exit...');
    writeStream.end();
    process.stdin.pause();
  } else writeStream.write(chunk);
});
