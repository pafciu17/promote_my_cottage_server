const proj4 = require('proj4');

proj4.defs('EPSG:3067', '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

const reverseCoordinates = (coordsArray) => coordsArray.reverse();

const convertToEPSG3067 = proj4('EPSG:3067').forward;

const convertToWGS84 = proj4('EPSG:3067').inverse;

module.exports = {
  reverseCoordinates,
  convertToEPSG3067,
  convertToWGS84
};