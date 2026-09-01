#!/bin/sh
set -e

# Asegurar que el usuario nextjs pueda escribir donde Prisma necesita los engines
chmod u+w node_modules/@prisma/engines 2>/dev/null || true
chmod u+w node_modules/.prisma 2>/dev/null || true

echo "Aplicando esquema de base de datos..."
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "Iniciando aplicación..."
exec node server.js
