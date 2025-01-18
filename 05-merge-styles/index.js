const fsP = require('fs/promises');
const fs = require('fs');
const path = require('path');

const bundle = path.join(__dirname, 'project-dist', 'bundle.css');
const cssFolder = path.join(__dirname, 'styles');

const writeStream = fs.createWriteStream(bundle);

async function mergeCSS() {
  try {
    const files = await fsP.readdir(cssFolder, { withFileTypes: true });
    for (const file of files)
      if (path.extname(path.join(cssFolder, file.name)) === '.css') {
        const readStream = fs.createReadStream(
          path.join(cssFolder, file.name),
          'utf-8',
        );
        await new Promise((resolve, reject) => {
          readStream.on('data', (chunk) => {
            writeStream.write(chunk);
          });
          readStream.on('end', () => {
            writeStream.write('\n');
            resolve();
          });
          readStream.on('error', reject);
        });
      }
    process.stdout.write('All files merged successfully.\n');
  } catch (err) {
    process.stdout.write('Something went wrong.\n', err);
  }
}

mergeCSS();
