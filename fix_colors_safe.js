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
  let changed = false;
  
  const replacements = {
    'text-[#2B6B43]': 'text-primary',
    'bg-[#2B6B43]': 'bg-primary',
    'border-[#2B6B43]': 'border-primary',
    'hover:bg-[#205132]': 'hover:bg-primary-dark',
    'bg-[#E4F2E7]': 'bg-primary-light',
    'hover:bg-[#d1e8d6]': 'hover:bg-primary/20',
    'font-serif': 'font-display'
  };

  for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed colors on', file);
  }
});
