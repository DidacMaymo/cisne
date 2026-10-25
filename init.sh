#!/usr/bin/env bash
# init.sh — Health check del proyecto. Lo ejecutan los agentes (y tú) antes y
# después de trabajar. Si termina con "[OK] Entorno listo", se puede tocar código.
#
# Uso:  ./init.sh            → comprobaciones + lint + build + tests
#       ./init.sh --quick    → comprobaciones + dependencias + tipos
#
# En Windows: ejecútalo desde Git Bash (es lo que usa Claude Code).
set -uo pipefail
cd "$(dirname "$0")"

MODE="${1:-full}"
fail() { printf '\n[FAIL] %s\n' "$1" >&2; exit 1; }
step() { printf '\n==> %s\n' "$1"; }
mkdir -p .tmp
LOG=.tmp/check.log

# 1. Node >= 20 (la máquina del usuario tiene 20.10: no exigir más)
step "Node"
command -v node >/dev/null 2>&1 || fail "No se encuentra 'node' en el PATH."
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 20 ] 2>/dev/null || fail "Se necesita Node 20+, encontrado: $(node -v)"
node -v

# 2. Ficheros del arnés (si falta alguno, los agentes van a ciegas)
step "Arnés"
for f in AGENTS.md CLAUDE.md CHECKPOINTS.md feature_list.md progress/current.md \
         docs/architecture.md docs/conventions.md docs/verification.md \
         .claude/agents/implementer.md .claude/agents/reviewer.md; do
  [ -f "$f" ] || fail "Falta $f"
done
IN_PROGRESS=$(grep -c '^\- \*\*Estado:\*\* in_progress' feature_list.md || true)
[ "$IN_PROGRESS" -le 1 ] || fail "Hay $IN_PROGRESS features en in_progress (máximo 1)."
echo "OK ($IN_PROGRESS feature en curso)"

# 3. Dependencias al día con package-lock.json (si no, el build falla con
#    errores raros de módulos que no existen)
step "Dependencias"
if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  # npm ci borra node_modules: con Vite encendido, Windows bloquea ficheros y
  # la instalación se queda a medias. Mejor parar antes.
  if curl -s -o /dev/null --max-time 2 http://localhost:5173/ 2>/dev/null; then
    fail "Hay que reinstalar dependencias, pero el servidor de desarrollo está encendido en :5173. Páralo (Ctrl+C o scripts/app.sh stop) y repite."
  fi
  echo "node_modules desactualizado → npm ci"
  npm ci --no-audit --no-fund > "$LOG" 2>&1 || { tail -30 "$LOG"; fail "npm ci falló."; }
fi
echo "OK"

run() { # run "<título>" <comando...>: salida a $LOG; si falla, muestra el final
  step "$1"; shift
  if "$@" > "$LOG" 2>&1; then echo "OK"; else tail -40 "$LOG"; fail "$* en rojo (log completo en $LOG)."; fi
}

if [ "$MODE" = "--quick" ]; then
  run "Tipos" npx tsc -b
else
  run "Lint" npm run lint
  run "Build (tipos + Vite)" npm run build
  step "Tests de la base de datos (RLS)"
  if npm run test:db > "$LOG" 2>&1; then
    echo "OK ($(grep -c '^✓' "$LOG") casos)"
  else
    grep -E '^(✓|✗|Error|AssertionError)' "$LOG" | tail -20; tail -15 "$LOG"
    fail "test:db en rojo (log completo en $LOG)."
  fi
  if node -e 'process.exit(require("./package.json").scripts?.test ? 0 : 1)'; then
    run "Tests unitarios" npm test
  fi
fi

# 4. Higiene: nada de debug suelto ni secretos en el código
step "Higiene"
if grep -rnE 'console\.log\(' src 2>/dev/null; then
  fail "Hay console.log en src/. Quítalo (o usa console.error para errores reales)."
fi
# Claves pegadas en el código: secret nueva (sb_secret_…) o JWT antiguo (anon/service_role).
if grep -rnE 'sb_secret_[A-Za-z0-9_-]{8,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}' src public index.html .env.example 2>/dev/null; then
  fail "Hay una clave de Supabase pegada en el código. Va en .env.local, nunca en el repo."
fi
if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  fail ".env.local está en Git. Sácalo: git rm --cached .env.local"
fi
echo "OK"

printf '\n[OK] Entorno listo\n'
