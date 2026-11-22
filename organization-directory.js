/* BuryatiaGuide v3.7 — локальный каталог организаций с прозрачным происхождением данных. */
(()=>{
 const $=id=>document.getElementById(id); const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let records=Array.isArray(window.BURYATIA_ORGANIZATIONS)?window.BURYATIA_ORGANIZATIONS.slice():[];
 // Optional same-origin API: backend catalog overrides the static seed when reachable.
 fetch('/api/organizations',{headers:{'Accept':'application/json'}}).then(r=>r.ok?r.json():Promise.reject()).then(db=>{if(Array.isArray(db.organizations)&& db.organizations.length){records=db.organizations;render();}}).catch(()=>{});
 const districts=(window.BURYATIA_DISTRICTS||[]).map(x=>x.name);
 const groups=window.BURYATIA_CATEGORY_GROUPS||[];
 const categories=groups.flatMap(g=>g.items.map(x=>({id:x[0],label:x[2]})));
 const district=$('org-district'), category=$('org-category');
 districts.forEach(v=>district.add(new Option(v,v)));
 categories.forEach(v=>category.add(new Option(v.label,v.id)));
 function valid(r){return r&&typeof r.name==='string'&&r.name.trim()&&typeof r.district==='string'&&typeof r.category==='string'&&typeof r.source==='string'&&r.source.trim()&&/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt||'');}
 function render(){const q=($('org-search').value||'').trim().toLocaleLowerCase('ru');const d=district.value,c=category.value;const found=records.filter(r=>(!d||r.district===d)&&(!c||r.category===c)&&(!q||[r.name,r.address,r.phone,r.services,r.district].join(' ').toLocaleLowerCase('ru').includes(q)));
 $('org-count').textContent=`Показано: ${found.length}. Всего записей: ${records.length}.`;
 const root=$('org-results');root.innerHTML='';if(!found.length){const empty=document.createElement('div');empty.className='org-empty';empty.innerHTML='<b>Проверенных карточек пока нет.</b><p>Мы не подставляем вымышленные телефоны, адреса и часы работы. Базу можно дополнить официально проверенными записями через кнопку «Загрузить базу JSON».</p>';root.append(empty);return;}
 found.forEach(r=>{const card=document.createElement('article');card.className='org-card';const status=r.status==='verified'?'Проверено':r.status==='needs_review'?'Требует проверки':'Источник указан';card.innerHTML=`<div class="org-card-top"><span>${esc(categories.find(x=>x.id===r.category)?.label||r.category)}</span><small>${esc(status)}</small></div><h3>${esc(r.name)}</h3><p>${esc(r.district)}${r.address?' · '+esc(r.address):''}</p>${r.phone?`<p><b>Телефон:</b> <a href="tel:${esc(r.phone.replace(/[^+\d]/g,''))}">${esc(r.phone)}</a></p>`:''}${r.hours?`<p><b>Часы работы:</b> ${esc(r.hours)}</p>`:''}${r.services?`<p>${esc(r.services)}</p>`:''}<div class="org-meta">Проверено: ${esc(r.checkedAt)} · <a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">Источник ↗</a></div>`;root.append(card);});
 }
 ['org-search','org-district','org-category'].forEach(id=>$(id).addEventListener(id==='org-search'?'input':'change',render));
 $('org-import-button').addEventListener('click',()=>$('org-import-file').click());
 $('org-import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const rows=Array.isArray(parsed)?parsed:parsed.organizations;if(!Array.isArray(rows)||!rows.every(valid))throw new Error('Не все записи содержат название, район, категорию, источник и дату проверки YYYY-MM-DD.');records=rows;render();alert(`Загружено записей: ${records.length}`);}catch(err){alert('Не удалось загрузить базу: '+err.message);}finally{e.target.value='';}});
 $('org-export-button').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({schemaVersion:1,organizations:records},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='buryatiaguide-organizations.json';a.click();URL.revokeObjectURL(url);});
 render();
})();
