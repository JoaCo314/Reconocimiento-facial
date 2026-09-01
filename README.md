# Reconocimiento Facial — Asistencia

Aplicación web dockerizada de reconocimiento facial para registrar la asistencia ("dar presente").
Construida con **Next.js**, **PostgreSQL** (Prisma ORM) y **face-api.js** (reconocimiento facial en el navegador).

## Funcionalidades

- 👤 **Registrar usuarios**: captura el rostro con la webcam y guarda su descriptor facial (vector de 128 dimensiones) junto a nombre y email.
- ✅ **Dar presente**: al mirar a la cámara, compara en vivo el rostro contra todos los usuarios registrados y registra la asistencia.
- 👥 **Ver usuarios y asistencias**: listado de usuarios con su cantidad de presentes y el historial de asistencias (con filtro por usuario).

## Arquitectura

```
Reconocimiento facial/
├─ docker-compose.yml      # Orquesta app + postgres
├─ Dockerfile              # Imagen de producción (Next standalone)
├─ prisma/schema.prisma    # Modelos User y Presente
├─ public/models/          # Pesos de face-api.js (tiny face detector, landmarks, recognition)
└─ src/
   ├─ app/
   │  ├─ api/
   │  │  ├─ users/route.ts        # POST registrar + GET listar
   │  │  ├─ presente/route.ts     # POST dar presente (compara descriptores)
   │  │  └─ presentes/route.ts    # GET historial de asistencias
   │  ├─ usuarios/                # Vista de usuarios y asistencias
   │  └─ page.tsx                 # UI principal (pestañas presente/registro)
   ├─ components/
   ├─ lib/
   │  ├─ face.ts                  # Carga de modelos y detección facial en el cliente
   │  └─ match.ts                 # Comparación de descriptores (euclidiana)
```

### Flujo de datos

1. El navegador carga los modelos de `face-api.js` desde `/models`.
2. Al registrar, el cliente detecta el rostro, extrae su **descriptor** (128 números) y lo envía a `POST /api/users`, donde se guarda en PostgreSQL.
3. Al dar presente, el cliente extrae el descriptor del rostro en vivo y lo envía a `POST /api/presente`.
4. El servidor compara ese descriptor (distancia euclidiana) contra todos los registrados. Si la distancia es menor al umbral, registra la asistencia.

## Requisitos

- [Docker](https://www.docker.com/get-started) + Docker Compose
- Una webcam

## Puesta en marcha

```bash
# Construir e iniciar
docker compose up --build

# Alternativa: correr en segundo plano
docker compose up --build -d
```

Luego abrí [http://localhost:3000](http://localhost:3000).

Al primer arranque `docker-compose` ejecuta `prisma db push` para crear las tablas automáticamente.

### Uso

1. **Registrar** un usuario: completá nombre y email, mirá a la cámara y presioná "Registrar con mi rostro".
2. **Dar presente**: en la pestaña "Dar Presente", mirá a la cámara y presioná el botón. Si tu rostro coincide con un usuario registrado, se registra la asistencia (con un bloqueo de 2 minutos para evitar duplicados).
3. **Ver usuarios**: entrá a la pestaña "Ver Usuarios".

## Configuración

La conexión a la base de datos se define con la variable de entorno `DATABASE_URL`. En `docker-compose.yml` ya está configurada para el contenedor `db` de PostgreSQL. Ajustá credenciales en el archivo si lo necesitás.

### Umbral de reconocimiento

El umbral de distancia euclidiana para considerar un rostro como "el mismo" se configura en
`src/app/api/presente/route.ts` (`MATCH_THRESHOLD = 0.55`).
Menor valor = más estricto (menos falsos positivos, pero requiere mejor iluminación y ángulo).

## Notas

- El reconocimiento corre **100% en el navegador**: no se envían imágenes a ningún servidor externo; solo se guarda el descriptor numérico.
- Los modelos (≈4.7 MB) se sirven desde `public/models` y solo se cargan una vez.
- Para producción real se recomienda proteger las rutas con autenticación.
