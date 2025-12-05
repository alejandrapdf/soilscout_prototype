import polyline from '@mapbox/polyline';
import axios from 'axios';
import { Alert } from 'react-native';
import { key } from '../key/apiKeys.js';
import { closestAEDCache, directionsCache } from './cache.js';
import { incident } from './fetchDBs.js';
let durationText = "";
/**
 * Get directions to the nearest AED.
 * @param {Object} origin - The origin coordinates.
 * @param {Array} closest - The closest AED coordinates.
 * @param {Object} navigation - React Navigation object.
 * @return {Promise<Array>} - The directions.
 */
export async function computeDirections( origin, closest, navigation ) {
  const cacheKey = await JSON.stringify( { origin, closest } );

  if ( directionsCache[ cacheKey ] ) {
    return directionsCache[ cacheKey ];
  }

  const apiKey = key;

  const request = {
    origin: {
      location: {
        latLng: {
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: closest[ 0 ],
          longitude: closest[ 1 ],
        },
      },
    },
    travelMode: 'WALK',
    languageCode: 'en-US',
    units: 'IMPERIAL',
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'routes.legs,routes.polyline.encodedPolyline',
  };

  try {
    const response = await axios.post(
      `https://routes.googleapis.com/directions/v2:computeRoutes?key=${ apiKey }`,
      JSON.stringify( request ),
      { headers },
    );

    const directions = await response.data.routes;
    directionsCache[ cacheKey ] = await directions;

    return directions;
  } catch ( error ) {
    Alert.alert(
      'Error',
      'Error fetching directions due to limited network, check your connectivity',
      [
        {
          text: 'OK',
        },
      ],
    );
    throw error; // Rethrow the error to be handled by the calling function
  }
}

/**
 * Find the closest AED to the given origin.
 * @param {Object} origin - The user's current location.
 * @param {Array} AEDLocations - Array of AED locations.
 * @param {Object} navigation - React Navigation object.
 * @return {Promise<Array>} - The coordinates of the closest AED.
 */
export async function findClosestAED( origin, AEDLocations, navigation ) {

  const cacheKey = JSON.stringify( { origin, AEDLocations } );

  if ( closestAEDCache[ cacheKey ] ) {
    return closestAEDCache[ cacheKey ];
  }

  const apiKey = key;

  const destinations = AEDLocations.map( ( location ) => ( {
    waypoint: {
      location: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    },
  } ) );

  const request = {
    origins: [
      {
        waypoint: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
      },
    ],
    destinations: destinations,
    travelMode: 'WALK',
    languageCode: 'en-US',
    units: 'IMPERIAL',
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'duration,originIndex,destinationIndex',
  };

  try {
    const response = await axios.post(
      `https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix?key=${ apiKey }`,
      JSON.stringify( request ),
      { headers }, );

    let closestLocation = AEDLocations[ response.data[ 0 ].destinationIndex ];
    let closestDuration = parseInt( response.data[ 0 ].duration, 10 );

    response.data.forEach( ( each ) => {
      const durationString = each.duration;
      const duration = parseInt( durationString, 10 );

      if ( duration < closestDuration ) {

        durationText = durationString;

        closestLocation = AEDLocations[ each.destinationIndex ];
        closestDuration = duration;
      }
    } );

    const closest = [ closestLocation.latitude, closestLocation.longitude ];

    closestAEDCache[ cacheKey ] = closest;

    return closest;

  } catch ( error ) {
    Alert.alert(
      'Error',
      'Error fetching directions due to limited network, check your connectivity',
      [
        {
          text: 'OK',
        },
      ],
    );
    throw error; // Rethrow the error to be handled by the calling function
  };


}

/**
 * Extract directions and related polyline coordinates.
 * @param {Array} routeData - Route data containing directions and polyline.
 * @param {Array} closest - The coordinates of the closest AED.
 * @param {boolean} backToIncident - Flag indicating whether to return to the incident.
 * @param {Object} navigation - React Navigation object.
 * @return {Promise<Array>} - Array containing instructions and related polyline coordinates.
 */
export async function extractDirections( routeData, closest, backToIncident, user, stairs ) {
  const instructions = [];
  let relatedPoly = [];

  try {
    // Loop through each route
    for ( const route of routeData ) {
      const legs = await route.legs;

      // Loop through each leg
      for ( const leg of legs ) {
        const steps = await leg.steps;

        // Loop through each step within the leg
        for ( const step of steps ) {
          try {
            if ( step.navigationInstruction && step.navigationInstruction.instructions ) {
              // Extract and store the navigation instructions
              const instruction = await step.navigationInstruction.instructions;
              await instructions.push( instruction );

              // Decode the polyline to extract coordinates for the route
              const poly = await step.polyline.encodedPolyline;
              const decodedPolyline = await polyline.decode( poly );

              // Map the decoded coordinates to include instructions
              const routeCoordinates = await decodedPolyline.map( ( point ) => ( {
                instruction: step.navigationInstruction.instructions,
                latitude: point[ 0 ],
                longitude: point[ 1 ],
              } ) );

              // Store the coordinates for the route related to the instruction
              await relatedPoly.push( routeCoordinates );
            } else {
              // If step doesn't have instructions,
              // switch to step error handling
              throw new Error( 'Step Error: Missing instructions' );
            }
          } catch ( error ) {
            console.log( error.message );
          }
        }
      }
    }
  } catch ( error ) {
    console.log( 'An error occurred:', error );
  }

  // Flatten the array to a single level
  relatedPoly = await relatedPoly.flat( 1 );


  //To achieve a more accurate polyline drawing, the last instruction should be added
  if ( backToIncident == false ) {
    // Add the coordinates of the closest AED to the end of the array
    const firstInstruct = await relatedPoly[ 0 ].instruction;
    relatedPoly.unshift( {
      instruction: firstInstruct,
      latitude: user.latitude,
      longitude: user.longitude,
    } );
    const lastInstruct = await relatedPoly[ ( relatedPoly.length ) - 1 ].instruction;
    relatedPoly.push( {
      instruction: lastInstruct,
      latitude: closest[ 0 ],
      longitude: closest[ 1 ],
    } );


  }
  else if ( backToIncident == true ) {
    //coords of incident to end of Array
    const firstInstruct = await relatedPoly[ 0 ].instruction;
    relatedPoly.unshift( {
      instruction: firstInstruct,
      latitude: user.latitude,
      longitude: user.longitude,
    } );
    const lastInstruct = await relatedPoly[ ( relatedPoly.length ) - 1 ].instruction;
    relatedPoly.push( {
      instruction: lastInstruct,
      latitude: incident[ 0 ],
      longitude: incident[ 1 ],
    } );


  }
  else if ( stairs != null ) {
    const firstInstruct = await relatedPoly[ 0 ].instruction;
    relatedPoly.unshift( {
      instruction: "Head to the stairs/lift",
      latitude: user.latitude,
      longitude: user.longitude,
    } );
    const lastInstruct = await relatedPoly[ ( relatedPoly.length ) - 1 ].instruction;
    relatedPoly.push( {
      instruction: lastInstruct,
      latitude: stairs[ 0 ],
      longitude: stairs[ 1 ],
    } );
  }

  return relatedPoly;
}

/**
 * Draw polyline on the map.
 * @param {Array} routeData - Route data containing polyline information.
 * @param {string} AED - Name of the AED.
 * @param {boolean} backToIncident - Flag indicating whether to return
 * to the incident.
 * @return {Array} - Array containing coordinates for the polyline.
 */
export async function drawPolyline( routeData, closest, backToIncident, user, stairs ) {
  // Extract encoded polyline from route data
  const encodedPolyline = await routeData[ 0 ].polyline.encodedPolyline;
  const decodedPolyline = await polyline.decode( encodedPolyline );

  // Map decoded coordinates to the desired format
  const routeCoordinates = await decodedPolyline.map( ( point ) => ( {
    latitude: point[ 0 ],
    longitude: point[ 1 ],
  } ) );

  //To achieve a more accurate polyline drawing, the last instruction should be added
  if ( backToIncident == false ) {
    // Add the coordinates of the closest AED to the end of the array
    routeCoordinates.unshift( {

      latitude: user.latitude,
      longitude: user.longitude,
    } );
    routeCoordinates.push( {
      latitude: closest[ 0 ],
      longitude: closest[ 1 ],
    } );


  }
  else if ( backToIncident == true ) {
    //coords of incident to end of Array
    routeCoordinates.unshift( {

      latitude: user.latitude,
      longitude: user.longitude,
    } );
    routeCoordinates.push( {

      latitude: incident[ 0 ],
      longitude: incident[ 1 ],
    } );


  }
  else if ( stairs != null ) {
    //coords of incident to end of Array
    routeCoordinates.unshift( {

      latitude: user.latitude,
      longitude: user.longitude,
    } );
    routeCoordinates.push( {

      latitude: stairs[ 0 ],
      longitude: stairs[ 1 ],
    } );
  };
  return routeCoordinates;
};


export async function extractDuration() {
  if ( durationText && typeof durationText === 'string' && durationText.endsWith( 's' ) ) {
    // Extract the numeric value from the string and convert it to seconds
    const seconds = parseInt( durationText );

    // Convert seconds to minutes and round to the nearest whole number
    const minutes = Math.round( seconds / 60 );

    // Convert the rounded minutes back to string
    const minutesString = minutes.toString();

    return minutesString;
  } else{
    return "0";
  };
}
