// Fix sidebar encoding in all HTML files
// This script replaces the <nav class="sidebar-nav">...</nav> block
// with a properly encoded version containing working emojis + salary_payments link

const fs = require('fs');
const path = require('path');

const dir = __dirname;

// The correct sidebar nav with proper UTF-8 emojis
function getNav(activeFile) {
    const items = [
        { href: 'dashboard.html', icon: '&#x1F4CA;', label: 'Dashboard', i18n: 'dashboard' },
        { href: 'manage_companies.html', icon: '&#x1F3E2;', label: 'Manage Companies', id: 'nav-manage-companies', hidden: true },
        { href: 'manage_branches.html', icon: '&#x1F3E2;', label: 'Manage Branches', id: 'nav-manage-branches', hidden: true },
        { href: 'employees.html', icon: '&#x1F465;', label: 'Employees', i18n: 'employees' },
        { href: 'attendance.html', icon: '&#x2705;', label: 'Attendance', i18n: 'attendance' },
        { href: 'leave_management.html', icon: '&#x1F3D6;&#xFE0F;', label: 'Leave Management', i18n: 'leave_management' },
        { href: 'manage_admins.html', icon: '&#x1F6E1;&#xFE0F;', label: 'Branch Admins', i18n: 'branch_admins', id: 'nav-branch-admins', hidden: true },
        { href: 'intervalmanagement.html', icon: '&#x23F2;&#xFE0F;', label: 'Interval Management' },
        { href: 'salary_settings.html', icon: '&#x1F4B0;', label: 'Salary Settings', i18n: 'salary_settings' },
        { href: 'salary_payments.html', icon: '&#x1F4B3;', label: 'Salary Payments', i18n: 'salary_payments' },
        { href: 'monthly_report.html', icon: '&#x1F4D1;', label: 'Monthly Report', i18n: 'monthly_report' },
        { href: 'documents.html', icon: '&#x1F4C4;', label: 'Documents' },
        { href: 'leaderboard.html', icon: '&#x1F3C6;', label: 'Leaderboard' },
        { href: 'ai_prediction.html', icon: '&#x1F9E0;', label: 'AI Prediction' },
        { href: 'settings.html', icon: '&#x2699;&#xFE0F;', label: 'Settings', i18n: 'settings' },
    ];

    let html = '        <nav class="sidebar-nav">\n';
    for (const item of items) {
        const isActive = item.href === activeFile ? ' active' : '';
        const idAttr = item.id ? ` id="${item.id}"` : '';
        const hiddenAttr = item.hidden ? ' style="display:none;"' : '';
        const i18nAttr = item.i18n ? ` data-i18n="${item.i18n}"` : '';
        html += `            <a href="${item.href}" class="nav-item${isActive}"${idAttr}${hiddenAttr}>\n`;
        html += `                <span class="nav-icon">${item.icon}</span>\n`;
        html += `                <span${i18nAttr}>${item.label}</span>\n`;
        html += `            </a>\n`;
    }
    html += '        </nav>';
    return html;
}

const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let fixedCount = 0;

for (const file of htmlFiles) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Match the <nav class="sidebar-nav">...</nav> block
    const navRegex = /<nav class="sidebar-nav">[\s\S]*?<\/nav>/;
    if (navRegex.test(content)) {
        const newNav = getNav(file);
        content = content.replace(navRegex, newNav);
        fs.writeFileSync(filePath, content, 'utf8');
        fixedCount++;
        console.log(`Fixed: ${file}`);
    } else {
        console.log(`No nav found: ${file}`);
    }
}

console.log(`\nDone. Fixed ${fixedCount} files.`);
