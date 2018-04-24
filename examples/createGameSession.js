requireOnce('aws')

var FLEET_ID = '' // your fleet id goes here
var MAXIMUM_PLAYER_SESSION_COUNT = 1 // just a convention, you don't have to create this variable

function createGameSession (fleetId, maximumPlayerSessionCount) {
  return new AWS({
    region: 'sa-east-1', // feel free to change this value to whatever region you need
    action: 'CreateGameSession',
    payload: {
      FleetId: fleetId,
      MaximumPlayerSessionCount: maximumPlayerSessionCount
    }
  })
}

Spark.setScriptData(
  'response',
  createGameSession(FLEET_ID, MAXIMUM_PLAYER_SESSION_COUNT)
)
