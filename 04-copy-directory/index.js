const fs = require('fs/promises');
const path = require('path');

const folderFrom = path.join(__dirname, 'files');
const folderTo = path.join(__dirname, 'files-copy');

async function copyDir(folderFrom, folderTo) {
  try {
    await fs.rm(folderTo, { recursive: true, force: true });
    await fs.mkdir(folderTo, { recursive: true });
    const files = await fs.readdir(folderFrom, { withFileTypes: true });
    for (const file of files)
      if (file.isFile()) {
        fs.copyFile(
          path.join(folderFrom, file.name),
          path.join(folderTo, file.name),
        );
      }
    process.stdout.write('All files copied successfully.\n');
  } catch (err) {
    process.stdout.write('Something went wrong.\n');
  }
}

copyDir(folderFrom, folderTo);
