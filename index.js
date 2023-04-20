import express  from "express";
import dotenv from "dotenv";
import cors from 'cors'
import conectarDB from "./config/db.js"; //Se incluye .js
import usuarioRoutes from "./routes/usuariosRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js"

const app = express();
app.use(express.json()); //habilita la opcion de enviar en formato Json

//Extraer variable de entorno
dotenv.config()

//conectar BD
conectarDB();

//Configurar Cors - POSTERIOR A USO DE POSTMAN
const whitelist = [process.env.FRONTEND_URL]; //Habilita localhost desde FrontEnd
const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            //Puede consultar la API
            callback(null, true);
        } else {
            //NO puede consultar la API
            callback(new Error("Error de Cors - Desde Index.js"))
        }
    }
}

app.use(cors(corsOptions));

//Routing - EndPoints
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

//Conexion a Puerto
const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});


//SOCKET.IO
import { Server } from "socket.io";
const io = new Server(servidor, {
    pingTimeout: 60000,
    cors:{
        origin: process.env.FRONTEND_URL,
    }
})

io.on('connection', (socket) => {
    console.log('Conectado a socket.io');

    //Definir eventos de Socket.io
    socket.on('abrir proyecto', (proyecto)=> {
        //Permite entrada a diferente proyectos en simultaneo
        socket.join(proyecto)
    });

    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    });

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    });

    socket.on('actualizar tarea', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    });

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    });
})