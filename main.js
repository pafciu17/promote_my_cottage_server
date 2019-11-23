const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { getRandomString } = require('./utils');
const { getWaterQualityFeatures } = require('./features/waterQuality');

server.listen(1917);

const maps = {};

io.on('connection', (socket) => {

  socket.on('fetch_map_suggestions', async (inputMap) => {
      let outputMapData;
      const waterQuality = await getWaterQualityFeatures(inputMap.bounds);

      if (!inputMap.mapId || !maps[inputMap.mapId]) {
        const mapId = getRandomString();
        outputMapData = {
          mapId,
          ...inputMap,
          waterQuality
        };
        maps[mapId] = outputMapData;
      } else {
        outputMapData = {
          ...maps[inputMap.mapId],
          waterQuality
        };
      }

      socket.emit('fetch_map_suggestions_done', {
        status: 'ok',
        mapData: outputMapData
      });

  });
});
