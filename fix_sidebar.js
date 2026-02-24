const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const ALL_HTML = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

ALL_HTML.forEach(fname => {
    const filepath = path.join(DIR, fname);
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    // 1. Remove the old manage_branches.html nav-item entirely (the <a> tag with id="nav-manage-branches" pointing to manage_branches.html)
    const mbRegex = /\s*<a\s+href="manage_branches\.html"[^>]*id="nav-manage-branches"[^>]*>[\s\S]*?<\/a>\r?\n?/g;
    const newContent1 = content.replace(mbRegex, '\n');
    if (newContent1 !== content) { content = newContent1; changed = true; }

    // 2. Rename "Branch Admins" text to "Manage Branches" and change id from nav-branch-admins to nav-manage-branches
    const baRegex = /(<a\s+href="manage_admins\.html"\s+class="nav-item"[^>]*)id="nav-branch-admins"([^>]*>[\s\S]*?)<span[^>]*data-i18n="branch_admins"[^>]*>Branch Admins<\/span>/g;
    const newContent2 = content.replace(baRegex, '$1id="nav-manage-branches" style="display:none;"$2<span>Manage Branches</span>');
    if (newContent2 !== content) { content = newContent2; changed = true; }

    // Also handle the active variant on manage_admins.html itself
    const baActiveRegex = /(<a\s+href="manage_admins\.html"\s+class="nav-item active"[^>]*)id="nav-branch-admins"([^>]*>[\s\S]*?)<span[^>]*data-i18n="branch_admins"[^>]*>Branch Admins<\/span>/g;
    const newContent3 = content.replace(baActiveRegex, '$1id="nav-manage-branches"$2<span>Manage Branches</span>');
    if (newContent3 !== content) { content = newContent3; changed = true; }

    if (changed) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`UPDATED: ${fname}`);
    } else {
        console.log(`SKIP: ${fname}`);
    }
});

console.log('Done!');
