import { facebookLogin, googleLogin, login, logout, registerUser } from '../controllers/auth.controller.js';
import Router from '../router.js';

const router = new Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.post('/facebook', facebookLogin);
router.post('/google', googleLogin);

export default router;
