import sys

with open('leave_management.html', 'r', encoding='utf-8') as f:
    text = f.read()

replacement1 = """hasPending = true;
                    // Calculate approved days in the same month
                    let approvedDays = 0;
                    if (req.fromDate) {
                        const reqDate = new Date(req.fromDate);
                        const reqMonth = reqDate.getMonth();
                        const reqYear = reqDate.getFullYear();
                        
                        leaveRequestsRaw.forEach(pastItem => {
                            const pReq = pastItem.v;
                            if (pReq.employeeId === req.employeeId && pReq.status === 'approved' && pReq.fromDate) {
                                const pDate = new Date(pReq.fromDate);
                                if (pDate.getMonth() === reqMonth && pDate.getFullYear() === reqYear) {
                                    approvedDays += parseInt(pReq.days || 0);
                                }
                            }
                        });
                    }"""

text = text.replace('hasPending = true;', replacement1)

target2 = "<td>${(req.employeeName && req.employeeName !== 'Unknown') ? req.employeeName : (req.employeeId || 'Unknown')}</td>"
replacement2 = """<td>
                                ${(req.employeeName && req.employeeName !== 'Unknown') ? req.employeeName : (req.employeeId || 'Unknown')}
                                <br><div style="margin-top: 4px; display: inline-block; padding: 2px 6px; background: rgba(255, 167, 38, 0.15); color: #ffa726; border-radius: 4px; font-size: 10px; font-weight: bold;">Taken this month: ${approvedDays}</div>
                            </td>"""

if target2 in text:
    text = text.replace(target2, replacement2)
else:
    print("Could not find target cell")
    sys.exit(1)

with open('leave_management.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Injected successfully!")
