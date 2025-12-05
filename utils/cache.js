const directionsCache = {};
const closestAEDCache = {};
let aedData = [];
let aedMarkers = [];
export const updateAEDData = ( newAEDData ) => {
  aedData = newAEDData;
};

export const updateAEDMap = ( aeds ) => {
  aedMarkers = aeds;
};

export { aedData, aedMarkers, closestAEDCache, directionsCache};
