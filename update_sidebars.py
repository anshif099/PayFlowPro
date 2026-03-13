import os
import re

TARGET_DIR = r"Admin"

# Files to update
FILES = [
    "ai_prediction.html",
    "attendance.html",
    "dashboard.html",
    "documents.html",
    "employees.html",
    "manage_companies.html",
    "manage_branches.html",
    "manage_admins.html",
    "intervalmanagement.html",
    "intervals_history.html",
    "leaderboard.html",
    "leave_management.html",
    "monthly_report.html",
    "salary_payments.html",
    "salary_settings.html",
    "salary_report.html",
    "settings.html",
    "subscriptions.html",
    "view_employees.html",
    "employee_details.html"
]

NEW_NAV = """<style>
        .nav-dropdown {
            display: none;
            flex-direction: column;
            padding-left: 32px;
            margin-bottom: 4px;
        }
        .nav-dropdown.show {
            display: flex;
        }
        .dropdown-toggle {
            justify-content: space-between;
        }
        .nav-dropdown .nav-item {
            padding: 10px 16px;
            font-size: 13px;
            margin-bottom: 2px;
        }
        .nav-dropdown .nav-icon {
            font-size: 16px;
        }
        </style>
        <nav class="sidebar-nav">
            <a href="dashboard.html" class="nav-item">
                <span class="nav-icon">📊</span>
                <span data-i18n="dashboard">Dashboard</span>
            </a>
            <a href="manage_companies.html" class="nav-item" id="nav-manage-companies" style="display:none;">
                <span class="nav-icon">🏢</span>
                <span data-i18n="manage_companies">Manage Companies</span>
            </a>
            <a href="manage_branches.html" class="nav-item" id="nav-manage-branches" style="display:none;">
                <span class="nav-icon">🏢</span>
                <span data-i18n="manage_branches">Manage Branches</span>
            </a>
            
            <!-- Employees Dropdown -->
            <div class="nav-item dropdown-toggle" onclick="toggleDropdown('empDropdown', this)" style="cursor:pointer;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="nav-icon">👥</span>
                    <span data-i18n="employees">Employees</span>
                </div>
                <span class="chevron">▼</span>
            </div>
            <div class="nav-dropdown" id="empDropdown">
                <a href="view_employees.html" class="nav-item" id="nav-view-employees">
                    <span class="nav-icon">📜</span>
                    <span data-i18n="list_employees">List Employees</span>
                </a>
                <a href="employees.html" class="nav-item" id="nav-manage-employees">
                    <span class="nav-icon">✏️</span>
                    <span data-i18n="manage_employees">Manage Employees</span>
                </a>
            </div>

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
            <a href="intervalmanagement.html" class="nav-item"><span class="nav-icon">⏲️</span><span data-i18n="interval_management">Interval Management</span></a>
            <a href="intervals_history.html" class="nav-item"><span class="nav-icon">⏳</span><span data-i18n="intervals_history">Intervals History</span></a>
            <a href="salary_settings.html" class="nav-item">
                <span class="nav-icon">💰</span>
                <span data-i18n="salary_settings">Salary Settings</span>
            </a>
            <a href="salary_payments.html" class="nav-item">
                <span class="nav-icon">💳</span>
                <span data-i18n="salary_payments">Salary Payments</span>
            </a>
            <a href="salary_report.html" class="nav-item">
                <span class="nav-icon">📈</span>
                <span data-i18n="salary_report">Salary Report</span>
            </a>
            <a href="monthly_report.html" class="nav-item">
                <span class="nav-icon">📑</span>
                <span data-i18n="monthly_report">Monthly Report</span>
            </a>
            <a href="documents.html" class="nav-item">
                <span class="nav-icon">📄</span>
                <span data-i18n="documents">Documents</span>
            </a>
            <a href="leaderboard.html" class="nav-item">
                <span class="nav-icon">🏆</span>
                <span data-i18n="leaderboard">Leaderboard</span>
            </a>
            <a href="ai_prediction.html" class="nav-item">
                <span class="nav-icon">🧠</span>
                <span data-i18n="ai_prediction">AI Prediction</span>
            </a>
            <a href="subscriptions.html" class="nav-item">
                <span class="nav-icon">📋</span>
                <span data-i18n="subscriptions">Subscriptions</span>
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
        
        window.toggleDropdown = function(id, el) {
            const dropdown = document.getElementById(id);
            dropdown.classList.toggle('show');
            el.classList.toggle('open');
            const chevron = el.querySelector('.chevron');
            if(chevron) {
                chevron.style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
                chevron.style.transition = 'transform 0.3s ease';
            }
        };
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
            new_content = new_content[:idx] + NEW_LOGIC + new_content[end_idx:] # pyre-ignore

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Done updating sidebars.")
