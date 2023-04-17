import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyectos.js";

//FUNCION AGREGARTAREA ******************************************
const agregarTarea = async (req, res) => {
    const { proyecto } = req.body;

    const existeProyecto = await Proyecto.findById( proyecto );

    if(!existeProyecto){
        const error = new Error("El proyecto no se encontro");
        return res.status(404).json( {msg: error.message} )
    };

    if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("No tienes permisos para añadir tareas");
        return res.status(403).json( {msg: error.message} )
    };

    try {
        const tareaAlmacenada = await Tarea.create(req.body)

        //Almacenar el ID de tareas en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save();

        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    };

};

//FUNCION OBTENERTAREA ******************************************
const obtenerTarea = async (req, res) => {
    const {id} = req.params;
    //populate cruza info 
    const tarea = await Tarea.findById(id).populate("proyecto");
    
    if(!tarea){
        const error = new Error("Tarea no se encontro");
        return res.status(404).json( {msg: error.message} )
    };    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return res.status(403).json( {msg: error.message} )
    }

    res.json(tarea)
};


//FUNCION ACTUALIZARTAREA ***************************************
const actualizarTarea = async (req, res) => {
    const {id} = req.params;
    const tarea = await Tarea.findById(id).populate("proyecto");
    
    if(!tarea){
        const error = new Error("Tarea no se encontro");
        return res.status(404).json( {msg: error.message} )
    };    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return res.status(403).json( {msg: error.message} )
    }

    //Actualizacion de variables
    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
    
    try {
        const tareaAlmacenada = await tarea.save();
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }

};


//FUNCION ELIMINARTAREA *****************************************
const eliminarTarea = async (req, res) =>{
    const {id} = req.params;
    const tarea = await Tarea.findById(id).populate("proyecto");
    
    if(!tarea){
        const error = new Error("Tarea no se encontro");
        return res.status(404).json( {msg: error.message} )
    };    
    
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return res.status(403).json( {msg: error.message} )
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)

        //Lanza 2 instrucciones a la vez y no se bloquean entre si
        await Promise.allSettled([
            await proyecto.save(), //Elimina tareas de proyecto.tareas
            await tarea.deleteOne() //Elimina tarea de DB tarea
        ])

        res.json( {msg: "La tarea se ha eliminado correctamente"})
        
    } catch (error) {
        console.log(error)
    }
};

const cambiarEstado = async (req, res) =>{
    const {id} = req.params;
    const tarea = await Tarea.findById(id).populate("proyecto");
    
    if(!tarea){
        const error = new Error("Tarea no encontrada");
        return res.status(404).json( {msg: error.message} )
    };    


    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() 
        && !tarea.proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error("Acción no válida");
        return res.status(403).json( {msg: error.message} )
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id
    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado');
    res.json(tareaAlmacenada)
};

export{
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}
