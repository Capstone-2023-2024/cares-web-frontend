import express from 'express';
import {signup, getBill} from '../controller/appController.js';

const router = express.Router();

/** HTTP Request */
router.post('/user/signup', signup);
router.post('/product/getBill', getBill);

module.exports = router;
