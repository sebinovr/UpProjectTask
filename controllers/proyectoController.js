import Proyecto from "../models/Proyectos.js"
import Tarea from "../models/Tarea.js"
import Usuario from "../models/Usuario.js"

//FUNCION OBTENERPROYECTOS ***************************************
const obtenerProyectos = async (req,res) => {
    //busca proyectos solo con relativos en req.usuarios
    const proyectos = await Proyecto.find({
        '$or': [
            { colaboradores: { $in: req.usuario }},
            { creador: { $in: req.usuario }}
        ],
    })
        .select('-tareas') //Se extrae tareas 

    res.json(proyectos)
}

//FUNCION NUEVOPROYECTO ******************************************
const nuevoProyecto = async (req,res) => {
    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }
}


//FUNCION OBTENERPROYECTO ******************************************
const obtenerProyecto = async (req,res) => {
    //Se obtiene mediante id de proyecto
    const { id } = req.params;
    // const proyecto = await Proyecto.findById( id );
    const proyecto = await Proyecto.findById(id)
        .populate({path: 'tareas', populate: {path: 'completado', select: 'nombre'}})
        .populate('colaboradores', 'nombre email'); //modificando la respuesta de la API


    //En caso de que proyecto no exista
    if (!proyecto) {
        const error = new Error("No encontrado")
        return res.status(404).json( {msg: error.message} )
    }

    //Para verificar si creador es el que esta intentando entrar al proyecto
    if (proyecto.creador.toString() !== req.usuario._id.toString() 
        && !proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error("Acción no válida")
        return res.status(404).json( {msg: error.message} )
    }

    //Obtener Todas las Tareas del Proyecto
    // const tareas = await Tarea.find().where("proyecto").equals(proyecto._id)
    // res.json({
    //     proyecto,
    //     tareas
    // });

    res.json(proyecto)

}

//FUNCION EDITARPROYECTO ******************************************
const editarProyecto = async (req,res) => {
    //Se obtiene mediante id de proyecto
    const { id } = req.params;
    const proyecto = await Proyecto.findById( id );

    //En caso de que proyecto no exista
    if (!proyecto) {
        const error = new Error("No encontrado")
        return res.status(404).json( {msg: error.message} )
    }

    //Para verificar si creador es el que esta intentando entrar al proyecto
    if (proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(401).json( {msg: error.message} )
    }

    //Actualiza los campos
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    //Guarda actualizaciones anteriores
    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

//FUNCION ELIMINARPROYECTO ******************************************
const eliminarProyecto = async (req,res) => {
    //Se obtiene mediante id de proyecto
    const { id } = req.params;
    const proyecto = await Proyecto.findById( id );

    //En caso de que proyecto no exista
    if (!proyecto) {
        const error = new Error("No encontrado")
        return res.status(404).json( {msg: error.message} )
    }

    //Para verificar si creador es el que esta intentando entrar al proyecto
    if (proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(401).json( {msg: error.message} )
    }

    try {
        await proyecto.deleteOne();
        res.json({msg: "Proyecto eliminado"})
    } catch (error) {
        console.log(error)
    }

}

//FUNCION BUSCARCOLABORADOR *************************************
const buscarColaborador = async (req, res) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email }).select(
      "-confirmado -createdAt -password -token -updatedAt -__v "
    );
  
    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ msg: error.message });
    }
  
    res.json(usuario);
  }

//FUNCION AGREGARCOLABORADOR *************************************
const agregarColaborador = async (req,res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(404).json( {msg: error.message} )
    }

    const { email } = req.body;
    const usuario = await Usuario.findOne({ email }).select(
      "-confirmado -createdAt -password -token -updatedAt -__v "
    );
  
    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ msg: error.message });
    }

    //El colaborador no puede ser el admin del proyecto
    if(proyecto.creador.toString()===usuario._id.toString() ){
        const error = new Error("El creador del proyecto no puede ser colaborador");
        return res.status(404).json({ msg: error.message });    
    }

    //Revisar que no este ya agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error("El usuario ya pertenece al proyecto");
        return res.status(404).json({ msg: error.message });    
    }

    //Si todo esta bien...
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json( {msg: "Colaborador agregado correctamente"} );
}

//FUNCION ELIMINARCOLABORADOR ************************************
const eliminarColaborador = async (req,res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(404).json( {msg: error.message} )
    }

    //Si todo esta bien...
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    res.json( {msg:"Colaborador eliminado correctamente"} );

}


export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
}