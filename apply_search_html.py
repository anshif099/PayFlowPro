import sys

with open('view_employees.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add Search Input UI
ui_target = """<h3 data-i18n="employee_list">Employee List</h3>"""
ui_replacement = """<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 data-i18n="employee_list" style="margin-bottom: 0;">Employee List</h3>
                    <input type="text" id="searchInput" placeholder="Search by Name or ID..." onkeyup="renderEmployees()" 
                        style="padding: 10px 16px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; width: 250px;">
                </div>"""

text = text.replace(ui_target, ui_replacement)

# 2. Refactor JavaScript to store employees and allow re-rendering
js_target_start = '                const data = document.getElementById(\'data\');'
js_target_end = '                } else {\n                    data.innerHTML = "<tr><td colspan=\'7\' style=\'text-align:center\'>No employees found</td></tr>";\n                }'

old_js = """                const data = document.getElementById('data');
                data.innerHTML = "";
                employeeCount = 0;

                if (s.exists()) {
                    s.forEach(c => {
                        const e = c.val();

                        // Security / Context Filtering
                        let allow = true;
                        if (role === 'branch_admin' && e.branch !== adminBranch) {
                            allow = false;
                        } else if (role === 'company_admin' && (e.companyId !== companyId || (e.branch && branchAdminBranches.has(e.branch)))) {
                            allow = false;
                        } else if (role === 'super_admin' && e.branch && branchAdminBranches.has(e.branch)) {
                            allow = false;
                        }
                        if (!allow) return;

                        employeeCount++;

                        const status = e.status || 'active';
                        const statusBadge = status === 'active'
                            ? `<span style="background: rgba(0, 255, 195, 0.15); color: #00ffc3; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Active</span>`
                            : `<span style="background: rgba(255, 92, 92, 0.15); color: #ff5c5c; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Inactive</span>`;

                        const deptDisplay = e.department ? `<br><span style="font-size:11px; opacity:0.7;">Dept: ${e.department}</span>` : '';
                        
                        let initial = e.name && e.name.length > 0 ? e.name[0].toUpperCase() : '?';
                        let profileWidget = `<div class="profile-picture">${initial}</div>`;

                        data.innerHTML += `<tr>
                        <td>${profileWidget}</td>
                        <td><div style="font-weight: 500;">${e.name}</div><div style="font-size: 11px; color: #8b92a0;">ID: ${e.empId}</div></td>
                        <td>${e.mobile}</td>
                        <td>${e.role}</td>
                        <td>${e.branch || '-'}${deptDisplay}</td>
                        <td>${statusBadge}</td>
                        <td>
                             <button class="btn-small" style="background: transparent; border: 1px solid var(--primary); color: var(--primary);" 
                                onclick="window.location.href='employee_details.html?id=${e.empId}'">👁️ View Details</button>
                        </td></tr>`;
                    });
                } else {
                    data.innerHTML = "<tr><td colspan='7' style='text-align:center'>No employees found</td></tr>";
                }"""

new_js = """                window.allEmployeesData = [];
                if (s.exists()) {
                    s.forEach(c => {
                        const e = c.val();
                        let allow = true;
                        if (role === 'branch_admin' && e.branch !== adminBranch) {
                            allow = false;
                        } else if (role === 'company_admin' && (e.companyId !== companyId || (e.branch && branchAdminBranches.has(e.branch)))) {
                            allow = false;
                        } else if (role === 'super_admin' && e.branch && branchAdminBranches.has(e.branch)) {
                            allow = false;
                        }
                        if (allow) window.allEmployeesData.push(e);
                    });
                }
                window.renderEmployees();"""

if old_js in text:
    text = text.replace(old_js, new_js)
else:
    print("Could not find Javascript logic to replace")
    sys.exit(1)

# 3. Add window.renderEmployees function definition higher up
render_func = """
        window.renderEmployees = function() {
            const data = document.getElementById('data');
            data.innerHTML = "";
            let count = 0;
            const query = (document.getElementById('searchInput')?.value || '').toLowerCase();

            if (window.allEmployeesData && window.allEmployeesData.length > 0) {
                window.allEmployeesData.forEach(e => {
                    const nameMatch = (e.name || '').toLowerCase().includes(query);
                    const idMatch = (e.empId || '').toLowerCase().includes(query);
                    
                    if (query && !nameMatch && !idMatch) return;

                    count++;
                    const status = e.status || 'active';
                    const statusBadge = status === 'active'
                        ? `<span style="background: rgba(0, 255, 195, 0.15); color: #00ffc3; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Active</span>`
                        : `<span style="background: rgba(255, 92, 92, 0.15); color: #ff5c5c; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Inactive</span>`;

                    const deptDisplay = e.department ? `<br><span style="font-size:11px; opacity:0.7;">Dept: ${e.department}</span>` : '';
                    let initial = e.name && e.name.length > 0 ? e.name[0].toUpperCase() : '?';
                    let profileWidget = `<div class="profile-picture">${initial}</div>`;

                    data.innerHTML += `<tr>
                    <td>${profileWidget}</td>
                    <td><div style="font-weight: 500;">${e.name}</div><div style="font-size: 11px; color: #8b92a0;">ID: ${e.empId}</div></td>
                    <td>${e.mobile}</td>
                    <td>${e.role}</td>
                    <td>${e.branch || '-'}${deptDisplay}</td>
                    <td>${statusBadge}</td>
                    <td>
                            <button class="btn-small" style="background: transparent; border: 1px solid var(--primary); color: var(--primary);" 
                            onclick="window.location.href='employee_details.html?id=${e.empId}'">👁️ View Details</button>
                    </td></tr>`;
                });
                
                if (count === 0) {
                    data.innerHTML = "<tr><td colspan='7' style='text-align:center'>No matching employees found</td></tr>";
                }
            } else {
                data.innerHTML = "<tr><td colspan='7' style='text-align:center'>No employees found</td></tr>";
            }
        };

        let employeeCount = 0;"""

text = text.replace("let employeeCount = 0;", render_func)

with open('view_employees.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Injected successfully!")
