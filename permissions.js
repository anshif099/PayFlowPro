// Shared sub-admin permission catalogue and editor.
window.adminModules = {"dashboard":"Dashboard","employees":"Employees","hire_resign":"Hire","companies":"Manage Companies","subscriptions":"Subscriptions","interval":"Interval","timetrack":"TimeTrack","attendance":"Attendance","leaves":"Leave Management","salary":"Salary","monthly_report":"Monthly Report","salary_report":"Salary Report","statutory_calculation":"Statutory Calculation","documents":"Documents","leaderboard":"Leaderboard","ai_prediction":"AI Prediction","teamsive_passport":"Teamsive Passport","feedback":"Feedback","notes":"Notes","branches":"Branches","settings":"Settings"};
window.chooseAdminPermissions = (initial = {}) => new Promise(resolve => {
 const dialog = document.createElement('dialog');
 dialog.style.cssText = 'background:var(--bg-card,#142e30);color:var(--text,#fff);border:1px solid #456;border-radius:16px;max-width:560px;width:90%;max-height:85vh;overflow:auto';
 dialog.innerHTML = '<h2>Sub-admin permissions</h2><p>Select sidebar sections and allowed actions.</p><table style="width:100%"><thead><tr><th>Section</th><th>View</th><th>Edit</th><th>Delete</th></tr></thead><tbody>' + Object.entries(adminModules).map(([key,label]) => '<tr><td>'+label+'</td>'+['view','edit','delete'].map(action => '<td><input type="checkbox" data-module="'+key+'" data-action="'+action+'" aria-label="'+label+' '+action+'" '+(initial[key]?.[action] ? 'checked' : '')+'></td>').join('')+'</tr>').join('')+'</tbody></table><div style="display:flex;gap:16px;margin-top:20px"><button id="permissionCancel">Cancel</button><button id="permissionSave">Continue</button></div>';
 const finish = result => {dialog.close();dialog.remove();resolve(result);};
 dialog.addEventListener('cancel', event => {event.preventDefault();finish(null);});
 dialog.querySelector('#permissionCancel').onclick = () => finish(null);
 dialog.addEventListener('change', event => {
   const input=event.target;if(!input.dataset.module)return;
   const row=input.closest('tr');const view=row.querySelector('[data-action="view"]');
   if(input.checked && input.dataset.action!=='view')view.checked=true;
   if(!view.checked)row.querySelectorAll('input').forEach(el=>el.checked=false);
 });
 dialog.querySelector('#permissionSave').onclick = () => {
   const result={};dialog.querySelectorAll('input').forEach(el=>{(result[el.dataset.module]??={})[el.dataset.action]=el.checked;});finish(result);
 };
 document.body.append(dialog);dialog.showModal();
});

window.adminPageModules = {"dashboard.html":"dashboard","employees.html":"employees","employees_backup.html":"employees","view_employees.html":"employees","employee_details.html":"employees","hire_resign.html":"hire_resign","manage_companies.html":"companies","subscriptions.html":"subscriptions","intervalmanagement.html":"interval","intervals_history.html":"interval","timetrack.html":"timetrack","attendance.html":"attendance","leave_management.html":"leaves","salary_settings.html":"salary","salary_payments.html":"salary","monthly_report.html":"monthly_report","salary_report.html":"salary_report","statutory_calulation.html":"statutory_calculation","documents.html":"documents","leaderboard.html":"leaderboard","ai_prediction.html":"ai_prediction","teamsive_passport.html":"teamsive_passport","manage_feedback.html":"feedback","manage_notes.html":"notes","manage_branches.html":"branches","manage_admins.html":"branches","settings.html":"settings","tier_management.html":"subscriptions"};
window.adminPermissionGrants = {};
window.adminCan = (module, action) => localStorage.getItem('role') !== 'sub_admin' || (window.adminPermissionGrants[module]?.view === true && window.adminPermissionGrants[module]?.[action] === true);
window.adminPermissionReady = (async () => {
 if(localStorage.getItem('role') !== 'sub_admin')return;
 try {
 const {initializeApp,getApps}=await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js');
 const {getDatabase,ref,get}=await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js');
 const app=getApps()[0] || initializeApp({
            apiKey: "AIzaSyADjMc3Jwsjlg_ajo282ZtM5jvDUuGdoRk",
            authDomain: "payflowpro-6e62d.firebaseapp.com",
            databaseURL: "https://payflowpro-6e62d-default-rtdb.firebaseio.com",
            projectId: "payflowpro-6e62d",
            storageBucket: "payflowpro-6e62d.firebasestorage.app",
            messagingSenderId: "69298740438",
            appId: "1:69298740438:web:18fd85e982e083e1543d77"
        });
 const id=(localStorage.getItem('empId')||'').replace(/[.#$\[\]]/g,'_');
 const snap=await get(ref(getDatabase(app),'employees/'+id));
 const employee=snap.val();
 if(employee?.isAdmin===true)window.adminPermissionGrants=employee.adminPermissions||{};
 }catch(error){console.error('Could not load sub-admin permissions',error);}
 const page=location.pathname.split('/').pop();const module=adminPageModules[page];
 if(module && module!=='dashboard' && !adminCan(module,'view'))location.replace('dashboard.html');
 if(module==='dashboard' && !adminCan(module,'view')){
  const hide=()=>{const content=document.querySelector('.main-content');if(content)content.innerHTML='<p style="padding:32px">Choose an assigned section from the menu.</p>';};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hide);else hide();
 }
})();
