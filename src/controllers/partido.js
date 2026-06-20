import servicio from '../services/partido.js'

const findAll = (req, res) => {
    const partidos = servicio.listar();

    return res.status(200).json(partidos);
}

const findOne = (req,res) => {
    const id = req.params.id;
    const partido = servicio.obtener(id);

    if (partido)
        return res.status(200).json(partido);
    else 
        return res.status(500).json({ success: false, message: "No se encontraron datos."})

}

const controller = { findAll, findOne}

export default controller;