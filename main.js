const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { getRandomString } = require('./utils');
const { getWaterQualityFeatures } = require('./features/waterQuality');

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`Listening on ${port}`));

app.get('test', (req, res) => {
  console.log('test request');
  res.status(200).end();
});

const maps = {};

io.on('connection', (socket) => {

  console.log('connect!');

  socket.on('fetch_map_suggestions', async (inputMap) => {
      let outputMapData;
      let waterQuality = []
      console.log(inputMap.zoom);
      if (inputMap.zoom >= 12) {
        waterQuality = await getWaterQualityFeatures(inputMap.bounds);
      }

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

  socket.on('publish_map', ({ mapId }) => {
    console.log('publish Map ', mapId);
  })

  socket.on('fetch_map', ({ mapId }) => {
    console.log('fetch map', mapId);
    socket.emit('map_update', maps[mapId] || {});
  })
});
