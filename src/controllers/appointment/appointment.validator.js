const Joi = require('joi');

export const getMeta = {
  body: {
  },
};

export const getAllAppointments = {
  body: {
  },
};

export const getAppointmentsByEnrollment = {
  body: {
    // epi: Joi.string().required(),
    // nic: Joi.string().required(),
    // foolhuma: Joi.string().required(),
  },
};

export const addAppointmentForEnrollment = {
  body: {
    // epi: Joi.string().required(),
    // nic: Joi.string().required(),
    // foolhuma: Joi.string().required(),
    // vaccine: Joi.string().required(),
    // center: Joi.string().required(),
    // date: Joi.date().required(),
  },
};

export const validateAppointmentForEnrollment = {
  body: {
    // epi: Joi.string().required(),
    // nic: Joi.string().required(),
    // foolhuma: Joi.string().required(),
    // date: Joi.date().required(),
    // otp: Joi.string().required(),
  },
};

export const cancelAppointmentForEnrollment = {
  body: {
    epi: Joi.string().required(),
    nic: Joi.string().required(),
    foolhuma: Joi.string().required(),
    vaccine: Joi.string().required(),
    center: Joi.string().required(),
    date: Joi.date().required(),
  },
};