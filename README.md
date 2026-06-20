# Taller: Backend Mundial API 🏆

Guía paso a paso para construir una **API REST en Node.js + Express** con datos en
memoria, autenticación con **JWT** y passwords con **bcrypt**.

En este taller vas a completar una aplicación de **predicciones del Mundial**: los
usuarios predicen marcadores de partidos y el sistema calcula sus aciertos cuando el
administrador registra el resultado real.

> El repo ya trae lo más mecánico resuelto (modelos semilla y parte de los
> repositorios). Tu trabajo es construir las capas de **middleware, servicios y
> controladores**, completar los repositorios y **cablear todo**.
>
> ¿Atascado? La solución completa vive en la rama [`feat/complete`](#-cómo-comparar-con-la-solución).

---

## 📑 Contenido

1. [Qué vas a construir](#-qué-vas-a-construir)
2. [Requisitos y arranque](#-requisitos-y-arranque)
3. [Arquitectura por capas](#-arquitectura-por-capas)
4. [Estado inicial vs. meta](#-estado-inicial-vs-meta)
5. [Construcción paso a paso](#-construcción-paso-a-paso)
6. [Probar la API](#-probar-la-api)
7. [Referencia de endpoints](#-referencia-de-endpoints)
8. [Reto extra](#-retos-extra-opcional)

---

## 🎯 Qué vas a construir

Una API con tres dominios:

| Dominio       | Qué hace                                                              |
|---------------|---------------------------------------------------------------------|
| **Usuarios**  | Registro, login (devuelve JWT) y ranking de aciertos (solo admin).   |
| **Partidos**  | Listar partidos y registrar el marcador real (solo admin).          |
| **Predicciones** | Cada usuario predice marcadores; el admin **no** predice.        |

**Regla de negocio clave:** una predicción *acierta* si el marcador predicho coincide
exactamente con el `marcadorReal` del partido. El campo `acerto` **no se guarda**: se
calcula al vuelo comparando ambos marcadores.

---

## 🚀 Requisitos y arranque

- Node.js 18+ (usamos ESM con `"type": "module"`).
- Un cliente HTTP: [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/) o `curl`.

```bash
npm install
npm run dev    # nodemon, recarga al guardar
npm start      # node index.js
```

La API corre en **http://localhost:3005**.

Verifica que arrancó:

```bash
curl http://localhost:3005/
# { "mensaje": "API Mundial - en memoria", "code": 200 }
```

> ⚠️ **Datos en memoria:** no hay base de datos. Cada reinicio resetea todo a los
> seeds de `src/models/`. Eso es intencional para el taller.

---

## 🏗️ Arquitectura por capas

Pensamos la app en capas con una sola responsabilidad cada una. Una petición fluye así:

```
            request
               │
   ┌───────────▼───────────┐
   │   routes/             │  Define URL + método. Engancha middleware.
   ├───────────────────────┤
   │   middleware/auth.js  │  ¿Token válido? ¿Es admin? Pone req.usuario.
   ├───────────────────────┤
   │   controllers/        │  Lee req, llama al service, elige status code.
   ├───────────────────────┤
   │   services/           │  Lógica de negocio. Valida, calcula, decide.
   ├───────────────────────┤
   │   repositories/       │  Acceso a datos: findAll, findOne, create...
   ├───────────────────────┤
   │   models/             │  Arrays semilla (los datos iniciales).
   └───────────────────────┘
```

**¿Por qué tantas capas?** Para que cada pieza sea simple y testeable. El controller
no sabe *cómo* se guardan los datos; el service no sabe *qué* es una request HTTP; el
repository no sabe *reglas de negocio*. Si mañana cambias el array por una base de
datos, solo tocas los repositorios.

### Convenciones del proyecto

- Cada repositorio expone `findAll`, `findOne`, `findBy*`, `create`, `update`, `remove`
  (según necesite). Comparar ids siempre con `parseInt`.
- El modelo se carga como `let data = [...modelRaw]` para no mutar el array semilla.
- Los services devuelven `{ success, message, ...payload }`. El controller traduce ese
  `success` a un código HTTP.
- Nunca expongas el `password`: usa una función `sanitize()` antes de responder.
- IDs autoincrementales con un contador local al repositorio.

---

## 🧭 Estado inicial vs. meta

Esto es lo que **ya está hecho** y lo que **te toca a ti**:

```
src/
├── models/              ✅ LISTO  (partido, usuario, prediccion — datos semilla)
├── repositories/        🟡 A MEDIAS
│   ├── partido.js          → falta setMarcadorReal
│   ├── usuario.js          → falta findByCorreo
│   └── prediccion.js       → faltan findByUsuario, findByUsuarioAndPartido...
├── middleware/          ❌ NO EXISTE  → lo creas tú (auth.js)
├── services/            ❌ NO EXISTE  → lo creas tú (3 archivos)
├── controllers/         ❌ NO EXISTE  → lo creas tú (3 archivos)
└── routes/              🟡 ESQUELETO (routers vacíos, hay que llenarlos)

index.js                 🟡 arranca Express pero NO monta los routers
```

---

## 🛠️ Construcción paso a paso

Te recomiendo seguir el orden **de adentro hacia afuera**: primero datos, luego
lógica, luego HTTP. Así puedes ir probando.

### Paso 1 — Middleware de autenticación

Crea `src/middleware/auth.js`. Necesitas:

- `JWT_SECRET` (exportado, lo reusará el service de usuario para firmar tokens).
- `authMiddleware`: lee `Authorization: Bearer <token>`, lo verifica y guarda los
  datos del usuario en `req.usuario`.
- `adminMiddleware`: deja pasar solo si `req.usuario.rol === 'admin'`.

```js
import jwt from 'jsonwebtoken';

export const JWT_SECRET = 'zMxNgV1cjUcjKnSCOZykseZaoYvUVPBtYqBOTZmJW2P';

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No se envió token.' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;   // { id, nombre, correo, rol }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (req.usuario?.rol !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acceso restringido a administradores.' });
    }
    next();
};

export default authMiddleware;
```

> 💡 **Patrón middleware:** una función `(req, res, next)`. Si todo va bien llama a
> `next()`; si no, responde con un error y *no* llama a `next()`.

---

### Paso 2 — Completar los repositorios

Los repositorios buscan/guardan en el array `data`. Ya tienen lo básico; agrega los
*finders* que tus services van a necesitar.

**`src/repositories/usuario.js`** — agrega buscar por correo (para login/registro):

```js
const findByCorreo = (correo) =>
    data.find(u => u.correo?.toLowerCase() === correo?.toLowerCase());

// recuerda incluirlo en el export:
const repository = { findAll, findOne, findByCorreo, create };
```

**`src/repositories/prediccion.js`** — agrega filtros por usuario y partido:

```js
const findByUsuario = (usuarioId) =>
    data.filter(p => p.usuarioId === parseInt(usuarioId));

const findByUsuarioAndPartido = (usuarioId, partidoId) =>
    data.find(p => p.usuarioId === parseInt(usuarioId) && p.partidoId === parseInt(partidoId));

const findByPartido = (partidoId) =>
    data.filter(p => p.partidoId === parseInt(partidoId));
```

**`src/repositories/partido.js`** — agrega registrar el marcador real:

```js
const setMarcadorReal = (id, marcadorReal) => {
    const partido = findOne(id);
    if (!partido) return null;
    partido.marcadorReal = marcadorReal;
    return partido;
};
```

> No olvides añadir cada función nueva al objeto `repository` que se exporta.

---

### Paso 3 — Servicios (lógica de negocio)

Aquí vive lo interesante. Crea `src/services/`.

#### `services/usuario.js`

Responsable de registro, login y el ranking de aciertos. Tres ideas:

1. **Firmar token** con `jwt.sign`.
2. **Hashear/comparar passwords** con `bcrypt`.
3. **`sanitize`** para nunca devolver el `password`.

```js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import repository from '../repositories/usuario.js';
import { JWT_SECRET } from '../middleware/auth.js';

const generarToken = (id, nombre, correo, rol) =>
    jwt.sign({ id, nombre, correo, rol }, JWT_SECRET, { expiresIn: '7d' });

const sanitize = ({ password, ...rest }) => rest;

const registrar = async ({ nombre, correo, password }) => {
    if (!nombre || !correo || !password) {
        return { success: false, message: 'Proporcione nombre, correo y password.' };
    }
    if (repository.findByCorreo(correo)) {
        return { success: false, message: 'Ya existe un usuario con ese correo.' };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevo = repository.create({
        nombre, correo, password: hashedPassword, rol: 'usuario', createdAt: new Date()
    });
    const token = generarToken(nuevo.id, nuevo.nombre, nuevo.correo, nuevo.rol);
    return { success: true, message: 'Usuario creado', token, usuario: sanitize(nuevo) };
};

const login = async ({ correo, password }) => {
    const usr = repository.findByCorreo(correo);
    // Mismo mensaje si el correo no existe o el password está mal (no filtres info).
    if (!usr || !(await bcrypt.compare(password, usr.password))) {
        return { success: false, message: 'Correo o password incorrectos.' };
    }
    const token = generarToken(usr.id, usr.nombre, usr.correo, usr.rol);
    return { success: true, message: 'Inicio de sesión exitoso', token, usuario: sanitize(usr) };
};

// + listarUsuariosConAciertos(): por cada usuario cuenta predicciones,
//   resueltas y aciertos comparando marcadorPredicho vs marcadorReal.
// (Revisa la rama feat/complete si te trabas con el conteo.)

const usuarioService = { registrar, login, /* listarUsuariosConAciertos */ };
export default usuarioService;
```

#### `services/partido.js`

Lista, obtiene y registra el marcador real. Valida que vengan ambos marcadores:

```js
import partidoRepo from '../repositories/partido.js';

const listar = () => partidoRepo.findAll();
const obtener = (id) => partidoRepo.findOne(id);

const registrarMarcadorReal = (id, marcadorReal) => {
    if (marcadorReal?.equipo1 === undefined || marcadorReal?.equipo2 === undefined) {
        return { success: false, message: 'Debes enviar el marcador (equipo1, equipo2).' };
    }
    const partido = partidoRepo.setMarcadorReal(id, {
        equipo1: parseInt(marcadorReal.equipo1),
        equipo2: parseInt(marcadorReal.equipo2)
    });
    if (!partido) return { success: false, message: 'Partido no encontrado.' };
    return { success: true, message: 'Marcador registrado.', partido };
};

const partidoService = { listar, obtener, registrarMarcadorReal };
export default partidoService;
```

#### `services/prediccion.js`

El corazón del taller. Dos retos:

- **`enriquecer`**: a cada predicción le agrega su `partido` y el campo calculado
  `acerto` (¿el marcador predicho == marcador real?).
- **`crearOActualizar`**: si el usuario ya predijo ese partido, **actualiza**; si no,
  **crea**.

```js
import prediccionRepo from '../repositories/prediccion.js';
import partidoRepo from '../repositories/partido.js';

const calcularAcierto = (pred, real) => {
    if (!real) return null;   // partido aún sin resultado
    return parseInt(pred.equipo1) === parseInt(real.equipo1)
        && parseInt(pred.equipo2) === parseInt(real.equipo2);
};

const enriquecer = (prediccion) => {
    const partido = partidoRepo.findOne(prediccion.partidoId);
    return { ...prediccion, partido, acerto: calcularAcierto(prediccion.marcadorPredicho, partido?.marcadorReal) };
};

const crearOActualizar = (usuarioId, partidoId, marcadorPredicho) => {
    if (marcadorPredicho?.equipo1 === undefined || marcadorPredicho?.equipo2 === undefined) {
        return { success: false, message: 'Debes enviar el marcador (equipo1, equipo2).' };
    }
    if (!partidoRepo.findOne(partidoId)) {
        return { success: false, message: 'Partido no encontrado.' };
    }
    const marcador = { equipo1: parseInt(marcadorPredicho.equipo1), equipo2: parseInt(marcadorPredicho.equipo2) };

    let prediccion = prediccionRepo.findByUsuarioAndPartido(usuarioId, partidoId);
    if (prediccion) {
        prediccion = prediccionRepo.update({ id: prediccion.id, marcadorPredicho: marcador, updatedAt: new Date() });
    } else {
        prediccion = prediccionRepo.create({
            usuarioId: parseInt(usuarioId), partidoId: parseInt(partidoId),
            marcadorPredicho: marcador, createdAt: new Date()
        });
    }
    return { success: true, message: 'Predicción guardada.', prediccion: enriquecer(prediccion) };
};

// + listarPorUsuario(usuarioId), obtenerDeUsuarioParaPartido(usuarioId, partidoId),
//   eliminar(usuarioId, prediccionId)  ← ojo: solo el dueño puede borrar.

const prediccionService = { crearOActualizar, /* ...el resto */ };
export default prediccionService;
```

> 💡 **Tip de seguridad:** en `eliminar`, verifica que la predicción pertenezca al
> `usuarioId` que la pide. Nadie debe borrar la predicción de otro.

---

### Paso 4 — Controladores (traducir a HTTP)

Los controllers son finos: leen `req`, llaman al service y eligen el status code según
`success`. Crea `src/controllers/`.

```js
// controllers/usuario.js
import usuarioService from '../services/usuario.js';

const registrar = async (req, res) => {
    try {
        const response = await usuarioService.registrar(req.body);
        return res.status(response.success ? 201 : 400).json(response);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error inesperado', error: error.message });
    }
};

const login = async (req, res) => {
    const result = await usuarioService.login(req.body);
    return res.status(result.success ? 200 : 401).json(result);
};

const listarUsuarios = (req, res) =>
    res.status(200).json(usuarioService.listarUsuariosConAciertos());

export default { registrar, login, listarUsuarios };
```

El patrón se repite para `partido` y `prediccion`. Por ejemplo, en predicciones el
controller saca el id del usuario del **token** (no del body):

```js
// controllers/prediccion.js  (fragmento)
const guardar = (req, res) => {
    const { partidoId, equipo1, equipo2 } = req.body;
    const result = prediccionService.crearOActualizar(req.usuario.id, partidoId, { equipo1, equipo2 });
    return res.status(result.success ? 200 : 400).json(result);
};
```

> 🔑 Nota cómo `req.usuario.id` viene del `authMiddleware`. El cliente **nunca**
> manda su propio id: lo deducimos del token. Eso evita que predigas por otro.

---

### Paso 5 — Definir las rutas

Llena los routers en `src/routes/`. Aquí enganchas los middleware.

```js
// routes/partido.js
import express from 'express';
import controller from '../controllers/partido.js';
import authMiddleware, { adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', controller.findAll);                                         // público
router.get('/:id', controller.findOne);                                      // público
router.put('/:id/marcador', authMiddleware, adminMiddleware, controller.setMarcadorReal); // admin

export default router;
```

Para predicciones, **todo** requiere login, y además el admin no puede predecir:

```js
// routes/prediccion.js
import express from 'express';
import controller from '../controllers/prediccion.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);   // aplica a todas las rutas de abajo

const bloquearAdmin = (req, res, next) => {
    if (req.usuario?.rol === 'admin') {
        return res.status(403).json({ success: false, message: 'El administrador no realiza predicciones.' });
    }
    next();
};

router.get('/', controller.listarMias);
router.get('/partido/:partidoId', controller.obtenerParaPartido);
router.post('/', bloquearAdmin, controller.guardar);
router.delete('/:id', bloquearAdmin, controller.eliminar);

export default router;
```

> 💡 `router.use(authMiddleware)` aplica el middleware a **todas** las rutas siguientes,
> así no lo repites en cada línea. Los middleware se ejecutan en orden de izquierda a
> derecha: `authMiddleware` → `bloquearAdmin` → controller.

---

### Paso 6 — Montar los routers en `index.js`

El último cable. Importa los routers y móntalos bajo su prefijo:

```js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import usuarioRouter from './src/routes/usuario.js';
import partidoRouter from './src/routes/partido.js';
import prediccionRouter from './src/routes/prediccion.js';

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => res.json({ mensaje: 'API Mundial - en memoria', code: 200 }));

app.use('/auth', usuarioRouter);
app.use('/partido', partidoRouter);
app.use('/prediccion', prediccionRouter);

const PORT = 3005;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
```

¡Listo! Reinicia (`npm run dev`) y prueba.

---

## 🧪 Probar la API

Usuarios semilla para tus pruebas:

| Correo                  | Password  | Rol     |
|-------------------------|-----------|---------|
| `admin@admin.com`       | `admin123`| admin   |
| `jromaina@ulima.edu.pe` | `1234`    | usuario |
| `eduardo@live.com`      | `1234`    | usuario |

**1. Login y guardar el token:**

```bash
curl -X POST http://localhost:3005/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"jromaina@ulima.edu.pe","password":"1234"}'
# → { "token": "eyJ...", "usuario": { ... } }
```

**2. Crear una predicción (usuario):**

```bash
TOKEN="pega-aquí-tu-token"
curl -X POST http://localhost:3005/prediccion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"partidoId":1,"equipo1":2,"equipo2":1}'
```

**3. Registrar el marcador real (admin) y ver el acierto:**

```bash
# Login como admin → usa ESE token aquí
curl -X PUT http://localhost:3005/partido/1/marcador \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{"equipo1":2,"equipo2":1}'

# Vuelve a listar tus predicciones como usuario → "acerto": true
curl http://localhost:3005/prediccion -H "Authorization: Bearer $TOKEN"
```

✅ Si `acerto` cambia de `null` a `true`/`false` según el resultado, ¡tu lógica funciona!

---

## 📚 Referencia de endpoints

### Auth (`/auth`)
| Método | Ruta         | Acceso | Body                          |
|--------|--------------|--------|-------------------------------|
| POST   | `/registrar` | público| `{ nombre, correo, password }`|
| POST   | `/login`     | público| `{ correo, password }`        |
| GET    | `/usuarios`  | admin  | —  (lista con aciertos)       |

### Partidos (`/partido`)
| Método | Ruta            | Acceso | Body                  |
|--------|-----------------|--------|-----------------------|
| GET    | `/`             | público| —                     |
| GET    | `/:id`          | público| —                     |
| PUT    | `/:id/marcador` | admin  | `{ equipo1, equipo2 }`|

### Predicciones (`/prediccion`) — requieren login, el admin no predice
| Método | Ruta                  | Body                              |
|--------|-----------------------|-----------------------------------|
| GET    | `/`                   | — (mis predicciones)              |
| GET    | `/partido/:partidoId` | — (mi predicción de un partido)   |
| POST   | `/`                   | `{ partidoId, equipo1, equipo2 }` |
| DELETE | `/:id`                | —                                 |

### Modelo de datos

```js
// Usuario
{ id, nombre, correo, password (bcrypt), rol: 'admin'|'usuario', createdAt }

// Partido
{ id, etapa: 'Grupos'|'16vos'|'8vos'|'4tos'|'Semis'|'Final',
  equipo1, equipo2, fecha,
  probabilidades: { victoria, empate, derrota },   // victoria = gana equipo1
  marcadorReal: { equipo1, equipo2 } | null }

// Predicción
{ id, usuarioId, partidoId, marcadorPredicho: { equipo1, equipo2 }, createdAt, updatedAt? }
// 'acerto' NO se guarda: se calcula en el service.
```

> Para agregar más usuarios semilla, hashea el password y pégalo en `src/models/usuario.js`:
> ```bash
> node -e "import('bcryptjs').then(b => b.default.hash('TU_PASS', 10).then(console.log))"
> ```

---

## 🧩 Retos extra (opcional)

Si terminas antes, intenta:

- **Validar el rango de marcadores** (que no sean negativos).
- **Bloquear predicciones** de partidos que ya tienen `marcadorReal` (ya empezaron).
- **Endpoint de ranking** que ordene usuarios por aciertos.
- **Tests** con cualquier runner que conozcas para el cálculo de `acerto`.

---

## 🔍 Cómo comparar con la solución

La implementación completa está en la rama `feat/complete`:

```bash
git diff main feat/complete -- src/services/prediccion.js   # ver un archivo
git switch feat/complete                                     # cambiar a la solución
git switch main                                              # volver a tu trabajo
```

Úsala como referencia cuando te atasques, pero intenta resolverlo tú primero 😉.
