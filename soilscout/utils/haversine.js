// Function to calculate Haversine distance between two coordinates

const calculateHaversineDistance = ( lat1, lon1, lat2, lon2 ) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad( lat2 - lat1 );
  const dLon = deg2rad( lon2 - lon1 );
  const a =
    Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +

    Math.cos( deg2rad( lat1 ) ) * Math.cos( deg2rad( lat2 ) ) * Math.sin( dLon / 2 ) * Math.sin( dLon / 2 );
  const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
  const distance = R * c * 1000;
  return distance;
};

// Function to convert degrees to radians
const deg2rad = ( deg ) => {
  return deg * ( Math.PI / 180 );
};


export {calculateHaversineDistance};
