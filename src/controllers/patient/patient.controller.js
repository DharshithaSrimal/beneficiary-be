import { Patient } from '../../models';
import { Appointment } from '../../models';
import { successResponse, errorResponse, uniqueId } from '../../helpers';
import axios from 'axios';
import { getDataElements, getEvents, getPatientDetails, getPatientDetailsByEpi, getPatientDetailsByPhcId, getPatientVaccineList, getTravellers, getVaccines, OPTIONALS, parsePatient, PREGNANCY, TRAVELLERS } from '../../config/constants';

export const getPatientByUserID = async (userId) => {
  const patients = await Patient.findAll({
    where: {
      userId
    }
  });
  return patients;
};

export const getPatientByUserIDExternal = async (req, res) => {
  const { userId } = req.user;
  const patients = await Patient.findAll({
    where: {
      userId
    }
  });
  return successResponse(req, res, { patients });
};

export const addPatient = async (userId, data) => {
  const patient = parsePatient(JSON.parse(data));
  const epi = patient.epi;
  const beneficiary = patient.nic;
  try {
    const pCreate = await Patient.create({
      userId,
      epi,
      beneficiary,
      // foolhuma,
      data
    });
    return pCreate;
  } catch (e) {
    return null;
  }
}

export const getPatientProfile = async (req, res) => {
  try {
    var CryptoJS = require("crypto-js");
    const str = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(req.params.id));
    var bytes = CryptoJS.AES.decrypt(str, process.env.DHIS_SECRET);
    var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (decryptedData) {
      const params = decryptedData.split('|');
      const epi = params[0];
      const entity_id = params[1];

      const out = await getPatientDetailsByEpi({ epi });

      const events = await getEvents(entity_id);
      const eventArr = [];
      if (events.events) {
        events.events.forEach((event) => {
          event.dataValues.forEach((elem) => {
            elem.date = event.eventDate;
            eventArr.push(elem);
          })
        });
      }

      const getArr = (arr) => {
        const vaccs = [];
        arr.forEach((vac) => {
          const out = eventArr.filter((item) => item.dataElement === vac.id);
          if (out && out.length > 0) {
            vac.date = new Date(out[0].date).toLocaleDateString();
            vac.value = out[0].value;
            vaccs.push(vac);
          }
        })
        return vaccs;
      }

      const getTravelArr = (arr) => {
        const vaccs = [];
        arr.forEach((vac) => {
          const out = eventArr.filter((item) => vac.ids.includes(item.dataElement));
          if (out && out.length > 0) {
            for (let i = 0; i < out.length; i++) {
              for (let j = 0; j < vac.elements.length; j++) {
                if (vac.elements[j].id === out[i].dataElement) {
                  vac.elements[j].date = new Date(out[i].date).toLocaleDateString();
                  vac.elements[j].value = out[i].value;
                }
              }
            }
            vaccs.push(vac);
          }
        })
        return vaccs;
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
      const milestones = [
        {
          name: "G&D|12m Cognitive - 1. Puts something in a container",
          id: process.env.M_D1
        },
        {
          name: "G&D|12m Cognitive - 2. Looks for things he sees you hide",
          id: process.env.M_D2
        },
        {
          name: "G&D|12m Comminication - 1. Waves bye-bye",
          id: process.env.M_D3
        },
        {
          name: "G&D|12m Comminication - 2. Calls a parent by special name eg: Mom, Dad",
          id: process.env.M_D4
        },
        {
          name: "G&D|12m Comminication - 3. Understands no",
          id: process.env.M_D5
        },
        {
          name: "G&D|12m Physical - 1. Pulls up to stand",
          id: process.env.M_D6
        },
      ];
      const optionals = await getVaccines({ group_id: OPTIONALS });
      const pregnancy = await getVaccines({ group_id: PREGNANCY });
      const travellers = await getTravellers({ group_id: TRAVELLERS });

      if (out) {
        return successResponse(req, res, {
          qr: req.params.id,
          profile: out,
          events: eventArr,
          child: getArr(childhood),
          hpv: getArr(hpv),
          tdv: getArr(tdv),
          optionals: getArr(optionals),
          pregnancy: getArr(pregnancy),
          travellers: getTravelArr(travellers),
        });
      }
      return errorResponse(req, res, 'Patient not found');
    }
    return errorResponse(req, res, 'Patient not found');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

export const deletePatient = async (req, res) => {
  const { epi, beneficiary, foolhuma } = req.body;
  const { userId } = req.user;
  try {
    await Patient.destroy({
      where: {
        userId,
        epi,
        beneficiary,
        // foolhuma
      }
    });
    return successResponse(req, res, { message: "Deleted" });
  } catch (error) {
    return errorResponse(req, res, { message: error.message });
  }
}

export const getPatientVaccines = async (req, res) => {
  try {
    const out = await getPatientVaccineList(req.query.id);

    if (out) {
      return successResponse(req, res, { profile: out });
    }
    return errorResponse(req, res, 'Patient vaccines not found');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

export const getDataElementList = async (req, res) => {
  try {
    const out = await getDataElements(req.query.id);

    if (out) {
      return successResponse(req, res, { profile: out });
    }
    return errorResponse(req, res, 'Patient vaccines not found');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

export const getVaccineList = async (req, res) => {
  try {
    const out = await getVaccines();

    if (out) {
      return successResponse(req, res, { profile: out });
    }
    return errorResponse(req, res, 'Vaccines not found');
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

const genQR = ({ epi, entity }) => {
  var CryptoJS = require("crypto-js");
  var publicHash = CryptoJS.AES.encrypt(`${epi}|${entity}`, process.env.DHIS_SECRET).toString();
  const baseTxt = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(publicHash)).toString().replace('/', '|');
  return baseTxt;
}

export const generatePublicQR = async (req, res) => {
  return successResponse(req, res, { qr: genQR({ epi: req.body.epi, entity: req.body.entity_instance }) });
}

const getLatestDiagnosis = async (req, res) => {

}

export const getGrowthMonitoringData = async (req, res) => {
  const events = await getGrowthMonitoringEvents(req);
  res.json(events)
}

export const getGrowthMonitoringEvents = async (req) => {
  try {
      const fetched = await getPatientDetailsByEpi({ epi: req.body.epi });
      const tei = fetched.entity_instance;
      const url = `${process.env.BASE_API}events.json?fields=eventDate,dataValues[dataElement,value]&program=${process.env.PROGRAM}&ouMode=ACCESSIBLE&trackedEntityInstance=${tei}&programStage=${process.env.EIR_PROGRAM_STAGE}`;
      const out = await axios.get(url, {
          auth: {
              username: process.env.DHIS_USER,
              password: process.env.DHIS_PWD
          }
      });

      return out.data;
  } catch (e) {
      console.log("ERR", e);
      return [];
  }
}

export const getDevelopmentMilestonesData = async (req, res) => {
  const events = await getDevelopmentMilestonesEvents(req);
  res.json(events)
}

export const getDevelopmentMilestonesEvents = async (req) => {
  try {
      const fetched = await getPatientDetailsByEpi({ epi: req.body.epi });
      const tei = fetched.entity_instance;
      const url = `${process.env.BASE_API}events.json?fields=eventDate,dataValues[dataElement,value]&program=${process.env.PROGRAM}&ouMode=ACCESSIBLE&trackedEntityInstance=${tei}&programStage=t2mLXWlXNaL`;
      const out = await axios.get(url, {
          auth: {
              username: process.env.DHIS_USER,
              password: process.env.DHIS_PWD
          }
      });

      return out.data;
  } catch (e) {
      console.log("ERR", e);
      return [];
  }
}

// Primary Health Care (PHC) Registry

export const getPhcData = async (req, res) => {
  const events = await getPhcEvents(req);
  res.json(events)
}

export const getPhcEvents = async (req) => {
  try {
      const fetched = await getPatientDetailsByPhcId({ phcId: req.body.phcId });
      
      const tei = fetched.entity_instance;
      const url = `${process.env.BASE_API}events.json?fields=eventDate,dataValues[dataElement,value]&program=${process.env.PHC_PROGRAM}&ouMode=ACCESSIBLE&trackedEntityInstance=${tei}`;
      const out = await axios.get(url, {
          auth: {
              username: process.env.DHIS_USER,
              password: process.env.DHIS_PWD
          }
      });

      return out.data;
  } catch (e) {
      console.log("ERR", e);
      return [];
  }
}

// End of Primary Health Care (PHC) Registry