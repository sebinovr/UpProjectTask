import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {

    const {email, nombre, token} = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
    });


    //Informacion Email
    const info = await transport.sendMail({
        from: '"UpTask - Administra tus proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Comprueba tu cuenta',
        text: "Comprueba tu cuenta en UpTask", 
        html: `<p> Hola: ${nombre}. Favor comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `,
    });
}

export const emailOlvidePassword = async (datos) => {

    const {email, nombre, token} = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
    });

    //Informacion Email
    const info = await transport.sendMail({
        from: '"UpTask - Administra tus proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Restablece tu Password',
        text: "Restablece tu Password en UpTask", 
        html: `<p> Hola: ${nombre}. Has solicitado reestablecer password</p>
        <p>Para reestablecer el password, favor abrir el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
        <p>Si tu no solicitaste el cambio de password, puedes ignorar el mensaje</p>
        `,
    });
}