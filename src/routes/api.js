import express from 'express';
import validate from 'express-validation';

import * as userController from '../controllers/user/user.controller';
import * as userValidator from '../controllers/user/user.validator';
import * as enrollController from '../controllers/enroll/enroll.controller';
import * as enrollValidator from '../controllers/enroll/enroll.validator';
import * as patientController from '../controllers/patient/patient.controller';
import * as patientValidator from '../controllers/patient/patient.validator';
import * as appointmentController from '../controllers/appointment/appointment.controller';
import * as appointmentValidator from '../controllers/appointment/appointment.validator';

const router = express.Router();

//= ===============================
// API routes
//= ===============================

// Electronic Immunization Registry (EIR) Endpoints

router.get('/me', userController.profile);
router.post(
  '/changePassword',
  validate(userValidator.changePassword),
  userController.changePassword,
);

router.post(
  '/enrollChild',
  validate(enrollValidator.enrollChild),
  enrollController.enrollChild,
);

router.post(
  '/validateEnroll',
  validate(enrollValidator.validateOtp),
  enrollController.validateOtp,
);

router.post(
  '/getEnrollments',
  validate(enrollValidator.getEnrollments),
  enrollController.getEnrollments,
);

router.post(
  '/getEnrollmentDetails',
  validate(enrollValidator.getEnrollmentDetails),
  enrollController.getEnrollmentDetails,
);

router.post(
  '/getEventLog',
  validate(enrollValidator.getEventLog),
  enrollController.getEventLog,
);

router.post(
  '/removeEnrollment',
  validate(enrollValidator.removeEnrollment),
  enrollController.removeEnrollment,
);

router.get(
  '/getAppointmentMeta',
  validate(appointmentValidator.getMeta),
  appointmentController.getMeta,
);

router.post(
  '/addAppointment',
  validate(appointmentValidator.addAppointmentForEnrollment),
  appointmentController.addAppointmentForEnrollment,
);

router.post(
  '/verifyAppointment',
  validate(appointmentValidator.validateAppointmentForEnrollment),
  appointmentController.validateAppointmentForEnrollment,
);

router.get(
  '/getAppointments',
  validate(appointmentValidator.getAppointmentsByEnrollment),
  appointmentController.getAppointmentsByEnrollment,
);

router.post(
  '/generatePublicQR',
  validate(patientValidator.generatePublicQR),
  patientController.generatePublicQR,
);

router.post(
  '/getGrowthMonitoring',
  validate(patientValidator.getGrowthMonitoring),
  patientController.getGrowthMonitoringData,
);

router.post(
  '/getDevelopmentMilestones',
  validate(patientValidator.getDevelopmentMilestones),
  patientController.getDevelopmentMilestonesData,
);

// Primary Health Care (PHC) Registry Endpoints

router.post(
  '/getPhcData',
  validate(patientValidator.getGrowthMonitoring),
  patientController.getPhcData,
);

// End of Primary Health Care (PHC) Registry Endpoints

module.exports = router;
