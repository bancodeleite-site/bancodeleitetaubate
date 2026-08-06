const fs = require('fs');
const glob = require('glob');
const path = require('path');

const map = {
  'TransparÃªncia': 'Transparência',
  'InÃ­cio': 'Início',
  'MÃªs': 'Mês',
  'relatÃ³rio': 'relatório',
  'ConteÃºdo DinÃ¢mico': 'Conteúdo Dinâmico',
  'â†—': '↗',
  'excluÃ­-lo': 'excluí-lo'
};

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
  
  for (const [bad, good] of Object.entries(map)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
