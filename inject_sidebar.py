with open('employees.html', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = """
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

        window.editEmployee = (name"""

result = text.replace("window.editEmployee = (name", replacement)
with open('employees.html', 'w', encoding='utf-8') as f:
    f.write(result)
