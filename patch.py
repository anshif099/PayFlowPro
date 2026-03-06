import os, glob, re

addition = """
            <a href="salary_payments.html" class="nav-item">
                <span class="nav-icon">💳</span>
                <span data-i18n="salary_payments">Salary Payments</span>
            </a>"""

count: int = 0
for file in glob.glob(r"c:\WORKS\Rainhopes_Workes\PayFlow Pro\payflow_pro\Admin\*.html"):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already added or if it's the new file itself
    if "salary_payments.html" in content and not file.endswith("salary_payments.html"):
        continue
        
    pattern = re.compile(r'(<a href="salary_settings\.html"[^>]*>.*?</a>)', re.DOTALL)
    
    if pattern.search(content):
        new_content = pattern.sub(lambda m: m.group(1) + addition, content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1  # pyre-ignore

print(f"Patched {count} files.")
