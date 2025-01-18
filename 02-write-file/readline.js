const fs = require('fs');
const path = require('path');
const readline = require('readline');
// const { Readline } = require('readline/promises');

const filename = 'file1.txt';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt('Enter data for saving in file:\n');
rl.prompt();

const writeStream = fs.createWriteStream(path.join(__dirname, filename));

rl.on('SIGINT', () => {
  process.stdout.write('Exit...');
  writeStream.end();
  rl.close();
});

rl.on('line', (chunk) => {
  if (chunk === 'exit') {
    process.stdout.write('Exit...');
    writeStream.end();
    rl.close();
  } else {
    writeStream.write(chunk + '\n', (err) => {
      if (err) console.error('Error writing to file:', err.message);
    });
  }
});
