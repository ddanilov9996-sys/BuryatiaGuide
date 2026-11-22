/* Образовательный справочник BuryatiaGuide. Имена из опубликованных русскоязычных источников; контакты/адреса требуют отдельной проверки. */
const educationRecords = [
{type:'college',name:'Бурятский республиканский информационно-экономический техникум'},
{type:'college',name:'Байкальский многопрофильный колледж'},
{type:'college',name:'Республиканский базовый медицинский колледж имени Э. Р. Раднаева'},
{type:'college',name:'Бурятский республиканский педагогический колледж'},
{type:'college',name:'Бурятский республиканский индустриальный техникум'},
{type:'college',name:'Гусиноозёрский энергетический техникум'},
{type:'college',name:'Политехнический техникум'},
{type:'college',name:'Бурятский аграрный колледж имени М. Н. Ербанова'},
{type:'college',name:'Бурятский республиканский техникум строительных и промышленных технологий'},
{type:'college',name:'Техникум строительства и городского хозяйства'},
{type:'college',name:'Байкальский колледж туризма и сервиса'},
{type:'college',name:'Байкальский колледж недропользования'},
{type:'college',name:'Байкальский колледж технологий и лесопользования'},
{type:'college',name:'Улан-Удэнский авиационный техникум'},
{type:'college',name:'Джидинский многопрофильный техникум'},
{type:'college',name:'Закаменский агропромышленный техникум'},
{type:'college',name:'Колледж традиционных искусств народов Забайкалья'},
{type:'college',name:'Бурятский лесопромышленный колледж'},
{type:'college',name:'Республиканский многоуровневый колледж'},
{type:'college',name:'Республиканский межотраслевой техникум'},
{type:'college',name:'Улан-Удэнский торгово-экономический техникум'},
{type:'college',name:'Бурятский финансово-кредитный колледж'},
{type:'college',name:'Бурятский республиканский техникум автомобильного транспорта'},
{type:'college',name:'Авиационный техникум'},
{type:'college',name:'Кижингинский филиал Бурятского аграрного колледжа'},
{type:'college',name:'Кяхтинский филиал Байкальского базового медицинского колледжа'},
{type:'college',name:'Могойтинский филиал Байкальского колледжа туризма и сервиса'},
{type:'college',name:'Тарбагатайский филиал Байкальского колледжа туризма и сервиса'},
{type:'college',name:'Татауровский филиал Байкальского колледжа туризма и сервиса'},
{type:'college',name:'Мухоршибирский филиал Байкальского колледжа недропользования'},
{type:'college',name:'Сосново-Озёрский филиал Бурятского аграрного колледжа'},
{type:'university',name:'Бурятский государственный университет имени Доржи Банзарова'},
{type:'university',name:'Восточно-Сибирский государственный университет технологий и управления'},
{type:'university',name:'Бурятская государственная сельскохозяйственная академия имени В. Р. Филиппова'},
{type:'university',name:'Восточно-Сибирский государственный институт культуры'},
{type:'university',name:'Бурятский институт инфокоммуникаций — филиал СибГУТИ'}
];
const educationMeta={source:'https://93school.ru/wp-content/uploads/2024/04/Атлас-доступных-профессий.pdf',source2:'https://buryatia.mid.ru/',status:'Проверить адрес, телефон, сайт и программы обучения перед публикацией'};
function renderEducationDirectory(){
 const host=document.getElementById('education-directory'); if(!host)return;
 const schools=educationRecords.filter(x=>x.type==='college'); const universities=educationRecords.filter(x=>x.type==='university');
 host.innerHTML=`<div class="education-controls"><input id="education-search" type="search" placeholder="Поиск школы, колледжа или вуза" aria-label="Поиск образовательных учреждений"><select id="education-kind"><option value="all">Все типы</option><option value="college">Колледжи и техникумы</option><option value="university">Вузы</option></select></div><p class="education-warning">Предварительный список из опубликованных источников. Адреса, телефоны, филиалы и актуальный статус нужно проверять. Список школ и детских садов поимённо будет добавлен из официального реестра.</p><p class="education-count">${schools.length} колледжей/техникумов и филиалов · ${universities.length} вузов</p><div class="education-list" id="education-list"></div><p class="footer-note">Источники: <a href="${educationMeta.source}" target="_blank" rel="noopener">перечень образовательных организаций в PDF</a>; <a href="${educationMeta.source2}" target="_blank" rel="noopener">официальные региональные материалы</a>. Списки справочные; статус проверяется отдельно.</p>`;
 const render=()=>{const q=(document.getElementById('education-search').value||'').toLowerCase().trim();const kind=document.getElementById('education-kind').value;const list=document.getElementById('education-list');const rows=educationRecords.filter(r=>(kind==='all'||r.type===kind)&&(!q||r.name.toLowerCase().includes(q))).map(r=>`<article class="education-card"><span class="education-tag">${r.type==='college'?'Колледж / техникум':'Высшее образование'}</span><h3>${r.name}</h3><small>Контакты и адрес требуют проверки</small></article>`).join('');list.innerHTML=rows||'<p>По запросу ничего не найдено.</p>';};host.querySelector('#education-search').addEventListener('input',render);host.querySelector('#education-kind').addEventListener('change',render);render();}
document.addEventListener('DOMContentLoaded',renderEducationDirectory);
