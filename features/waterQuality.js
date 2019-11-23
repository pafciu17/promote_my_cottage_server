const axios = require('axios');
const esriUtils = require('@esri/arcgis-to-geojson-utils');
const turf = require('@turf/turf');
const { reverseCoordinates, convertToEPSG3067, convertToWGS84 } = require('./utils');
const _ = require('lodash');

const url = 'http://paikkatieto.ymparisto.fi/arcgis/rest/services/Projektit/Vesikartta_PintavesienEkologinenTila2022/MapServer/2/query';

const getParams = (bbox) => ({
  f: 'json',
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects',
  geometry: {
      xmin:bbox[0][0],
      ymin:bbox[0][1],
      xmax:bbox[1][0],
      ymax:bbox[1][1],
      spatialReference: {
        wkid:3067
      }
  },
  geometryType: 'esriGeometryEnvelope',
  inSR: 3067,
  outFields: '*',
  utSR: 3067
});

// [ 618090.1992732066, 7012023.778092486 ],
//   [ 661526.478998388, 6991560.786317941 ]

const getBBoxPolygon = (bbox) => {
  const polygonArray = [[
    bbox[0],
    [bbox[1][0], bbox[0][1]],
    bbox[1],
    [bbox[0][0], bbox[1][1]],
    bbox[0]
  ]];
  return turf.polygon(polygonArray);
}

const getWaterQualityFeatures = async (rawInputBBox) => {
  const bbox = rawInputBBox.map(reverseCoordinates).map(convertToEPSG3067);

  const params = getParams(bbox);
  const response = await axios.get(url, { params });

  if (response.data && response.data.features) {
    const features = response.data.features.slice(0, 4); // temporary cut number of results
    const outputData = features.map(({ attributes, geometry }) => {
      const geoJsonGeometry = esriUtils.arcgisToGeoJSON({
        ...geometry,
        "spatialReference": {
          "wkid": 3067
        }
      });
      const intersection = turf.intersect(getBBoxPolygon(bbox), geoJsonGeometry);
      const centroid  = turf.centroid(intersection);
      const coordinates = centroid && centroid.geometry && centroid.geometry.coordinates ? reverseCoordinates(convertToWGS84(centroid.geometry.coordinates)) : null;
      return {
        coordinates,
        ..._.pick(attributes, ['Nimi', 'EkolTila'])
      }
    });
    return outputData;
  }
  return [];
};

module.exports = {
  getWaterQualityFeatures
};