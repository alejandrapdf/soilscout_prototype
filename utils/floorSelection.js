

import * as Location from 'expo-location';
import { get, ref, set } from 'firebase/database';
import { React } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { db } from '../config.js';
import { calculateHaversineDistance } from '../utils/haversine.js';

let userLocation = [];
let userOrStaff = "";
let floor = 1;

const updateDatabase = async () => {
    let newEntryID = 0;
    try {
        const incidentRep = await ref( db, 'incidentDetails/' );
        const incidentRepSnapshot = await get( incidentRep );

        if ( incidentRepSnapshot.exists() ) {
            incidentReportData = await incidentRepSnapshot.val();
            newEntryID = await incidentReportData.length;
        } else {
            alert( 'Incident Report data not found.' );
        }
    } catch ( error ) {
        alert( 'Error fetching incident reports:', error.message );
    }

    await set( ref( db, 'incidentDetails/' + newEntryID ), {
            longitude: userLocation.coords.longitude,
            latitude: userLocation.coords.latitude,
            aedUsed: "",
            staffAttended: "",
            username: "",
            floor: floor,
            incidentDate: new Date().toLocaleString( 'en-GB', { timeZone: 'UTC' } )

        } );

};
const floorSelection = async ( navigation, toggleModal, userStaff ) => {
    userOrStaff = userStaff;

    try {

        const { status } = await Location.requestForegroundPermissionsAsync();

        if ( status === 'granted' ) {
            userLocation = await Location.getCurrentPositionAsync( { accuracy: Location.Accuracy.BestForNavigation } );
            const buildingLocation = { latitude: 55.86113328237915, longitude: -4.243556935890021 };
            const buildingRadius = 20;

            const distance = calculateHaversineDistance(
                userLocation.coords.latitude,
                userLocation.coords.longitude,
                buildingLocation.latitude,
                buildingLocation.longitude
            );

            if ( distance <= buildingRadius ) {
                // User is inside the building
                toggleModal();
            } else {
                // User is not inside building
                if ( userOrStaff === "user" ) {
                    floor = 1;
                    await updateDatabase();
                    navigation.navigate( 'NearestAED', { floorParam: 1 } );
                } else {
                    floor = 1;
                    navigation.navigate( 'NearestAED', { floorParam: ( userOrStaff + "(" + 1 + ")" ) } );
                }
            }

        } else {
            // Permissions not granted
            alert( 'Error getting route, check your connectivity and try again. Otherwise, a defib map is also available in the menu' );
   }
    } catch ( error ) {
        // Handle any errors that might occur during the location retrieval or database update
        alert( 'Error getting route, check your connectivity and try again. Otherwise, a defib map is also available in the menu' );
    };

};
const renderNumberList = (navigation,toggleModal) => {
    const numbers = Array.from( { length: 11 }, ( _, index ) => index + 1 );

    return numbers.map( ( number ) => (
        <TouchableOpacity key={ number } onPress={ () => handleFloorSelection( number, navigation, toggleModal ) }>
            <Text
                style={ { color: 'white', textAlign: 'center', fontSize: 60, margin: '10%' } } >
                { number }
            </Text>
        </TouchableOpacity>
    ) );
};

const handleFloorSelection = async ( selectedFloor, navigation, toggleModal ) => {
    toggleModal();

    if ( userOrStaff == "user" ) {

    if ( selectedFloor == 1 ) {
        floor = 1;
        await updateDatabase();
        navigation.navigate( 'NearestAED', { floorParam: 1 } );

    } else {
        floor = selectedFloor;
        await updateDatabase();
        navigation.navigate( 'NearestAED', { floorParam: selectedFloor } );
    }
}
else{
        if ( selectedFloor == 1 ) {
            floor= 1;

            navigation.navigate( 'NearestAED', { floorParam: ( userOrStaff + "(" + 1 + ")" ) } );

        } else {
            floor = selectedFloor;

            navigation.navigate( 'NearestAED', { floorParam: ( userOrStaff + "(" + selectedFloor + ")" ) } );
        }
}
};

export { floorSelection, handleFloorSelection, renderNumberList, userLocation };
