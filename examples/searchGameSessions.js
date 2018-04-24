requireOnce('aws')

var FLEET_ID = '' // your fleet id goes here

function searchGameSessions (fleetId) {
  return new AWS({
    region: 'sa-east-1', // feel free to change this value to whatever region you need
    action: 'SearchGameSessions',
    payload: {
      FleetId: fleetId
    }
  })
}

Spark.setScriptData('response', searchGameSessions(FLEET_ID))
