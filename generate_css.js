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
  width: 1em;
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
      return `
.icon-${name} {
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
