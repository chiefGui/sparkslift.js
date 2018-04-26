# sparkslift.js v1.0.0

Easily integrate [Amazon's GameLift](https://aws.amazon.com/gamelift/) with [GameSparks](https://www.gamesparks.com/).

### Disclaimer

It's important to note that the code available here isn't intended to use in an ordinary JavaScript application. Instead, all the instructions containing here are focused on the [Cloud Code platform](https://docs.gamesparks.com/documentation/configurator/cloud-code.html) provided by GameSparks. That being said, you won't find anything related to this integration on NPM.

## Motivation

The reason this repository exists is to help people trying to integrate GameLift with GameSparks. It contains all the necessary files and the step-by-step instructions to get you up and running.

## Preparing the dependencies

_The instructions below assumes that you already have an account both in Amazon's GameLift and GameSparks and have your game server up and running._

1.  Log in into your account on [GameSpark's portal](https://portal2.gamesparks.net/) and choose the game you want to configure.
2.  Create a module using the shortcode "sha". [🡒 How to create a module](#creating-a-module)
3.  Create a module using the shortcode "aws".
4.  Create a module using the shortcode "GameLiftCredentials".
5.  In the "sha" module, copy and paste [this content](https://raw.githubusercontent.com/chiefGui/sparkslift.js/master/modules/sha.js). Save and close the module.
6.  In the "aws" module, copy and paste [this content](https://raw.githubusercontent.com/chiefGui/sparkslift.js/master/modules/aws.js). Save and close the module.
7.  In the "GameLiftCredentials" module, copy and paste [this content](https://raw.githubusercontent.com/chiefGui/sparkslift.js/master/modules/GameLiftCredentials.js). Now, this step requires more attention. As you might have seen, this module has two (required) empty fields called respectively `key` and `secret`, which are provided by Amazon. If you do have them already, please, paste them within the quotes and you're good to go by saving and closing the module. Otherwise, [refer to Amazon's official documentation on how to get them](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html).
8.  Done.

## Making your first request to GameLift

If you prepared the dependencies correctly and no errors were shown, probably you're ready to start making requests to GameLift, such as [CreateGameSession](https://docs.aws.amazon.com/gamelift/latest/apireference/API_CreateGameSession.html) or [DescribeInstances](https://docs.aws.amazon.com/gamelift/latest/apireference/API_DescribeInstances.html).

Access your Cloud Code page again and add a new event script by clicking in the plus sign next to the `Events` folder, which probably is your very first folder available. To exemplify, let's name it `SearchGameSessions`, which, as you can imagine, will search for game sessions using [Amazon's API](https://docs.aws.amazon.com/gamelift/latest/apireference/API_SearchGameSessions.html).

Once your file is created, paste the following code. _Don't forget to place your fleet id inside the quotes of the FLEET_ID variable._

```js
requireOnce("aws");

var FLEET_ID = ""; // your fleet id goes here

function searchGameSessions(fleetId) {
  return new AWS({
    region: "sa-east-1", // feel free to change this value to whatever region you need
    action: "SearchGameSessions",
    payload: {
      FleetId: fleetId
    }
  });
}

Spark.setScriptData("response", searchGameSessions(FLEET_ID));
```

Now, save your file and head to the [Test Harness page](https://docs.gamesparks.com/documentation/test-harness/). If you're not authenticated on GameSparks' API yet, please do, otherwise they won't allow you to dispatch external requests. Remember: the calls triggered by GameSparks are on your players behalf. When you try to make a request without being an authenticated player, GameSparks will take action and for security reasons will block you to move further. [↗ All about authentication](https://docs.gamesparks.com/documentation/key-concepts/authentication.html)

Considering you're authenticated, open the `Log Access` submenu and a `SearchGameSessions` button might be available. Click on it and some code should be displayed on the textarea below the `JSON` mark. Something like this may have appeared:

```json
{
  "@class": ".LogEventRequest",
  "eventKey": "SearchGameSessions"
}
```

Great. Now tap on that shiny, green `Send Request` button and wait a few (mili)seconds. If everything went well, your response should be something like this:

```json
{
  "@class": ".LogEventResponse",
  "scriptData": {
    "response": {
      "status": 200,
      "json": {
        "GameSessions": [
          {
            "CreationTime": 1524589254.42,
            "CurrentPlayerSessionCount": 0,
            "FleetId": "<your fleet id>",
            "GameProperties": [],
            "GameSessionId": "<your game session id>",
            "IpAddress": "<ip address>",
            "MaximumPlayerSessionCount": "<maximum player session count>",
            "Port": "<port>",
            "Status": "<status>"
          }
        ]
      }
    }
  }
}
```

Of course, your mileage may vary depending on your context. Whether you have or not an active game session, etc. But overall your request was successful if the `status` property is `200`.

## Your next requests

The demonstration above was about `SearchGameSessions` and I understand people may face difficulties on trying to implement different requests. Though I have plans to enhance the plug-in to make it easier to use, I can't promise anything, meaning that for now you have to cover the different scenarios yourself, but fear not brave developer because the task is easier than it may seem.

Regardless of what you want to do, the first required thing is to refer to [GameLift's client API ↗](https://docs.aws.amazon.com/gamelift/latest/apireference/). Search for the action you want--[CreateGameSession ↗](https://docs.aws.amazon.com/gamelift/latest/apireference/API_CreateGameSession.html) for instance,--and give it a read.

Most of the methods will have a similar documentation structure, with similar sections etc, and one of the most important of them is the **Request Parameters**, which shows what the request expects to receive from us as a `payload`. `CreateGameSession`, for example, only have one _required_ parameter:

![](https://i.imgur.com/YPVfVhK.png)

Meaning that it's 1000% necessary that you pass it along with your request. Meanwhile, if you're following me reading the `CreateGameSession` documentation, you'll notice it doesn't say it requires `FleetId` or `AliasId`, which is a problem because in most cases one of these two options are expressly necessary. While their API reference is not updated, keep this in mind:

> My requests require either a FleetId or a AliasId to perform correctly.

If you say the above thrice out loud, don't worry because the quote will stick to your mind.

Ok, moving on. After reading the CreateGameSession documentation, we can conclude that we must inform GameLift two things:

* `FleetId`/`AliasId` and
* `MaximumPlayerSessionCount`

To adapt the code snippet of the demonstration above, just create another event script called `CreateGameSession` using the following code:

```js
requireOnce("aws");

var FLEET_ID = ""; // your fleet id goes here
var MAXIMUM_PLAYER_SESSION_COUNT = 1; // just a convention, you don't have to create this variable

function createGameSession(fleetId, maximumPlayerSessionCount) {
  return new AWS({
    region: "sa-east-1", // feel free to change this value to whatever region you need
    action: "CreateGameSession",
    payload: {
      FleetId: fleetId,
      MaximumPlayerSessionCount: maximumPlayerSessionCount
    }
  });
}

Spark.setScriptData(
  "response",
  createGameSession(FLEET_ID, MAXIMUM_PLAYER_SESSION_COUNT)
);
```

If you want to zoom in the differences between the two scripts, just open them in two text editors and put one right the other and you'll easily spot what was changed. But look closely because if a simple comma is missing, you might face unexpected behaviors.

## Testing against GameLiftLocal

#### Available at: `v1.1.0`

GameSparks integration to GameLift wouldn't be pleasant if we couldn't test against GameLiftLocal. Having to rebuild our game and create a brand new fleet just for debugging purposes is not only exhaustive but time consuming.

Thanks to the GameLiftLocal web server exposal, we can perform HTTP requests via GameSparks to our local machine just like we do against production fleet instances. Amazing, ain't it? And the good news is that is easier than you think.

Briefly, a production request would look like this:

```js
return new AWS({
  region: "sa-east-1",
  action: "CreateGameSession",
  payload: {
    FleetId: "fleet-123123123"
  }
});
```

If you want to perform exactly the same request against GameLiftLocal--the one in your machine,--all you have to do is to pass a `local` object containing the `address` and `port` where GameLiftLocal is settled:

```js
return new AWS({
  region: "sa-east-1",
  action: "CreateGameSession",
  payload: {
    FleetId: "fleet-123123123"
  },
  local: {
    address: "172.31.255.255", // your (public) IP/domain goes here
    port: 8080 // the port GameLift is listening to goes here
  }
});
```

Please note that the port GameLiftLocal is listening to **must be** open under the `TCP` protocol in order to make GameSparks perform successful calls.

* Don't have or know your public IP? [Get it here ↗](http://whatismyip.host/)
* Unsure whether your ports are open or don't know how to do it? [This tutorial may help you ↗](https://www.wikihow.com/Open-Ports)

## Troubleshooting

1.  Always make sure your `key` and `secret` are up-to-date and functional.
2.  Always make sure the names/shortcodes of your files/events/modules are correct.
3.  Always [make sure you're authenticated as a player on GameSparks ↗](https://docs.gamesparks.com/documentation/key-concepts/authentication.html).

## Creating a module

Installing a module on GameSparks is an easy and straight forward process. All you have to do is to access the **Cloud Code** menu by opening the **Configurator** sidebar and clicking on the "plus" sign next to the "Modules" folder.

Once you've done that, a popup should appear, asking you for a `Short Code`. Now, you place whatever name you want and the file representing the module is ready to go.

## Where everything started

[Please, refer to this link.](https://gamedev.amazon.com/forums/questions/68485/integration-between-gamesparks-and-gamelift.html)

## License

MIT
