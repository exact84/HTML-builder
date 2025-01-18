const fs = require('fs/promises');
const path = require('path');

const folder1 = path.join(__dirname, 'files');
const folder2 = path.join(__dirname, 'files-copy');

async function copyFolder() {
  try {
    await fs.rm(folder2, { recursive: true, force: true });
    await fs.mkdir(folder2, { recursive: true });
    const files = await fs.readdir(folder1, { withFileTypes: true });
    for (const file of files)
      if (file.isFile()) {
        fs.copyFile(
          path.join(folder1, file.name),
          path.join(folder2, file.name),
        );
      }
    process.stdout.write('All files copied successfully.\n');
  } catch (err) {
    process.stdout.write('Something went wrong.\n');
  }
}

copyFolder();
