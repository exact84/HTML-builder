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

async function makeIndex() {
  await fs.mkdir(path.join(__dirname, 'project-dist'), { recursive: true });

  let template = await readFile('template.html');

  const files = await fs.readdir(path.join(__dirname, 'components'), {
    withFileTypes: true,
  });
  for (const file of files)
    if (
      file.isFile() &&
      path.extname(path.join(__dirname, 'components', file.name)) === '.html'
    ) {
      try {
        const component = path.basename(file.name, path.extname(file.name));
        template = template.replace(
          `{{${component}}}`,
          await readFile(`components/${component}.html`),
        );
        process.stdout.write(`${component} inserted successfully.\n`);
      } catch (err) {
        process.stdout.write('Something went wrong while inserting.\n');
      }
    }

  const writeStream = createWriteStream(
    path.join(__dirname, 'project-dist', 'index.html'),
  );
  writeStream.write(template);
  writeStream.on('error', (err) =>
    process.stdout.write('Error ehile creating index.html.\n', err),
  );
  writeStream.end(() => process.stdout.write('index.html made sucsesfull. \n'));
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
    process.stdout.write('Something went wrong while merging.\n', err);
  }
}

const folderFrom = path.join(__dirname, 'assets');
const folderTo = path.join(__dirname, 'project-dist', 'assets');

async function copyDir(from, to) {
  try {
    await fs.rm(to, { recursive: true, force: true });
    await fs.mkdir(to, { recursive: true });
    const files = await fs.readdir(from, { withFileTypes: true });
    for (const file of files)
      if (file.isFile()) {
        await fs.copyFile(path.join(from, file.name), path.join(to, file.name));
      } else
        await copyDir(path.join(from, file.name), path.join(to, file.name));

    process.stdout.write(`Files from ${from} copied successfully.\n`);
  } catch (err) {
    process.stdout.write('Something went wrong while copying.\n', err.message);
  }
}

(async () => {
  try {
    await makeIndex();
    await mergeCSS();
    await copyDir(folderFrom, folderTo);
    process.stdout.write('Project built successfully.\n');
  } catch (err) {
    process.stderr.write(`Build process failed: ${err.message}\n`);
  }
})();
