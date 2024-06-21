import { Enroll } from '../../models';
import { successResponse, errorResponse, uniqueId } from '../../helpers';
import { getEvents, getPatientDetails, getPatientDetailsByNid, getPatientDetailsByEip, getPatientDetailsByEpi, getTravellers, getVaccines, OPTIONALS, parsePatient, PREGNANCY, TRAVELLERS } from '../../config/constants';

export const enrollChild = async (req, res) => {
  try {
    const { userId } = req.user;
    const output = await getPatientDetailsByNid({ nic: req.body.beneficiary });
    if (output && output.length > 0) {
      var code = Math.floor(100000 + Math.random() * 900000);
      var attr = output;
      const incoming = parsePatient(output);
      const child = await Enroll.findOne({
        where: {
          userId,
          epi: incoming.epi
        }
      });
      if (!child || (child.otp !== null)) {
        if (incoming.mother_contact !== req.body.contact) {
          return errorResponse(req, res, { message: 'Beneficiary ID does not match with contact number. Please contact the health centre.', output });
        }
        var CryptoJS = require("crypto-js");
        var publicHash = CryptoJS.AES.encrypt(`${req.body.beneficiary}|${incoming.epi}`, process.env.DHIS_SECRET).toString();
        const baseTxt = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(publicHash)).toString().replace('/', '|');
        attr.push({ key: 'qr', value: baseTxt });

        await Enroll.create({
          userId,
          otp: code,
          epi: incoming.epi,
          nic: incoming.nic,
          foolhuma: incoming.foolhuma,
          name: incoming.name,
          sex: incoming.sex,
          dob: incoming.dob
        });
        // process.env.MSG_API(incoming.mother_contact)
        return successResponse(req, res, { otp: code, attr });
      }
      return errorResponse(req, res, { message: 'Already enrolled.' });
    }
    return errorResponse(req, res, { message: 'Beneficiary ID not found. Please contact the health centre.', output });
  } catch (error) {
    return errorResponse(req, res, { message: 'Unknown error occured. Please contact the health centre.', details: error.message });
  }
};

export const validateOtp = async (req, res) => {
  try {
    const { userId } = req.user;
    const otpOut = await Enroll.findOne({
      where: {
        userId,
        otp: req.body.otp
      }
    });
    if (otpOut) {
      await Enroll.update({ otp: null }, { where: { userId, otp: req.body.otp } });
      return successResponse(req, res, { success: true, message: 'Enroll Successful' });
    }
    return errorResponse(req, res, { success: false, message: 'Invalid OTP' });
  } catch (error) {
    return errorResponse(req, res, { success: false, message: 'Unknown Error', error: error.message });
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const { userId } = req.user;
    const children = await Enroll.findAll({
      where: {
        userId,
        otp: null
      }
    });
    return successResponse(req, res, { children });
  } catch (error) {
    console.log("Catcher", error);
    return errorResponse(req, res, error.message);
  }
};

export const getEnrollmentDetails = async (req, res) => {
  try {
    const { userId } = req.user;
    const child = await Enroll.findOne({
      where: {
        userId,
        epi: req.body.epi
      }
    });
    if (!child) {
      return errorResponse(req, res, { message: "Child not enrolled" });
    }
    const fetched = await getPatientDetailsByEpi({ epi: req.body.epi });

    return successResponse(req, res, { child: fetched });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const getEventLog = async (req, res) => {
  try {
    const { userId } = req.user;
    const child = await Enroll.findOne({
      where: {
        userId,
        epi: req.body.epi
      }
    });
    if (!child) {
      return errorResponse(req, res, { message: "Child not enrolled" });
    }

    const events = await getEvents(req.body.entity_id);
    const eventArr = [];
    if (events.events) {
      events.events.forEach((event) => {
        event.dataValues.forEach((elem) => {
          elem.date = event.eventDate;
          eventArr.push(elem);
        })
      });
    }
    const childhood = [
      {
        name: "BCG",
        id: process.env.BCG
      },
      {
        name: "Hepatitis B",
        id: process.env.HEPATITIS_B
      },
      {
        name: "OPV 1",
        id: process.env.OPV_1
      },
      {
        name: "OPV 2",
        id: process.env.OPV_2
      },
      {
        name: "OPV 3",
        id: process.env.OPV_3
      },
      {
        name: "Pentavelant 1",
        id: process.env.PENTAVELANT_1
      },
      {
        name: "Pentavelant 2",
        id: process.env.PENTAVELANT_2
      },
      {
        name: "Pentavelant 3",
        id: process.env.PENTAVELANT_3
      },
      {
        name: "IPV",
        id: process.env.IPV
      },
      {
        name: "MR",
        id: process.env.MR
      },
      {
        name: "MMR",
        id: process.env.MMR
      },
      {
        name: "DPT Booster",
        id: process.env.DPT_BOOSTER
      },
    ];
    const hpv = [
      {
        name: "Dose 1",
        id: process.env.HPV_D1
      },
      {
        name: "Dose 2",
        id: process.env.HPV_D2
      },
    ];
    const tdv = [
      {
        name: "Dose 1",
        id: process.env.TDV_D1
      },
      {
        name: "Dose 2",
        id: process.env.TDV_D1
      },
      {
        name: "Dose 3",
        id: process.env.TDV_D1
      },
      {
        name: "Dose 4",
        id: process.env.TDV_D1
      },
      {
        name: "Dose 5",
        id: process.env.TDV_D1
      },
      {
        name: "Dose 6",
        id: process.env.TDV_D1
      },
    ];
    const optionals = await getVaccines({ group_id: OPTIONALS });
    const pregnancy = await getVaccines({ group_id: PREGNANCY });
    const travellers = await getTravellers({ group_id: TRAVELLERS });
    return successResponse(req, res, { events: eventArr, childhood, hpv, tdv, optionals, pregnancy, travellers });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const removeEnrollment = async (req, res) => {
  const { epi } = req.body;
  const { userId } = req.user;
  try {
    await Enroll.destroy({
      where: {
        userId,
        epi
      }
    });
    return successResponse(req, res, { message: "Successfully removed" });
  } catch (error) {
    return errorResponse(req, res, { message: error.message });
  }
}