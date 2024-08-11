import axios from "axios";

// const BASE_API = `https://dev-tracker.health.gov.mv/dhis/api/`;
// const BASE_API = `https://tracker-dhis2.health.gov.mv/api/`;
const BASE_API = process.env.BASE_API;
export const TRAVELLERS = process.env.TRAVELLERS;
export const OPTIONALS = process.env.OPTIONALS;
export const PREGNANCY = process.env.PREGNANCY;

// Electronic Immunization Registry (EIR) API Implementation

export const getPatientDetails = async ({ beneficiary, foolhuma }) => {
    try {
        const url = `${BASE_API}trackedEntityInstances.json?program=${process.env.PROGRAM}&fields=attributes,enrollments&ouMode=ACCESSIBLE&filter=${process.env.PATIENT_PARAM_FOOLHUMA}:eq:${beneficiary}`;

        const out = await axios.get(url, {
            auth: {
                username: process.env.DHIS_USER,
                password: process.env.DHIS_PWD
            }
        });

        if (out.data.trackedEntityInstances && out.data.trackedEntityInstances.length > 0) {
            const attr = out.data.trackedEntityInstances[0].attributes.map((elem) => { return { key: elem.attribute, value: elem.value } });
            attr.push({ key: 'entityInstance', value: out.data.trackedEntityInstances[0].enrollments ? out.data.trackedEntityInstances[0].enrollments[0].trackedEntityInstance : 0 });
            return attr;
        }
        return [];
    } catch (e) {
        console.log("ERR", e);
        return [];
    }
}

export const getPatientDetailsByNid = async ({ nic, foolhuma }) => {
    try {
        const url = `${BASE_API}trackedEntityInstances.json?program=${process.env.PROGRAM}&fields=attributes,enrollments&ouMode=ACCESSIBLE&filter=${process.env.PATIENT_PARAM_NATIONALID}:eq:${nic}`;
        const phcUrl = `${BASE_API}trackedEntityInstances.json?program=${process.env.PHC_PROGRAM}&fields=attributes,enrollments&ouMode=ACCESSIBLE&filter=${process.env.PATIENT_PARAM_NATIONALID}:eq:${nic}`;

        // Perform both requests concurrently
        const [out, phcOut] = await Promise.all([
            axios.get(url, {
                auth: {
                    username: process.env.DHIS_USER,
                    password: process.env.DHIS_PWD
                }
            }),
            axios.get(phcUrl, {
                auth: {
                    username: process.env.DHIS_USER,
                    password: process.env.DHIS_PWD
                }
            })
        ]);

        if (out.data.trackedEntityInstances && out.data.trackedEntityInstances.length > 0) {
            const attr = out.data.trackedEntityInstances[0].attributes.map((elem) => { return { key: elem.attribute, value: elem.value } });
            attr.push({ key: 'entityInstance', value: out.data.trackedEntityInstances[0].enrollments ? out.data.trackedEntityInstances[0].enrollments[0].trackedEntityInstance : 0 });
            return attr;
        } else if (phcOut.data.trackedEntityInstances && phcOut.data.trackedEntityInstances.length > 0) {
            const attr = phcOut.data.trackedEntityInstances[0].attributes.map((elem) => { return { key: elem.attribute, value: elem.value } });
            attr.push({ key: 'entityInstance', value: phcOut.data.trackedEntityInstances[0].enrollments ? phcOut.data.trackedEntityInstances[0].enrollments[0].trackedEntityInstance : 0 });
            return attr;
        }
        return [];
    } catch (e) {
        console.log("ERR", e);
        return [];
    }
}

export const getPatientDetailsByEpi = async ({ epi }) => {
    try {
        const url = `${BASE_API}trackedEntityInstances.json?program=${process.env.PROGRAM}&fields=attributes,enrollments&ouMode=ACCESSIBLE&filter=${process.env.PATIENT_PARAM_EPI}:eq:${epi}`;
        const out = await axios.get(url, {
            auth: {
                username: process.env.DHIS_USER,
                password: process.env.DHIS_PWD
            }
        });

        if (out.data.trackedEntityInstances && out.data.trackedEntityInstances.length > 0) {
            const attr = out.data.trackedEntityInstances[0].attributes.map((elem) => { return { key: elem.attribute, value: elem.value } });
            attr.push({ key: 'entityInstance', value: out.data.trackedEntityInstances[0].enrollments ? out.data.trackedEntityInstances[0].enrollments[0].trackedEntityInstance : 0 });
            return parsePatient(attr);
        }
        return [];
    } catch (e) {
        console.log("ERR", e);
        return [];
    }
}

export const getPatientDetailsByPhcId = async ({ phcId }) => {
    try {
        const url = `${BASE_API}trackedEntityInstances.json?program=${process.env.PHC_PROGRAM}&fields=attributes,enrollments&ouMode=ACCESSIBLE&filter=${process.env.PATIENT_PARAM_PHCID}:eq:${phcId}`;
        const out = await axios.get(url, {
            auth: {
                username: process.env.DHIS_USER,
                password: process.env.DHIS_PWD
            }
        });

        if (out.data.trackedEntityInstances && out.data.trackedEntityInstances.length > 0) {
            const attr = out.data.trackedEntityInstances[0].attributes.map((elem) => { return { key: elem.attribute, value: elem.value } });
            attr.push({ key: 'entityInstance', value: out.data.trackedEntityInstances[0].enrollments ? out.data.trackedEntityInstances[0].enrollments[0].trackedEntityInstance : 0 });
            return parsePatient(attr);
        }
        return [];
    } catch (e) {
        console.log("ERR", e);
        return [];
    }
}

export const getVaccines = async ({ group_id }) => {
    try {
        const url = `${BASE_API}dataElementGroups/${group_id}.json?fields=dataElements[id,formName]`;
        const out = await axios.get(url, {
            auth: {
                username: process.env.DHIS_USER,
                password: process.env.DHIS_PWD
            }
        });

        if (out.data.dataElements && out.data.dataElements.length > 0) {
            return out.data.dataElements.map((item) => { return { id: item.id, name: item.formName } });
        }

        return [];
    } catch (e) {
        console.log("ERR", e);
        return [];
    }
}

export const getTravellers = async ({ group_id }) => {
    try {
        const seturl = `${BASE_API}dataElementGroupSets/${group_id}.json`;
        const setout = await axios.get(seturl, {
            auth: {
                username: process.env.DHIS_USER,
                password: process.env.DHIS_PWD
            }
        });

        if (setout.data.dataElementGroups && setout.data.dataElementGroups.length > 0) {
            const groups = setout.data.dataElementGroups;
            const items = [];
            for (let i = 0; i < groups.length; i++) {
                const url = `${BASE_API}dataElementGroups/${groups[i].id}.json?fields=dataElements[id,formName]`;
                const out = await axios.get(url, {
                    auth: {
                        username: process.env.DHIS_USER,
                        password: process.env.DHIS_PWD
                    }
                });
                if (out.data.dataElements && out.data.dataElements.length > 0) {
                    const elements = out.data.dataElements;
                    const elem = [];
                    const ids = [];
                    for (let j = 0; j < elements.length; j++) {
                        ids.push(elements[j].id);
                        elem.push({ id: elements[j].id, name: elements[j].formName });
                    }
                    items.push({ ids, elements: elem });
                }
            }

            return items;
        }
        return [];
    } catch (e) {
        console.log("ERR", e);
        return [];
    }
}

export const getEvents = async (entity_id) => {
    try {
        const url = `${BASE_API}events.json?status=COMPLETED&fields=eventDate,programStage,dataValues[dataElement,value]&trackedEntityInstance=${entity_id}`;
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

export const getDataElements = async () => {
    try {
        const url = `${BASE_API}dataElements.json`;
        const out = await axios.get(url, {
            auth: {
                username: process.env.DHIS_USER,
                password: process.env.DHIS_PWD
            }
        });

        if (out.data.dataElements && out.data.dataElements.length > 0) {
            return out.data.dataElements;
        }

        return [];
    } catch (e) {
        console.log("ERR", e);
        return [];
    }
}

export const getVaccinationsCenters = async () => {
    try {
        const url = `${BASE_API}organisationUnitGroups/${process.env.ORGANIZATION_UNIT_GROUP}.json?fields=organisationUnits[id,name]`;

        const out = await axios.get(url, {
            auth: {
                username: process.env.DHIS_USER,
                password: process.env.DHIS_PWD
            }
        });

        if (out.data.organisationUnits && out.data.organisationUnits.length > 0) {
            return out.data.organisationUnits;
        }

        return [];
    } catch (e) {
        console.log("ERR", e);
        return [];
    }
}

export function parsePatient(arr) {
    const getParam = (key) => {
        const key_in = key.toString();
        const filtered = arr.filter(row => row.key === key_in);
        if (filtered && filtered.length > 0) {
            return filtered[0].value;
        }
        return null;
    }

    return {
        id: getParam(process.env.PATIENT_PARAM_ID),
        epi: getParam(process.env.PATIENT_PARAM_EPI),
        phcId: getParam(process.env.PATIENT_PARAM_PHCID),
        name: getParam(process.env.PATIENT_PARAM_NAME),
        dob: getParam(process.env.PATIENT_PARAM_DOB),
        sex: getParam(process.env.PATIENT_PARAM_SEX),
        resident: getParam(process.env.PATIENT_PARAM_RESIDENT),
        qr: getParam("qr"),
        nic: getParam(process.env.PATIENT_PARAM_NIC),
        foolhuma: getParam(process.env.PATIENT_PARAM_FOOLHUMA),
        mothers_name: getParam(process.env.PATIENT_PARAM_MOTHER_NAME),
        mother_contact: getParam(process.env.PATIENT_PARAM_MOTHER_CONTACT),
        mother_nic: getParam(process.env.PATIENT_PARAM_MOTHER_NIC),
        residential_island: getParam(process.env.PATIENT_PARAM_RESIDENTIAL_ISLAND),
        residential_address: getParam(process.env.PATIENT_PARAM_RESIDENTIAL_ADDRESS),
        residential_no: getParam(process.env.PATIENT_PARAM_RESIDENTIAL_NO),
        caregiver: getParam(process.env.PATIENT_PARAM_CAREGIVER),
        caregiver_id: getParam(process.env.PATIENT_PARAM_CAREGIVER_ID),
        other_contact: getParam(process.env.PATIENT_PARAM_OTHER_CONTACT),
        entity_instance: getParam("entityInstance"),
        other: arr
    }
}

// End of Electronic Immunization Registry (EIR) API Implementation

// Primary Health Care (PHC) Registry API Implementation

// End of Primary Health Care (PHC) Registry API Implementation