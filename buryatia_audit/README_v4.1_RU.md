# BuryatiaGuide v4.1 — backend foundation

- Добавлен Node.js API без внешних зависимостей.
- Каталог организаций может загружаться из API; при отсутствии backend статический каталог остаётся доступен.
- Добавлены health check, публичное чтение каталога, защищённая Bearer-авторизацией замена каталога, валидация полей, атомарная запись JSON и audit log.
- Добавлены пример env, руководство запуска, deployment checklist.

**Не реализовано:** автоматический импорт внешних реестров, production database, публичный deployment, TLS, reverse proxy, rate limiting, полноценная админ-панель.
