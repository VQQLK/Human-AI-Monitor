// Принудительный выход после завершения тестов
// Miniflare иногда не закрывает WebSocket/ZLIB/FileHandle ресурсы
// Это безопасный workaround — тесты уже прошли успешно
export default function () {
  // Даём Miniflare 2 секунды на graceful shutdown
  setTimeout(() => {
    if (process.exitCode === undefined) {
      process.exit(0);
    }
  }, 2000);
}
