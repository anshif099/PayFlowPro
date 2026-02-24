const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const ALL_HTML = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

const SCRIPT_TAG = '<script src="sidebar.js"></script>';

ALL_HTML.forEach(fname => {
    const filepath = path.join(DIR, fname);
    let content = fs.readFileSync(filepath, 'utf8');

    // Skip if already has sidebar.js
    if (content.includes('sidebar.js')) {
        console.log(`SKIP (already has sidebar.js): ${fname}`);
        return;
    }

    // Insert before the closing </body> tag
    const bodyIdx = content.lastIndexOf('</body>');
    if (bodyIdx === -1) {
        console.log(`SKIP (no </body>): ${fname}`);
        return;
    }

    content = content.substring(0, bodyIdx) + '\n    ' + SCRIPT_TAG + '\n' + content.substring(bodyIdx);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`UPDATED: ${fname}`);
});

console.log('Done!');
