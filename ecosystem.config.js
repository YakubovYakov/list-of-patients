module.exports = {
  apps: [{
    name: 'my-app',
    script: './server.js',
    instances: 1, // Используй 1 процесс (если нужен кластер — можно увеличить)
    autorestart: true, // Автоматический перезапуск
    max_restarts: 10, // Максимум 10 перезапусков
    min_uptime: 10000, // Минимальное время работы до перезапуска (10 секунд)
    watch: false, // Следить за изменениями файлов
    error_file: './logs/err.log', // Логи ошибок
    out_file: './logs/out.log', // Обычные логи
    log_date_format: 'YYYY-MM-DD HH:mm Z', // Формат логов с датой
    env: {
      NODE_ENV: 'production',
    },
  }]
};
