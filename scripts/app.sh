#!/usr/bin/env bash
# app.sh — Arranca/para el servidor de desarrollo en segundo plano para smoke tests.
# Mata SOLO el proceso que escucha en el puerto 5173, nunca "todos los node".
#
#   scripts/app.sh start   → arranca Vite y espera a que responda
#   scripts/app.sh stop    → para el proceso del puerto 5173
#   Log: .tmp/app.log
set -uo pipefail
cd "$(dirname "$0")/.."
PORT=5173

pid_on_port() {
  if [ "${OS:-}" = "Windows_NT" ]; then
    netstat -ano | awk -v p=":$PORT" '$2 ~ p"$" && $4 == "LISTENING" {print $5; exit}'
  else
    lsof -ti tcp:$PORT -sTCP:LISTEN 2>/dev/null | head -1
  fi
}

stop() {
  local pid; pid=$(pid_on_port)
  [ -z "$pid" ] && { echo "Nada escuchando en :$PORT"; return 0; }
  if [ "${OS:-}" = "Windows_NT" ]; then taskkill //PID "$pid" //T //F >/dev/null; else kill "$pid"; fi
  echo "Parado PID $pid (:$PORT)"
}

start() {
  [ -n "$(pid_on_port)" ] && { echo "Ya hay algo en :$PORT (PID $(pid_on_port)). Usa: scripts/app.sh stop"; exit 1; }
  mkdir -p .tmp
  nohup node node_modules/vite/bin/vite.js --port $PORT --strictPort > .tmp/app.log 2>&1 &
  for _ in $(seq 1 30); do
    if curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" 2>/dev/null | grep -q 200; then
      echo "[OK] App en http://localhost:$PORT"; return 0
    fi
    sleep 1
  done
  echo "[FAIL] No arrancó en 30 s. Últimas líneas de .tmp/app.log:"; tail -30 .tmp/app.log; exit 1
}

case "${1:-}" in
  start) start ;;
  stop)  stop ;;
  *) echo "Uso: scripts/app.sh start|stop"; exit 2 ;;
esac
