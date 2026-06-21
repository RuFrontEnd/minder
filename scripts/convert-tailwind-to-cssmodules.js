const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'frontend', 'src');

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((f) => {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) return walk(p);
    if (!/\.tsx?$/.test(p)) return;
    processFile(p);
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!/className=\s*["']/.test(content)) return;

  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const moduleName = `${base}.module.css`;
  const modulePath = path.join(dir, moduleName);

  // Add import styles if not present
  const importRegex = /import\s+styles\s+from\s+['\"][.\/].+\.module\.css['\"];?/;
  if (!importRegex.test(content)) {
    // find last import
    const importLines = [...content.matchAll(/^import .*;$/gm)];
    if (importLines.length > 0) {
      const last = importLines[importLines.length - 1];
      const insertPos = last.index + last[0].length;
      const before = content.slice(0, insertPos);
      const after = content.slice(insertPos);
      content = `${before}\nimport styles from './${moduleName}';${after}`;
    } else {
      content = `import styles from './${moduleName}';\n${content}`;
    }
  }

  // Replace any className="..." or className='...' or className={`...` with styles.root
  content = content.replace(/className=\s*{?\s*["'`]([^"'`}]+)["'`]\s*}?/g, (m, g1) => {
    // skip if already using styles
    if (/styles\./.test(m)) return m;
    return 'className={styles.root}';
  });

  fs.writeFileSync(filePath, content, 'utf8');

  // create module file if not exists
  if (!fs.existsSync(modulePath)) {
    fs.writeFileSync(modulePath, '.root {}\n', 'utf8');
  }
  console.log('Processed', filePath);
}

walk(root);
console.log('Conversion complete.');
