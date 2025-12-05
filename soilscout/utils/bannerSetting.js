const setBannerInstruct = async ( user, directions ) => {

  if ( !user || !directions.length ) return null;
  const radius = 0.001;
  let closestInstruction = null;
  let minDistance = Number.MAX_VALUE;


  directions.forEach( ( direction ) => {
    const distance = Math.sqrt(
        Math.pow( user.latitude - direction.latitude, 2 ) +
      Math.pow( user.longitude - direction.longitude, 2 ),
    );

    if ( distance <= radius && distance < minDistance ) {
      minDistance = distance;
      closestInstruction = direction.instruction;
    }
  } );

  return closestInstruction;
};

export { setBannerInstruct };
