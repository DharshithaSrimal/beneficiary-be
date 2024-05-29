import express from 'express';
import validate from 'express-validation';

import * as userController from '../controllers/user/user.controller';
import * as userValidator from '../controllers/user/user.validator';
import * as patientController from '../controllers/patient/patient.controller';
import * as patientValidator from '../controllers/patient/patient.validator';

const router = express.Router();

//= ===============================
// Public routes
//= ===============================

router.post(
  '/login',
  validate(userValidator.login),
  userController.login,
);
router.post(
  '/register',
  validate(userValidator.register),
  userController.register,
);
router.get(
  '/getPatientProfile/:id',
  validate(patientValidator.getPatientProfile),
  patientController.getPatientProfile,
);

module.exports = router;
