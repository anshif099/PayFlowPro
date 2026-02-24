import os
import re

TARGET_DIR = r"c:\Rainhopes_Workes\PayFlow Pro\payflow_pro\Admin"

# Files to update
FILES = [
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
]

NEW_NAV = """<nav class="sidebar-nav">
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
        </nav>"""

NEW_LOGIC = """
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
"""

NAV_PATTERN = re.compile(r'<nav class="sidebar-nav">.*?</nav>', re.DOTALL)
LOGIC_PATTERN1 = re.compile(r'\/\/\s*Hide Branch Admin Link for non-super.*?if\s*\([^\{]+\{\s*const navs = document\.querySelectorAll[^}]+}\s*\}\s*\}', re.DOTALL) # matches the navs.forEach block
LOGIC_PATTERN2 = re.compile(r'\/\/\s*Hide Branch Admin Link for non-super.*?if\s*\([^\{]+\{\s*const navs = document\.querySelectorAll[^}]+\}\);\s*\}', re.DOTALL)

for fname in FILES:
    filepath = os.path.join(TARGET_DIR, fname)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace nav
    new_content = NAV_PATTERN.sub(NEW_NAV, content)
    
    # Set the active class
    # The active class corresponds to the file name
    nav_item_match = re.search(r'(<a href="{}" class="nav-item)(">)'.format(fname), new_content)
    if nav_item_match:
        new_content = new_content.replace(nav_item_match.group(0), nav_item_match.group(1) + ' active' + nav_item_match.group(2))
    elif fname == "intervalmanagement.html": # Special case
         new_content = new_content.replace('<a href="intervalmanagement.html" class="nav-item">', '<a href="intervalmanagement.html" class="nav-item active">')

    # 2. Replace Logic
    # Let's try to find exactly the logic block. Instead of complex regex, let's just find:
    # `// Hide Branch Admin Link for non-super` to the closing brace.
    # It's safer to use manual parsing
    
    idx = new_content.find('// Hide Branch Admin Link for non-super')
    if idx != -1:
        # Find the start of the `if` block after this comment
        idx_if = new_content.find('if', idx)
        if idx_if != -1:
            # We need to find the matching closing brace for this if statement
            open_braces = 0
            started = False
            end_idx = idx_if
            for i in range(idx_if, len(new_content)):
                if new_content[i] == '{':
                    open_braces += 1
                    started = True
                elif new_content[i] == '}':
                    open_braces -= 1
                if started and open_braces == 0:
                    end_idx = i + 1
                    break
            
            # Now replace from idx to end_idx with NEW_LOGIC
            new_content = new_content[:idx] + NEW_LOGIC + new_content[end_idx:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Done updating sidebars.")
