const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post('/setup-first-admin', validate(registerSchema), authController.register);
router.post('/register', verifyToken, validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/validate', verifyToken, authController.validateToken);

module.exports = router;