/* Транспортный раздел: не публикуем неподтверждённые номера, интервалы и расписания. */
(()=>{
 const input=document.getElementById('transport-search'),filter=document.getElementById('transport-filter'),root=document.getElementById('transport-results');
 if(!root)return;
 const render=()=>{const q=(input?.value||'').trim();const type=filter?.value||'all';root.innerHTML='';const box=document.createElement('article');box.className='transport-card';const h=document.createElement('h3');h.textContent=q?`Поиск маршрута: ${q}`:'Маршруты и расписания';const p=document.createElement('p');p.textContent='Подтверждённая база маршрутов пока не подключена. Чтобы не вводить пассажиров в заблуждение, номера, остановки и время отправления здесь не выдумываются.';const a=document.createElement('a');a.href='https://yandex.ru/maps/';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Проверить маршрут в Яндекс Картах ↗';const b=document.createElement('a');b.href='https://ulan-ude-bus.ru/';b.target='_blank';b.rel='noopener noreferrer';b.textContent='Схемы и остановки Улан-Удэ ↗';box.append(h,p,a,b);if(type==='tram'){const note=document.createElement('small');note.textContent='Для трамваев также проверяйте актуальную информацию у городского перевозчика.';box.append(note)}root.append(box);};
 input?.addEventListener('input',render);filter?.addEventListener('change',render);render();
})();
