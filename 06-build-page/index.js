const { createReadStream, createWriteStream } = require('fs');
const fs = require('fs/promises');
const path = require('path');

async function readFile(filename) {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(path.join(__dirname, filename));
    let content = '';
    readStream.on('data', (chunk) => {
      content += chunk;
    });
    readStream.on('end', () => resolve(content));
    readStream.on('error', (err) => reject(err));
  });
}

async function madeAll() {
  await fs.mkdir(path.join(__dirname, 'project-dist'), { recursive: true });

  let template = await readFile('template.html');
  let header = await readFile('components/header.html');
  let articles = await readFile('components/articles.html');
  let footer = await readFile('components/footer.html');

  // Сделать универсально
  template = template
    .replace('{{header}}', header)
    .replace('{{articles}}', articles)
    .replace('{{footer}}', footer);

  const writeStream = createWriteStream(
    path.join(__dirname, 'project-dist', 'index.html'),
  );
  writeStream.write(template);
  writeStream.end();
}

const bundle = path.join(__dirname, 'project-dist', 'style.css');
const cssFolder = path.join(__dirname, 'styles');

const writeStream = createWriteStream(bundle);

async function mergeCSS() {
  try {
    const files = await fs.readdir(cssFolder, { withFileTypes: true });
    for (const file of files)
      if (path.extname(path.join(cssFolder, file.name)) === '.css') {
        const readStream = createReadStream(
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
    process.stdout.write('All css files merged successfully.\n');
  } catch (err) {
    process.stdout.write('Something went wrong.\n', err);
  }
}

const folderFrom = path.join(__dirname, 'assets');
const folderTo = path.join(__dirname, 'project-dist', 'assets');

async function copyFolder(from, to) {
  try {
    await fs.rm(to, { recursive: true, force: true });
    await fs.mkdir(to, { recursive: true });
    const files = await fs.readdir(from, { withFileTypes: true });
    for (const file of files)
      if (file.isFile()) {
        fs.copyFile(path.join(from, file.name), path.join(to, file.name));
      } else copyFolder(path.join(from, file.name), path.join(to, file.name));

    process.stdout.write(`All files from ${from} copied successfully.\n`);
  } catch (err) {
    process.stdout.write('Something went wrong.\n');
  }
}

madeAll();
mergeCSS();
copyFolder(folderFrom, folderTo);
