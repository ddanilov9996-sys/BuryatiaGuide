(() => {
  const $ = (id) => document.getElementById(id);
  let current = null;
  const token = () => $('token').value.trim();
  const say = (text, kind = '') => { $('message').textContent = text; $('message').className = `message ${kind}`; };
  const api = async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { Accept: 'application/json', ...(options.headers || {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Ошибка HTTP ${response.status}`);
    return body;
  };
  const display = (data) => { current = data; $('json').value = JSON.stringify(data, null, 2); };
  async function health() {
    try { const data = await api('/api/health'); $('health').textContent = data.ok ? 'API доступен' : 'API недоступен'; }
    catch { $('health').textContent = 'API не отвечает'; }
  }
  $('load').addEventListener('click', async () => {
    say(''); $('load').disabled = true;
    try { display(await api('/api/organizations')); say('Каталог загружен с сервера.', 'ok'); }
    catch (e) { say(e.message, 'error'); }
    finally { $('load').disabled = false; }
  });
  $('file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { const data = JSON.parse(await file.text()); display(data); say(`Файл «${file.name}» прочитан. Нажмите «Проверить и сохранить».`, 'ok'); }
    catch (e) { say(`Не удалось прочитать JSON: ${e.message}`, 'error'); }
    event.target.value = '';
  });
  $('download').addEventListener('click', () => {
    try {
      const data = JSON.parse($('json').value);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'buryatia-organizations.json'; a.click(); URL.revokeObjectURL(url);
      say('JSON подготовлен для скачивания.', 'ok');
    } catch (e) { say(`Некорректный JSON: ${e.message}`, 'error'); }
  });
  $('save').addEventListener('click', async () => {
    if (!token()) return say('Введите токен администратора.', 'error');
    let data;
    try { data = JSON.parse($('json').value); } catch (e) { return say(`Некорректный JSON: ${e.message}`, 'error'); }
    if (!Array.isArray(data) && !Array.isArray(data?.organizations)) return say('В JSON должен быть массив organizations.', 'error');
    if (!window.confirm('Сохранить каталог? Текущие записи на сервере будут полностью заменены.')) return;
    $('save').disabled = true; say('Проверяем и сохраняем…');
    try {
      const result = await api('/api/admin/organizations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(data) });
      say(`Сохранено записей: ${result.count}. Время: ${result.updatedAt}.`, 'ok');
      display(await api('/api/organizations'));
    } catch (e) { say(e.message, 'error'); }
    finally { $('save').disabled = false; }
  });
  health();
})();
