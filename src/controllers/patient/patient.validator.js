const Joi = require('joi');

export const getPatientByUserID = {

};

export const addPatient = {

};

export const getPatientByUserIDExternal = {

};

export const getPatientProfile = {

};

export const deletePatient = {
    body: {
        epi: Joi.string().required(),
        beneficiary: Joi.string().required(),
        foolhuma: Joi.string().required(),
    },
}

export const getPatientVaccines = {

};

export const generatePublicQR = {
    body: {
        epi: Joi.string().required(),
        entity_instance: Joi.string().required(),
    },
};