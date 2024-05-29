const Joi = require('joi');

export const enrollChild = {
  body: {
    beneficiary: Joi.string().required(),
  },
};

export const validateOtp = {
  body: {
    otp: Joi.string().required()
  }
};

export const getEnrollments = {
  body: {
  },
};

export const getEnrollmentDetails = {
  body: {
    epi: Joi.string().required(),
  },
};

export const getEventLog = {
  body: {
    epi: Joi.string().required(),
    entity_id: Joi.string().required(),
  },
};

export const removeEnrollment = {
  body: {
    epi: Joi.string().required()
  },
};