import express from 'express';

import  { 
    registrar, 
    autenticar, 
    confirmar, 
    olvidePassword, 
    comprobarToken,
    nuevoPassword,
    perfil
} from "../controllers/usuariosController.js";

import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

//Routing 
router.post('/', registrar);
router.post('/login', autenticar);
router.get('/confirmar/:token', confirmar);
router.post('/olvide-password', olvidePassword);
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);

//Routing con Middleware
router.get('/perfil', checkAuth, perfil);

export default router;