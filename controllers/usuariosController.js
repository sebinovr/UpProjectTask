import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

//FUNCION REGISTRAR*********************************************
const registrar = async (req, res) => {
    //Evitar registros duplicados
    const { email } = req.body; //DesTructuring
    const existeUsuario = await Usuario.findOne({email});

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado ');
        return res.status(400).json({ msg: error.message });
    }

    try {
        //Obtiene objeto desde data entregada por usuario
        const usuario = new Usuario(req.body);
        //Genera token aleatorio para ser insertado en BD
        usuario.token = generarId();
        //Registra en BD 
        // const usuarioAlmacenado = await usuario.save() ////Uso en produccion de Backend
        await usuario.save();

        //Enviar email de confirmacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        })


        //Muestra mensaje
        // res.json(usuarioAlmacenado) //Uso en produccion de Backend
        res.json( { msg: 'Usuario creado correctamente. Revisa tu email y confirma tu cuenta.'});

    } catch (error) {
        console.log(error);
    }
};

//FUNCION AUNTENTICAR*******************************************
const autenticar = async ( req, res ) => {
    const {email, password} = req.body; //DesTructuring

    //Comprobar si usuario existe
    const usuario = await Usuario.findOne( {email} );
    if(!usuario){
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message })
    }

    //Comprobar si esta autenticado
    if(!usuario.confirmado){
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({ msg: error.message })
    }

    //Comprobar password
    if( await usuario.comprobarPassword(password) ){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),
        })
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(403).json({ msg: error.message })
    }
};

//FUNCION CONFIRMAR*********************************************
const confirmar = async (req, res) => {
    const { token } = req.params;

    const usuarioConfirmar = await Usuario.findOne( {token} );
    if(!usuarioConfirmar){
        const error = new Error("Token no válido");
        return res.status(403).json({ msg: error.message })
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = '';
        await usuarioConfirmar.save();
        res.json({ msg: 'Usuario confirmado correctamente' });
    } catch (error) {
        console.log(error);
    }
}

//FUNCION OLVIDEPASSWORD****************************************
const olvidePassword = async (req,res) =>{
    const { email } = req.body;
    //Si usuario existe ...
    const usuario = await Usuario.findOne( {email} );
    if(!usuario){
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    }

    try {
        usuario.token = generarId();
        await usuario.save();

        //Enviar email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token, //Se genera nuevo token
        })


        res.json({ msg: 'Se ha enviado un email con instrucciones para restablecer contraseña' });
    } catch (error) {
        console.log(error);
    }
}

//FUNCION COMPROBARTOKEN****************************************
const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = await Usuario.findOne( {token} );

    if(tokenValido){
        res.json( {msg: 'Token válido'} );
    } else {
        const error = new Error("Token No Válido");
        return res.status(404).json({ msg: error.message });
    }

}

//FUNCION NUEVOPASSWORD****************************************
const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne( {token} );

    if(usuario){
        usuario.password = password;
        usuario.token = '';
        try {
            await usuario.save();
            res.json({ msg: 'Password modificado correctamente' }); 
        } catch (error) {
            console.log(error);
        }
    } else {
        const error = new Error("Token No Válido");
        return res.status(404).json({ msg: error.message });
    }
};

//FUNCION PERFIL*************************************************
const perfil = async (req, res) => {
    const { usuario } = req;
    res.json(usuario)
};

export { 
    registrar, 
    autenticar, 
    confirmar, 
    olvidePassword, 
    comprobarToken,
    nuevoPassword,
    perfil
 }; 

