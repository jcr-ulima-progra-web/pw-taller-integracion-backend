import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import usuarioRouter from './src/routes/usuario.js';
import partidoRouter from './src/routes/partido.js';
import prediccionRouter from './src/routes/prediccion.js';

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    return res.json({ mensaje: 'API Mundial - en memoria', code: 200 });
});

app.use('/auth', usuarioRouter);
app.use('/partido', partidoRouter);
app.use('/prediccion', prediccionRouter);

export default app;
