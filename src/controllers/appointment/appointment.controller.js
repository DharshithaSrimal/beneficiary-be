import { successResponse, errorResponse } from '../../helpers';
import { getVaccinationsCenters, getVaccines } from '../../config/constants';
import { Appointment } from '../../models';

export const getMeta = async (req, res) => {
  try {
    const vaccines = await getVaccines();
    const vaccinationCenters = await getVaccinationsCenters();
    return successResponse(req, res, { vaccines, vaccinationCenters });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const getAllAppointments = () => {
  console.log("No Appoint e");
};

export const getAppointmentsByEnrollment = async (req, res) => {
  const { epi, nic, foolhuma } = req.query;
  try {
    const appointments = await Appointment.findAll({
      where: {
        epi,
        nic,
      }
    });
    return successResponse(req, res, { appointments });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const addAppointmentForEnrollment = async (req, res) => {
  try {
    const { epi, nic, foolhuma, date, vaccine, center } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const out = await Appointment.create({
      epi,
      nic,
      foolhuma,
      date,
      vaccine,
      center,
      status: 'Not Verified',
      otp: otp
    });
    return successResponse(req, res, { otp, out });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const validateAppointmentForEnrollment = async (req, res) => {
  const { id, otp } = req.body;
  const out = await Appointment.findOne({ where: { id } });
  if(out) {
    if(out.status === 'Not Verified' && out.otp.toString() === otp.toString()) {
      await Appointment.update({otp: null, status: 'Pending'},{ where: { id } })
      return successResponse(req, res, { message: 'Appointment verified' });
    } else {
      return errorResponse(req, res, { message: 'Invalid OTP' });
    }
  } else {
    return errorResponse(req, res, { message: 'Invalid appointment' });
  }
};

export const cancelAppointmentForEnrollment = () => {
  console.log("No Appoint e");
};