const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, 'public/icons');
const OUTPUT_FILE = path.join(__dirname, 'public/icons.css');
const GITHUB_OWNER = 'poposnail61';
const GITHUB_REPO = 'minim-icon';
const BRANCH = 'main';

const baseCss = `/* Minim Icon System */
.icon {
  display: inline-block;
  width: calc(1em * var(--ratio, 1));
  height: 1em;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}
`;

try {
  const files = fs.readdirSync(ICONS_DIR);
  const iconRules = files
    .filter(file => file.endsWith('.svg'))
    .map(file => {
      const name = file.replace('.svg', '');
      const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${BRANCH}/public/icons/${file}`;
      
      // Calculate aspect ratio
      const content = fs.readFileSync(path.join(ICONS_DIR, file), 'utf8');
      let ratio = 1;

      // Try width/height first
      const widthMatch = content.match(/width=["']?([\d.]+)["']?/);
      const heightMatch = content.match(/height=["']?([\d.]+)["']?/);

      if (widthMatch && heightMatch) {
         ratio = parseFloat(widthMatch[1]) / parseFloat(heightMatch[1]);
      } else {
        // Fallback to viewBox
        const viewBoxMatch = content.match(/viewBox=["']?([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)["']?/);
        if (viewBoxMatch) {
            const width = parseFloat(viewBoxMatch[3]);
            const height = parseFloat(viewBoxMatch[4]);
            ratio = width / height;
        }
      }

      // Round to 4 decimal places to keep it clean
      ratio = Math.round(ratio * 10000) / 10000;

      return `
.icon-${name} {
  --ratio: ${ratio};
  mask-image: url(${url});
  -webkit-mask-image: url(${url});
}`;
    })
    .join('\n');

  fs.writeFileSync(OUTPUT_FILE, baseCss + iconRules);
  console.log(`Generated ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error generating CSS:', error);
  process.exit(1);
}
