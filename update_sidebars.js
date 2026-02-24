const fs = require('fs');
const path = require('path');

const TARGET_DIR = __dirname;
const FILES = [
    "ai_prediction.html",
    "attendance.html",
    "dashboard.html",
    "documents.html",
    "intervalmanagement.html",
    "leaderboard.html",
    "leave_management.html",
    "monthly_report.html",
    "salary_settings.html",
    "settings.html"
];

const NEW_NAV = `<nav class="sidebar-nav">
            <a href="dashboard.html" class="nav-item">
                <span class="nav-icon">📊</span>
                <span data-i18n="dashboard">Dashboard</span>
            </a>
            <a href="manage_companies.html" class="nav-item" id="nav-manage-companies" style="display:none;">
                <span class="nav-icon">🏢</span>
                <span>Manage Companies</span>
            </a>
            <a href="manage_branches.html" class="nav-item" id="nav-manage-branches" style="display:none;">
                <span class="nav-icon">🏢</span>
                <span>Manage Branches</span>
            </a>
            <a href="employees.html" class="nav-item">
                <span class="nav-icon">👥</span>
                <span data-i18n="employees">Employees</span>
            </a>
            <a href="attendance.html" class="nav-item">
                <span class="nav-icon">✅</span>
                <span data-i18n="attendance">Attendance</span>
            </a>
            <a href="leave_management.html" class="nav-item">
                <span class="nav-icon">🏖️</span>
                <span data-i18n="leave_management">Leave Management</span>
            </a>
            <a href="manage_admins.html" class="nav-item" id="nav-branch-admins" style="display:none;">
                <span class="nav-icon">🛡️</span>
                <span data-i18n="branch_admins">Branch Admins</span>
            </a>
            <a href="intervalmanagement.html" class="nav-item"><span class="nav-icon">⏲️</span><span>Interval Management</span></a>
            <a href="salary_settings.html" class="nav-item">
                <span class="nav-icon">💰</span>
                <span data-i18n="salary_settings">Salary Settings</span>
            </a>
            <a href="monthly_report.html" class="nav-item">
                <span class="nav-icon">📑</span>
                <span data-i18n="monthly_report">Monthly Report</span>
            </a>
            <a href="documents.html" class="nav-item">
                <span class="nav-icon">📄</span>
                <span>Documents</span>
            </a>
            <a href="leaderboard.html" class="nav-item">
                <span class="nav-icon">🏆</span>
                <span>Leaderboard</span>
            </a>
            <a href="ai_prediction.html" class="nav-item">
                <span class="nav-icon">🧠</span>
                <span>AI Prediction</span>
            </a>
            <a href="settings.html" class="nav-item"><span class="nav-icon">⚙️</span><span data-i18n="settings">Settings</span></a>
        </nav>`;

const NEW_LOGIC = `
        // --- Sidebar Logic ---
        (function(){
            const r = localStorage.getItem("role");
            if (r === 'super_admin') {
                const el1 = document.getElementById('nav-manage-companies'); if (el1) el1.style.display = 'flex';
                const el2 = document.getElementById('nav-manage-branches'); if (el2) el2.style.display = 'flex';
                const el3 = document.getElementById('nav-branch-admins'); if (el3) el3.style.display = 'flex';
            } else if (r === 'company_admin') {
                const el2 = document.getElementById('nav-manage-branches'); if (el2) el2.style.display = 'flex';
                const el3 = document.getElementById('nav-branch-admins'); if (el3) el3.style.display = 'flex';
            }
        })();
`;

const NAV_PATTERN = /<nav class="sidebar-nav">[\s\S]*?<\/nav>/;

FILES.forEach(fname => {
    const filepath = path.join(TARGET_DIR, fname);
    if (!fs.existsSync(filepath)) return;

    let content = fs.readFileSync(filepath, 'utf8');

    // 1. Replace nav
    content = content.replace(NAV_PATTERN, NEW_NAV);

    // Set active class
    const activeRe = new RegExp(`(<a href="${fname}" class="nav-item)("> )|(<a href="${fname}" class="nav-item)(">)`);
    content = content.replace(activeRe, (match, p1, p2, p3, p4) => {
        if (p1) return p1 + ' active' + p2;
        if (p3) return p3 + ' active' + p4;
        return match;
    });

    // 2. Replace Logic
    const idx = content.indexOf('// Hide Branch Admin Link for non-super');
    if (idx !== -1) {
        const idxIf = content.indexOf('if', idx);
        if (idxIf !== -1) {
            let openBraces = 0;
            let started = false;
            let endIdx = idxIf;
            for (let i = idxIf; i < content.length; i++) {
                if (content[i] === '{') {
                    openBraces++;
                    started = true;
                } else if (content[i] === '}') {
                    openBraces--;
                }
                if (started && openBraces === 0) {
                    endIdx = i + 1;
                    break;
                }
            }
            content = content.substring(0, idx) + NEW_LOGIC + content.substring(endIdx);
        }
    }

    fs.writeFileSync(filepath, content, 'utf8');
});

console.log("Done updating sidebars.");
