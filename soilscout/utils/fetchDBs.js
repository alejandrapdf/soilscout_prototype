import { get, onValue, ref, set } from 'firebase/database';
import { db } from '../config.js';
import { updateAEDData, updateAEDMap } from './cache.js';

let staffData = {};
let newEntryID = 0;
let incidentReportData = {};
let incident = [];
let incidentData = {};
export let allIncidents = {};
let newEntryIDIncident = 0;
let activeAEDs;

const fetchIncidentReports = async () => {
  try {
    const incidentRep = await ref( db, 'incidentReports/' );
    const incidentRepSnapshot = await get( incidentRep );

    if ( incidentRepSnapshot.exists() ) {
      incidentReportData = await incidentRepSnapshot.val();

    } else {
      alert( 'Incident Report data not found.' );
    }
  } catch ( error ) {
    alert( 'Error fetching incident reports:', error.message );
  }
};


const addNewReport = async ( newIncidentReport,incidentID ) => {
  await set( ref( db, 'incidentReports/' + incidentID ), newIncidentReport );
};

const updateStafftoIncidentDetails = async ( user, staffName ) => {
  let newEntryID = 0;
  try {
    const incidentRep = await ref( db, 'incidentDetails/' );
    const incidentRepSnapshot = await get( incidentRep );

    if ( incidentRepSnapshot.exists() ) {
      incidentReportData = await incidentRepSnapshot.val();
      newEntryID = await incidentReportData.length - 1;
    } else {
      alert( 'Incident Report data not found.' );
    }
  } catch ( error ) {
    alert( 'Error fetching incident reports:', error.message );
  }

  const incidentDetailsRef = ref( db, 'incidentDetails/' + newEntryID );

  // Retrieve the existing document
  const snapshot = await get( incidentDetailsRef );
  if ( snapshot ) {
    const existingReport = snapshot.val();

    // Update the specific field
    const updatedReport = {
      ...existingReport,
      username: user,
      staffAttended: staffName,

    };
    // Save the modified document back to the database
    await set( incidentDetailsRef, updatedReport );

  } else {
    console.error( 'Document not found.' );
  }
};

export const removeStaffFromAED = async ( user ) => {

  const userRef = ref( db, `staff/${ user }` );
  // Fetch the existing data
  const snapshot = await get( userRef );
  const existingData = snapshot.val();
  // Update only the 'active' field, keeping other fields intact
  await set( userRef, { ...existingData, awayToIncident: true });

};


const fetchIncidentDetails = async () => {
  let newEntryID = 0;

  try {
    const incidentRep = ref( db, 'incidentDetails/' );
    const incidentRepSnapshot = await get( incidentRep );

    if ( incidentRepSnapshot.exists() ) {
      incidentReportData = await incidentRepSnapshot.val();
      newEntryID = incidentReportData.length - 1;
    };
  } catch ( error ) {
    return null; // Return null or an empty object in case of an error
  }

  try {
    const incidentLoc = ref( db, 'incidentDetails/' + newEntryID );
    const incidentSnapshot = await get( incidentLoc );

    if ( incidentSnapshot.exists() ) {
      incidentData = await incidentSnapshot.val();
      incident = [ incidentData.latitude, incidentData.longitude ];
      newEntryIDIncident = incidentData.length;
      return incidentData; // Return incidentData when details are found
    }
  } catch ( error ) {
    return null; // Return null or an empty object in case of an error
  };
};

export const fetchAllIncidents = async () => {

  try {

    const incidentRep = ref( db, 'incidentDetails/' );
    const incidentRepSnapshot = await get( incidentRep );

    if ( incidentRepSnapshot.exists() ) {
      allIncidents = await incidentRepSnapshot.val();

    };

  } catch ( error ) {
    return; // Return null or an empty object in case of an error
  }
};


const fetchStaffDetails = async () => {
  try {
    const staffDB = ref( db, 'staff/' );
    const staffSnapshot = await get( staffDB );

    if ( staffSnapshot.exists() ) {
      staffData = staffSnapshot.val();
    } else {
      alert( 'staffData data not found.' );
    }
  } catch ( error ) {
    alert( 'Error fetching staffData location:', error.message );
  }
};

const fetchAEDs = async () => {
  try {
    const aedDB = ref( db, 'aeds/' );
    const aedSnapshot = await get( aedDB );

    if ( aedSnapshot.exists() ) {

      await updateAEDMap( aedSnapshot.val() );
    } else {

    }
  } catch ( error ) {
  }
};


const checkActiveAEDs = () => {
  const starCountRef = ref( db, 'aeds/' );

  // Fetch data from the database
  onValue(
    starCountRef,
    ( snapshot ) => {
      const data = snapshot.val();
      if ( data ) {
        activeAEDs = Object.keys( data )
          .map( ( key ) => ( {
            name: data[ key ].name,
            latitude: data[ key ].latitude,
            longitude: data[ key ].longitude,
            ...( data[ key ].active ? { active: data[ key ].active } : {} ),
          } ) )
          .filter( ( aed ) => aed.active === true );


        updateAEDData( activeAEDs );


      }
    },
    ( error ) => {
      // Handle the error if fetching data fails
      console.error( 'Error fetching AED data:', error.message );
    }
  );
};

export { addNewReport, checkActiveAEDs, fetchAEDs, fetchIncidentDetails, fetchIncidentReports, fetchStaffDetails, incident, incidentData, incidentReportData, newEntryID, staffData, updateStafftoIncidentDetails };
