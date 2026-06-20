# Backend - Mundial API

API en Node + Express con datos en memoria.

## Scripts
- `npm install`
- `npm run dev` — modo desarrollo con nodemon
- `npm start` — modo producción

Servidor por defecto en `http://localhost:3005`.

## Endpoints

### Autenticación
- `POST /auth/registrar` — body: `{ nombre, correo, password }`
- `POST /auth/login` — body: `{ correo, password }`

### Partidos
- `GET /partido` — lista todos los partidos
- `GET /partido/:id` — detalle de un partido
- `PUT /partido/:id/marcador` (auth) — body: `{ equipo1, equipo2 }`

### Predicciones (auth)
- `GET /prediccion` — lista mis predicciones
- `GET /prediccion/partido/:partidoId` — mi predicción para un partido
- `POST /prediccion` — body: `{ partidoId, equipo1, equipo2 }`
- `DELETE /prediccion/:id`

El token JWT debe enviarse en `Authorization: Bearer <token>`.
