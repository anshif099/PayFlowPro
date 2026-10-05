// Shared sub-admin permission catalogue and editor.
window.adminModules = {"dashboard":"Dashboard","view_employees":"List Employees","manage_employees":"Manage Employees","hire_resign":"Hire","companies":"Manage Companies","subscriptions":"Subscriptions","timetrack":"TimeTrack","attendance":"Attendance","leaves":"Leave Management","monthly_report":"Monthly Report","salary_report":"Salary Report","statutory_calculation":"Statutory Calculation","documents":"Documents","leaderboard":"Leaderboard","ai_prediction":"AI Prediction","teamsive_passport":"Teamsive Passport","feedback":"Feedback","notes":"Notes","branches":"Branches","settings":"Settings","interval_management":"Interval Management","interval_history":"Intervals History","salary_settings":"Salary Settings","salary_payments":"Salary Payments"};
window.adminLegacyAreas = {"manage_employees":"employees","view_employees":"employees","interval_management":"interval","interval_history":"interval","salary_settings":"salary","salary_payments":"salary"};
window.chooseAdminPermissions = (initial = {}) => new Promise(resolve => {
 const areas = Object.fromEntries(Object.keys(adminModules).map(key => [key,
   initial.areas ? initial.areas[key] === true : (initial[key] || initial[adminLegacyAreas[key]])?.view === true]));
 const actions = Object.fromEntries(['view','edit','delete'].map(action => [action,
   initial.actions ? initial.actions[action] === true : Object.keys(areas).some(key => areas[key] && (initial[key] || initial[adminLegacyAreas[key]])?.[action] === true)]));
 const dialog = document.createElement('dialog');
 dialog.style.cssText='background:var(--bg-card,#142e30);color:var(--text,#fff);border:1px solid #456;border-radius:16px;width:min(90%,520px);max-height:85vh';
 dialog.innerHTML='<h2>Sub-admin permissions</h2><p>Common permissions for all selected areas</p><div style="display:flex;gap:24px">'+['view','edit','delete'].map(action=>'<label><input type="checkbox" data-action="'+action+'" '+(actions[action]?'checked':'')+'> '+action[0].toUpperCase()+action.slice(1)+'</label>').join('')+'</div><hr><p>Select areas visible to this sub-admin</p><div style="max-height:45vh;overflow:auto">'+Object.entries(adminModules).map(([key,label])=>'<label style="display:flex;align-items:center;gap:12px;padding:9px 0"><input type="checkbox" data-area="'+key+'" '+(areas[key]?'checked':'')+'> '+label+'</label>').join('')+'</div><div style="display:flex;gap:16px;margin-top:20px"><button id="permissionCancel">Cancel</button><button id="permissionSave">Continue</button></div>';
 const finish=result=>{dialog.close();dialog.remove();resolve(result);};
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish(null);});
 dialog.querySelector('#permissionCancel').onclick=()=>finish(null);
 dialog.addEventListener('change',event=>{
  const input=event.target;if(!input.dataset.action)return;
  const view=dialog.querySelector('[data-action="view"]');
  if(input.checked && input.dataset.action!=='view')view.checked=true;
  if(!view.checked)dialog.querySelectorAll('[data-action]').forEach(el=>el.checked=false);
 });
 dialog.querySelector('#permissionSave').onclick=()=>{
  dialog.querySelectorAll('[data-action]').forEach(el=>actions[el.dataset.action]=el.checked);
  dialog.querySelectorAll('[data-area]').forEach(el=>areas[el.dataset.area]=el.checked);
  finish({version:2,actions,areas});
 };
 document.body.append(dialog);dialog.showModal();
});

window.adminPageModules = {"dashboard.html":"dashboard","employees.html":"manage_employees","employees_backup.html":"manage_employees","view_employees.html":"view_employees","employee_details.html":"view_employees","hire_resign.html":"hire_resign","manage_companies.html":"companies","subscriptions.html":"subscriptions","intervalmanagement.html":"interval_management","intervals_history.html":"interval_history","timetrack.html":"timetrack","attendance.html":"attendance","leave_management.html":"leaves","salary_settings.html":"salary_settings","salary_payments.html":"salary_payments","monthly_report.html":"monthly_report","salary_report.html":"salary_report","statutory_calulation.html":"statutory_calculation","documents.html":"documents","leaderboard.html":"leaderboard","ai_prediction.html":"ai_prediction","teamsive_passport.html":"teamsive_passport","manage_feedback.html":"feedback","manage_notes.html":"notes","manage_branches.html":"branches","manage_admins.html":"branches","settings.html":"settings","tier_management.html":"subscriptions"};
window.adminPermissionGrants = {};
window.adminCan = (module, action) => {
 if(localStorage.getItem('role')!=='sub_admin')return true;
 const grants=window.adminPermissionGrants;
 if(grants.areas && grants.actions){
  const selected=grants.areas[module]===true || Object.entries(window.adminLegacyAreas).some(([key,group])=>group===module && grants.areas[key]===true);
  return selected && grants.actions.view===true && grants.actions[action]===true;
 }
 const old=grants[module] || grants[window.adminLegacyAreas[module]];
 return old?.view===true && old?.[action]===true;
};
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

