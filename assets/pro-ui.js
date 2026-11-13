(function(){
  'use strict';

  const THEME_KEY='elitt_ui_v12_beta';
  const publicMode=(typeof isAnyPublicRequestV117==='function'&&isAnyPublicRequestV117());
  if(publicMode) return;
  const legacy={
    render: typeof render==='function'?render:null,
    dash: typeof dash==='function'?dash:null,
    real: typeof real==='function'?real:null,
    planning: typeof planningPageV1124==='function'?planningPageV1124:null,
    planadmin: typeof planningAdminPageV1124==='function'?planningAdminPageV1124:null,
    blocked: typeof blockedPage==='function'?blockedPage:null,
    times: typeof timesPageV1112==='function'?timesPageV1112:null,
    history: typeof historyPage==='function'?historyPage:null,
    people: typeof people==='function'?people:null,
    workshop: typeof workshopPageV1123==='function'?workshopPageV1123:null,
    archives: typeof archivesPage==='function'?archivesPage:null,
    detail: typeof vehicleDetail==='function'?vehicleDetail:null
  };

  function isPro(){return document.body.classList.contains('v12-pro');}
  function saveTheme(value){try{localStorage.setItem(THEME_KEY,value);}catch(e){}}
  function loadTheme(){try{return localStorage.getItem(THEME_KEY)==='pro';}catch(e){return false;}}

  function installSwitch(){
    const actions=document.querySelector('.mainHeaderActions');
    if(!actions||document.getElementById('v12UiSwitch')) return;
    const wrap=document.createElement('div');
    wrap.className='v12-ui-switch';
    wrap.innerHTML='<span class="v12-label">Interface</span><button id="v12UiSwitch" type="button" aria-label="Basculer entre interface actuelle et interface professionnelle"></button><span id="v12UiState" class="v12-state">Actuel</span>';
    actions.insertBefore(wrap,actions.firstChild);
    wrap.querySelector('button').addEventListener('click',()=>{
      document.body.classList.toggle('v12-pro');
      saveTheme(isPro()?'pro':'current');
      updateSwitch();
      render();
    });
    updateSwitch();
  }

  function updateSwitch(){
    const b=document.getElementById('v12UiSwitch');
    const s=document.getElementById('v12UiState');
    if(b)b.setAttribute('aria-pressed',isPro()?'true':'false');
    if(s)s.textContent=isPro()?'Pro':'Actuel';
  }

  const navIcons={dash:'▦',workshop:'▣',planning:'▤',real:'⚒',blocked:'⚠',times:'◷',history:'≡',people:'👥',archives:'▰'};
  function renderProNav(){
    const nav=document.getElementById('nav');
    if(!nav)return;
    const visible=isAdminV1117()?pages:pages.filter(([key])=>!['people','archives'].includes(key));
    nav.innerHTML=visible.map(([key,label])=>`<button class="${page===key?'active':''}" onclick="page='${key}';render()"><span class="v12-nav-icon">${navIcons[key]||'•'}</span><span class="v12-nav-label">${escHtml(label)}</span></button>`).join('');
  }

  function fmtInt(n){return new Intl.NumberFormat('fr-FR').format(Math.max(0,Number(n)||0));}
  function normalVehicles(){return activeNormalVehicles();}
  function allActiveOfs(){return normalVehicles().flatMap(v=>v.ofs||[]);}

  function vehicleStatusV12(vehicle){
    if(remain(vehicle)<=0)return {key:'done',label:'Terminé'};
    const blocked=blockedCount(vehicle); if(blocked)return {key:'blocked',label:`${blocked} bloqué${blocked>1?'s':''}`};
    const paused=pausedOFCountV11143(vehicle); if(paused)return {key:'pause',label:`${paused} en pause`};
    const run=runningOFCountV11143(vehicle); if(run)return {key:'run',label:`${run} en cours`};
    const planned=(state.planningV1124||[]).filter(item=>item.vehicleId===vehicle.id&&planningStatusV1124(item).key==='todo').length;
    if(planned)return {key:'plan',label:`${planned} planifié${planned>1?'s':''}`};
    return {key:'todo',label:'À faire'};
  }

  function phaseCellV12(vehicle,cat){
    const s=phaseStatsV5(vehicle,cat); const p=Math.max(0,Math.min(100,s.hoursPct||0));
    return `<div class="v12-phase-cell"><div class="v12-phase-cell-top"><b>${p}%</b><span>${fmtHoursMinutesV11122(s.doneHours)} / ${fmtHoursMinutesV11122(s.totalHours)}</span></div><div class="v12-progress green"><span style="width:${p}%"></span></div><small>${s.done}/${s.total} réalisations • reste ${fmtHoursMinutesV11122(s.remainingHours)}</small></div>`;
  }

  function dashboardRowV12(vehicle,estimates){
    const status=vehicleStatusV12(vehicle); const overall=Math.max(0,Math.min(100,pct(vehicle))); const pri=Number(vehicle.priority)||1;
    const note=`<button class="small ${vehicleHasNoteV1122(vehicle)?'warn':'alt'}" onclick="openVehicleNoteV1122('${vehicle.id}')">Note</button>`;
    const actions=isAdminV1117()?`${note}<button class="small good" onclick="openVehicleDetail('${vehicle.id}')">Ouvrir</button><button class="small alt" onclick="openVehicle('${vehicle.id}')">Modifier</button>`:note;
    const search=[vehicle.vin,vehicle.brand,vehicle.client,vehicle.type,...(vehicle.selectedOptions||[])].join(' ').toLowerCase();
    return `<tr data-v12-search="${escHtml(search)}"><td><div class="v12-vin"><span class="v12-vin-dot" style="background:${escHtml(vehicleColor(vehicle))}"></span><div><b>${escHtml(vehicle.vin)}</b><small>${escHtml(vehicle.type||'CCF')}</small></div></div></td><td><b>${escHtml(vehicle.brand||'-')}</b></td><td>${escHtml(vehicle.client||'-')}</td><td><div class="optionchips">${vehicleOptionsHtml(vehicle)}</div></td><td><span class="v12-priority ${pri===1?'high':''}">${pri}</span></td><td>${phaseCellV12(vehicle,'Fabrication')}</td><td>${phaseCellV12(vehicle,'Prémontage')}</td><td>${phaseCellV12(vehicle,'Pose')}</td><td>${phaseCellV12(vehicle,'Essais')}</td><td><div style="min-width:100px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><b>${overall}%</b></div><div class="v12-progress"><span style="width:${overall}%"></span></div></div></td><td><span class="v12-status ${status.key}">${escHtml(status.label)}</span></td><td><b>${fmt(remain(vehicle))}</b></td><td>${deadlineHtmlV115(vehicle,estimates[vehicle.id],false)}</td><td><b>${remain(vehicle)>0?escHtml(fmtDate(estimates[vehicle.id])):'Terminé'}</b><div class="muted">hors week-end et fériés</div></td><td><div class="actions wrap">${actions}</div></td></tr>`;
  }

  function filterDashboardV12(){
    const q=(document.getElementById('v12DashSearch')?.value||'').trim().toLowerCase();
    const rows=[...document.querySelectorAll('#v12VehicleRows tr[data-v12-search]')];
    let shown=0; rows.forEach(r=>{const ok=!q||r.dataset.v12Search.includes(q);r.style.display=ok?'':'none';if(ok)shown++;});
    const c=document.getElementById('v12VehicleCount');if(c)c.textContent=`${shown} véhicule${shown>1?'s':''}`;
  }
  window.filterDashboardV12=filterDashboardV12;

  function proDashboard(){
    normalizeAll(); setHead('Tableau de bord','Vue d’ensemble de la production');
    const vehicles=normalVehicles(); const savs=activeVehicles().filter(isSAV); const ofs=allActiveOfs(); const estimates=estimateVehiclesActive();
    const running=vehicles.reduce((n,v)=>n+runningOFCountV11143(v),0); const paused=vehicles.reduce((n,v)=>n+pausedOFCountV11143(v),0); const blocked=vehicles.reduce((n,v)=>n+blockedCount(v),0); const done=vehicles.reduce((n,v)=>n+doneOf(v),0); const remainH=vehicles.reduce((n,v)=>n+remain(v),0);
    const planned=(state.planningV1124||[]).filter(i=>planningStatusV1124(i).key==='todo').length;
    const phases=['Fabrication','Prémontage','Pose','Essais'].map(cat=>{const a=vehicles.reduce((x,v)=>{const s=phaseStatsV5(v,cat);x.done+=s.doneHours;x.total+=s.totalHours;return x;},{done:0,total:0});return {cat,...a,pct:a.total?Math.round(a.done/a.total*100):0};});
    const totalH=phases.reduce((n,x)=>n+x.total,0), doneH=phases.reduce((n,x)=>n+x.done,0), gp=totalH?Math.round(doneH/totalH*100):0;
    const savRunning=savs.filter(v=>['running','paused'].includes(savWorkStatusV1114(v).key)).length;
    document.getElementById('view').innerHTML=`<div class="v12-page">
      <div class="v12-kpi-grid">
        ${kpi('🚒','Véhicules en production',vehicles.length,`${archivedVehicles().filter(v=>!isSAV(v)).length} archivés`)}
        ${kpi('▶','OF en cours',running,`${fmtInt(ofs.length)} OF au total`)}
        ${kpi('Ⅱ','OF en pause',paused,`${blocked} bloqué${blocked>1?'s':''}`)}
        ${kpi('✓','OF terminés',done,`${ofs.length?Math.round(done/ofs.length*100):0}% des lignes OF`)}
        ${kpi('◷','Temps restant',fmtHoursMinutesV11122(remainH),'hors week-end et fériés')}
        ${kpi('🛠','SAV en cours',savRunning,`${savs.length} SAV actif${savs.length>1?'s':''}`)}
      </div>
      <div class="v12-grid-3">
        <div class="v12-card"><div class="v12-card-title"><span>Avancement global</span><small>heures OF</small></div><div class="v12-donut-wrap"><div class="v12-donut" style="--p:${gp}"><strong>${gp}%</strong></div><div class="v12-legend"><div class="v12-legend-row"><span>Réalisé</span><b>${fmtHoursMinutesV11122(doneH)}</b></div><div class="v12-legend-row"><span>Restant</span><b>${fmtHoursMinutesV11122(Math.max(0,totalH-doneH))}</b></div><div class="v12-legend-row"><span>Total</span><b>${fmtHoursMinutesV11122(totalH)}</b></div></div></div></div>
        <div class="v12-card"><div class="v12-card-title"><span>Avancement par phase</span><small>${vehicles.length} véhicules</small></div><div class="v12-phase-list">${phases.map(x=>`<div class="v12-phase-row"><label>${x.cat}</label><div class="v12-progress green"><span style="width:${x.pct}%"></span></div><small>${x.pct}% • ${fmtHoursMinutesV11122(x.done)}</small></div>`).join('')}</div></div>
        <div class="v12-card"><div class="v12-card-title"><span>Situation atelier</span><small>temps réel</small></div><div class="v12-situation"><div class="run"><span>OF en cours</span><strong>${running}</strong></div><div class="pause"><span>OF en pause</span><strong>${paused}</strong></div><div class="block"><span>OF bloqués</span><strong>${blocked}</strong></div><div class="plan"><span>OF planifiés</span><strong>${planned}</strong></div></div></div>
      </div>
      <div class="v12-card" style="padding:0;overflow:hidden"><div class="v12-card-title" style="padding:13px 14px 0"><span>Suivi des véhicules</span><div class="v12-toolbar"><input id="v12DashSearch" class="v12-search" oninput="filterDashboardV12()" placeholder="Rechercher VIN, marque, client..."><span id="v12VehicleCount" class="v12-chip blue">${vehicles.length} véhicule${vehicles.length>1?'s':''}</span></div></div><div class="v12-table-wrap" style="border:0;border-radius:0;box-shadow:none"><table class="v12-table v12-vehicle-table"><thead><tr><th>VIN</th><th>Marque</th><th>Client</th><th>Options</th><th>Priorité</th><th>Fabrication</th><th>Prémontage</th><th>Pose</th><th>Essais</th><th>Global</th><th>Statut</th><th>Restant</th><th>Objectif</th><th>Fin estimée</th><th>Actions</th></tr></thead><tbody id="v12VehicleRows">${vehicles.map(v=>dashboardRowV12(v,estimates)).join('')}</tbody></table></div></div>
    </div>`;
  }

  function kpi(icon,label,value,sub){return `<div class="v12-kpi"><div class="v12-kpi-head"><span class="v12-kpi-icon">${icon}</span>${label}</div><div class="v12-kpi-value">${value}</div><div class="v12-kpi-sub">${sub||''}</div></div>`;}

  function prependRealSummary(){
    const view=document.getElementById('view'); if(!view)return;
    const vehicles=normalVehicles(); const ofs=allActiveOfs();
    const running=vehicles.reduce((n,v)=>n+runningOFCountV11143(v),0), paused=vehicles.reduce((n,v)=>n+pausedOFCountV11143(v),0), blocked=vehicles.reduce((n,v)=>n+blockedCount(v),0), remaining=vehicles.reduce((n,v)=>n+remain(v),0);
    view.classList.add('v12-page');
    view.insertAdjacentHTML('afterbegin',`<div class="v12-real-summary"><div class="v12-mini-kpi"><span>OF à suivre</span><b>${ofs.length}</b></div><div class="v12-mini-kpi"><span>En cours</span><b>${running}</b></div><div class="v12-mini-kpi"><span>En pause / bloqués</span><b>${paused+blocked}</b></div><div class="v12-mini-kpi"><span>Temps restant</span><b>${fmtHoursMinutesV11122(remaining)}</b></div></div>`);
  }

  function proReal(){legacy.real();prependRealSummary();}

  function proPlanningAdmin(){
    legacy.planadmin();
    const view=document.getElementById('view'); if(!view)return; view.classList.add('v12-page');
    view.insertAdjacentHTML('afterbegin','<div class="v12-card"><div class="v12-card-title"><span>Planification de la production</span><small>1. VIN → 2. OF → 3. personne → ordre</small></div><div class="v12-toolbar"><span class="v12-chip blue">1 Sélection VIN</span><span class="v12-chip blue">2 Sélection OF</span><span class="v12-chip blue">3 Attribution</span><span class="v12-chip">4 Ordre par personne</span></div></div>');
  }

  function proPlanningUser(){legacy.planning();const v=document.getElementById('view');if(v)v.classList.add('v12-page');}

  function proPeople(){
    if(!requireAdminV1117('la gestion des personnes')){page='dash';render();return;}
    normalizeAll();setHead('Personnes','Équipe, horaires et disponibilités');
    const cards=(state.people||[]).map(p=>{const name=personName(p);const hrs=hoursDaySchedule(p);const vacations=(p.vacations||[]).length;const role=Object.entries(USER_EMAIL_PERSON_V1116).find(([,n])=>n.toLowerCase()===name.toLowerCase())?.[0];const roleLabel=role?(USERS_ROLES[role]||'user'):'personne';return `<div class="v12-person"><div class="v12-person-head"><div class="v12-person-avatar">${escHtml(name.charAt(0).toUpperCase())}</div><div><div class="v12-person-name">${escHtml(name)}</div><div class="v12-person-role">${escHtml(roleLabel==='admin'?'Administrateur':roleLabel==='user'?'Utilisateur':'Personne')}</div></div></div><div class="v12-person-stats"><div class="v12-person-stat"><span>Contrat</span><b>${escHtml(p.mode||'39h')}</b></div><div class="v12-person-stat"><span>Heures / semaine</span><b>${fmt(hrs)}</b></div><div class="v12-person-stat"><span>Congés enregistrés</span><b>${vacations}</b></div><div class="v12-person-stat"><span>Planning</span><b>${(state.planningV1124||[]).filter(x=>x.person===name&&planningStatusV1124(x).key!=='done').length} tâche(s)</b></div></div><div class="v12-person-actions"><button class="alt" onclick="editPerson('${p.id}')">Créneaux</button><button class="warn" onclick="openVacation('${p.id}')">Congés</button><button class="bad" onclick="removePerson('${p.id}')">Supprimer</button></div></div>`;}).join('');
    document.getElementById('view').innerHTML=`<div class="v12-page"><div class="v12-card"><div class="v12-toolbar"><input id="pname" class="v12-search" placeholder="Nom de la personne"><button onclick="addPerson()">+ Ajouter</button><span class="v12-chip blue">${state.people.length} personnes</span></div></div><div class="v12-people-grid">${cards}</div></div>`;
  }

  function proHistory(){
    setHead('Historique','Journal des validations, blocages et actions');
    const items=(state.history||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
    document.getElementById('view').innerHTML=`<div class="v12-page"><div class="v12-card"><div class="v12-card-title"><span>Historique des actions</span><small>${items.length} événement${items.length>1?'s':''}</small></div><div class="v12-timeline">${items.length?items.map(i=>`<div class="v12-history-item"><div class="v12-history-dot"></div><div class="v12-history-time">${escHtml(new Date(i.date).toLocaleString('fr-FR'))}</div><div class="v12-history-main"><b>${escHtml(i.action||'Action')}</b>${i.vin?` • ${escHtml(i.vin)}`:''}${i.of?` • ${escHtml(i.of)}`:''}${i.person?` • ${escHtml(i.person)}`:''}${i.detail?`<div class="muted" style="margin-top:3px">${escHtml(i.detail)}</div>`:''}</div></div>`).join(''):'<div class="muted">Aucun historique.</div>'}</div></div></div>`;
  }

  function proBlocked(){legacy.blocked();const v=document.getElementById('view');if(!v)return;v.classList.add('v12-page');const groups=groupedBlockedOFs();v.insertAdjacentHTML('afterbegin',`<div class="v12-alert-summary"><div><span>OF bloqués regroupés</span><b>${groups.length}</b></div><div><span>VIN concernés</span><b>${new Set(groups.flatMap(g=>g.items.map(x=>x.vehicle.id))).size}</b></div><div><span>Blocages actifs</span><b>${groups.reduce((n,g)=>n+g.items.length,0)}</b></div></div>`);}

  function proTimes(){legacy.times();const v=document.getElementById('view');if(v)v.classList.add('v12-page');}

  function decorateFallback(fn){fn&&fn();const v=document.getElementById('view');if(v)v.classList.add('v12-page');}

  function proRender(){
    if(!isAdminV1117()&&adminOnlyPageV1117(page))page='dash';
    if(page!=='workshop'&&document.body.classList.contains('workshopFullscreenV1123'))document.body.classList.remove('workshopFullscreenV1123');
    renderProNav();
    const map={dash:proDashboard,workshop:()=>decorateFallback(legacy.workshop),planning:proPlanningUser,planadmin:proPlanningAdmin,real:proReal,blocked:proBlocked,times:proTimes,history:proHistory,people:proPeople,archives:()=>decorateFallback(legacy.archives),detail:()=>decorateFallback(legacy.detail)};
    (map[page]||proDashboard)();
    if(typeof renderNotificationBellV1115==='function')renderNotificationBellV1115();
    applyRoleUiV1117();
  }

  // Keep direct calls such as setRealModeV5()->real() inside the selected UI.
  if(legacy.real) real=function(){return isPro()?proReal():legacy.real();};
  if(legacy.people) people=function(){return isPro()?proPeople():legacy.people();};
  if(legacy.history) historyPage=function(){return isPro()?proHistory():legacy.history();};
  if(legacy.blocked) blockedPage=function(){return isPro()?proBlocked():legacy.blocked();};
  if(legacy.times) timesPageV1112=function(){return isPro()?proTimes():legacy.times();};
  if(legacy.planadmin) planningAdminPageV1124=function(){return isPro()?proPlanningAdmin():legacy.planadmin();};
  if(legacy.planning) planningPageV1124=function(){return isPro()?proPlanningUser():legacy.planning();};
  if(legacy.dash) dash=function(){return isPro()?proDashboard():legacy.dash();};

  if(legacy.render){render=function(){return isPro()?proRender():legacy.render();};}

  // Install before Firebase auth fires its first render on window load.
  document.body.classList.toggle('v12-pro',loadTheme());
  installSwitch();
  updateSwitch();
})();
