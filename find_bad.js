const fs = require('fs');
const glob = require('glob');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.next')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'app'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let badMatches = content.match(/[\u00C0-\u00FF]{2,}/g) || []; // Procura caracteres seguidos estranhos como Ã¡, Ã§, â€
  if (badMatches.length > 0) {
    console.log(file, [...new Set(badMatches)]);
  }
});
