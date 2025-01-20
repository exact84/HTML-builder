const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'secret-folder');

fs.readdir(folder, { withFileTypes: true }, (err, files) => {
  if (err) {
    process.stdout.write(`\n${folder} does not exist.`);
    process.exit(0);
  }
  for (const file of files)
    if (file.isFile()) {
      fs.stat(path.join(folder, file.name), (err, fileInfo) => {
        process.stdout.write(
          path.basename(file.name, path.extname(file.name)) +
            ' - ' +
            path.extname(path.join(folder, file.name)).slice(1) +
            ' - ' +
            (fileInfo.size / 1024).toFixed(3) +
            'kb\n',
        );
      });
    }
});
