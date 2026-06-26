import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import partidoRouter from './src/routes/partido.js'
import usuarioRouter from './src/routes/usuario.js'

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    return res.json({ mensaje: 'API Mundial - en memoria', code: 200 });
});

app.use('/partidos', partidoRouter);
app.use('/auth', usuarioRouter)

const PORT = 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
