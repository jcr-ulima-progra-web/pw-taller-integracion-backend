# Backend - Mundial API

API REST en Node.js + Express con datos en memoria. Autenticación con JWT, passwords con bcrypt. Inspirada en el repo de referencia https://github.com/otro34/in-memory-express-api.

## Stack
- Node con ESM (`"type": "module"`)
- Express 5
- jsonwebtoken, bcryptjs
- body-parser, cors
- nodemon en dev

## Scripts
```bash
npm install
npm run dev    # nodemon
npm start      # node index.js
```
Puerto: **3005**.

## Arquitectura

```
backend/
├── index.js                    # bootstrap Express y monta routers
└── src/
    ├── routes/                 # routers Express (un archivo por dominio)
    │   ├── usuario.js
    │   ├── partido.js
    │   └── prediccion.js
    ├── controllers/            # parsean req/res, delegan al service
    ├── services/               # lógica de negocio
    ├── repositories/           # acceso in-memory (findAll, findOne, create, update, remove)
    ├── models/                 # arrays semilla (no clases)
    └── middleware/
        └── auth.js             # authMiddleware (JWT) + adminMiddleware
```

Flujo: `route → middleware (auth) → controller → service → repository → model`.

### Convenciones
- Cada repositorio expone: `findAll`, `findOne`, `findBy*`, `create`, `update`, `remove`. Usa `parseInt` para comparar ids.
- El modelo se importa como `let data = [...modelRaw]` para no mutar el array semilla por referencia.
- Los services devuelven `{ success, message, ...payload }` y los controllers eligen el status code en base a `success`.
- En servicio, sanitizar usuarios con `sanitize()` para no exponer `password`.
- IDs autoincrementales por contador local al repositorio.

## Autenticación / Autorización
- `authMiddleware` lee `Authorization: Bearer <token>` y carga `req.usuario = { id, nombre, correo, rol }`.
- `adminMiddleware` (named export en `middleware/auth.js`) requiere `req.usuario.rol === 'admin'` → 403 si no.
- JWT_SECRET hardcodeado en `middleware/auth.js` (es un taller, no producción).
- Las predicciones bloquean explícitamente al admin (`bloquearAdmin` en `routes/prediccion.js`) — "el admin no predice".

## Endpoints

### Auth
- `POST /auth/registrar` — `{ nombre, correo, password }` → crea usuario con `rol: 'usuario'`.
- `POST /auth/login` — `{ correo, password }` → `{ token, usuario }`.
- `GET /auth/usuarios` (admin) — lista usuarios con `totalPredicciones`, `resueltas`, `aciertos`.

### Partidos
- `GET /partido` — público.
- `GET /partido/:id` — público.
- `PUT /partido/:id/marcador` (admin) — `{ equipo1, equipo2 }`.

### Predicciones (auth, no admin)
- `GET /prediccion` — mis predicciones.
- `GET /prediccion/partido/:partidoId` — mi predicción para un partido (404 si no existe).
- `POST /prediccion` — `{ partidoId, equipo1, equipo2 }` (crea o actualiza).
- `DELETE /prediccion/:id`.

## Modelo de datos

### Usuario
`{ id, nombre, correo, password (bcrypt), rol: 'admin' | 'usuario', createdAt }`

### Partido
`{ id, etapa: 'Grupos'|'16vos'|'8vos'|'4tos'|'Semis'|'Final', equipo1, equipo2, fecha, probabilidades: { victoria, empate, derrota }, marcadorReal: { equipo1, equipo2 } | null }`

`probabilidades.victoria` = victoria del **equipo1**; `derrota` = victoria del **equipo2**.

### Predicción
`{ id, usuarioId, partidoId, marcadorPredicho: { equipo1, equipo2 }, createdAt, updatedAt? }`

El campo `acerto` se calcula en el service (`prediccion.js` → `enriquecer`) comparando `marcadorPredicho` contra `partido.marcadorReal`. No se almacena.

## Usuarios semilla
| Correo                    | Password   | Rol     |
|---------------------------|------------|---------|
| admin@admin.com           | admin123   | admin   |
| jromaina@ulima.edu.pe     | 1234       | usuario |
| eduardo@live.com          | 1234       | usuario |

Para agregar más: hashear con `node -e "import('bcryptjs').then(b => b.default.hash('TU_PASS', 10).then(console.log))"` y pegar en `src/models/usuario.js`.

## Datos persisten en memoria
**No hay base de datos.** Cada reinicio del server resetea todo a los seeds. No hay archivo de estado; el modelo es source-of-truth en el arranque.
