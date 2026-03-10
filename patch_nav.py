import os
import glob

admin_dir = r"c:\WORKS\Rainhopes_Workes\PayFlow Pro\payflow_pro\Admin"
html_files = glob.glob(os.path.join(admin_dir, "*.html"))

nav_link = '''            <a href="subscriptions.html" class="nav-item" id="nav-subscriptions" style="display:none;">
                <span class="nav-icon">&#x1F4B3;</span>
                <span>Subscriptions</span>
            </a>'''

for file in html_files:
    if os.path.basename(file) == "subscriptions.html":
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "subscriptions.html" in content and "nav-subscriptions" in content:
        continue
        
    # Find manage_branches.html to insert after
    target = '<a href="manage_branches.html" class="nav-item" id="nav-manage-branches" style="display:none;">\n                <span class="nav-icon">&#x1F3E2;</span>\n                <span>Manage Branches</span>\n            </a>'
    
    if target in content:
        content = content.replace(target, target + "\n" + nav_link)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {os.path.basename(file)}")
    else:
        print(f"Target not found in {os.path.basename(file)}")
