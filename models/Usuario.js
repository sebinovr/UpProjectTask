import mongoose from "mongoose";
import bcrypt from "bcrypt"; //npm i bcrypt

const usuarioSchema = mongoose.Schema({
    nombre: { 
        type: String, 
        required: true, 
        trim: true 
    },

    password: {
        type: String, 
        required: true, 
        trim: true 
    },

    email: {
        type: String, 
        required: true, 
        trim: true,
        unique: true,
    },

    token: {
        type: String, 
    },

    confirmado: {
        type: Boolean,
        default: false,
    }
}, 
    {
    timestamps: true //crea columnas createdAt - updatedAt
    }
);


//Funcion para hashear antes de guardar usuario
usuarioSchema.pre('save', async function( next ){
    //Verifica si cadena ya esta hasheada
    if(!this.isModified('password')){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    //Se entrega cadena sin hash y salt para hashear password
    this.password = await bcrypt.hash(this.password, salt);
});

//Funcion que nos permite comparar password hasheado con el entregado en formulario
usuarioSchema.methods.comprobarPassword = async function ( passwordFormulario ) {
    return await bcrypt.compare(passwordFormulario, this.password)
}



//Define el Schema de estructuracion de Datos
const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;