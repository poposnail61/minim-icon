const fs = require('fs');
const path = require('path');

const iconsDir = path.join(process.cwd(), 'public/icons');
const tagsFile = path.join(process.cwd(), 'data/tags.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(tagsFile))) {
    fs.mkdirSync(path.dirname(tagsFile), { recursive: true });
}

let tagsData = {};
try {
    if (fs.existsSync(tagsFile)) {
        tagsData = JSON.parse(fs.readFileSync(tagsFile, 'utf8'));
    }
} catch (e) {
    console.log('Creating new tags.json');
}

const files = fs.readdirSync(iconsDir);

let count = 0;
files.forEach(file => {
    if (!file.endsWith('.svg')) return;

    const name = path.basename(file, '.svg');
    const lowerName = name.toLowerCase();

    let fileTags = tagsData[name] || [];

    if (lowerName.includes('solid') && !fileTags.includes('solid')) {
        fileTags.push('solid');
    }
    if (lowerName.includes('outline') && !fileTags.includes('outline')) {
        fileTags.push('outline');
    }

    if (fileTags.length > 0) {
        tagsData[name] = fileTags;
        count++;
    }
});

fs.writeFileSync(tagsFile, JSON.stringify(tagsData, null, 2));
console.log(`Migrated tags for ${count} icons.`);
