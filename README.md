# Twurple, CypherCam, and Tmi.js

This is an improvement upon [CypherCam](https://github.com/rickstergg/CypherCam), which since built on top of [tmi.js](https://github.com/tmijs/tmi.js), lost a lot of its capabilities like `!thanos` since commands like `/timeout` weren't able to be done anymore.

While we wait for [tmi.js-v2](https://github.com/tmijs/tmi.js-v2) to be fleshed out fully, we're gonna start with ShortyBot as an application that uses [Twurple](https://twurple.js.org/).

# Setup

1. Create a Twitch Application to supply to the bot in order to make Twitch API calls.
2. Authenticate as the Twitch user you want ShortBot to operate as. (Could be yourself, like rickstergg, or CypherCam, a mod on your channel)
3. After running it locally, you will be setup and good to go!

This README will guide you through the process from start to finish.

## Clone this Repo

Clone this repository onto your local machine!

## Create your own Twitch Application

Head over to the [Twitch Console](https://dev.twitch.tv/console/apps/create) to create your own application.

- For `name`, type anything you'll recognize, e.g. `shortybot`
- For `OAuth Redirect URLs`, type in `http://localhost` and hit "Add".
- For `category`, select `Chat Bot`. I don't think this actually matters, but is relevant for our purposes.
- Lastly, `Client Type` should be set to `Confidential`.

Then click `Create`.

After creating an application, you should be redirected to the same page, and see a `Client Id` in addition to the previous fields. If you don't, navigate to your [Twitch Console](https://dev.twitch.tv/console) and find the application you just created and hit `Manage`.

At the bottom you should see your Client Id which will look something like `doewaijfoaerijgale2e13i1j4o3i24532`. **Write this down.**

Then, click `New Secret` right below it to generate a secret. **Write this down as well.**

## Environment Variables

ShortyBot runs off of environment variables of all sorts. You can run the application by passing them in-line, or supplying them to a web-hosting platform like Heroku.

Note: If you are running this locally, you may use a `prod.env` file (targetted by running `yarn start`).

- CLIENT_ID: this is the Client ID value of the Application you just created.
- CLIENT_SECRET: this is the Client Secret value of the Application you just created.
- TWITCH_USER_ID: this is a numeric identifier for the user you want the bot to operate as.
  - Head [here](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/) to find this number!
  - If you want the bot to type as yourself, look up the id of your own Twitch account!
  - i.e. 6789998212
- TWITCH_USER_NAME: this is the channel name that you want the bot to hang out in.
  - i.e. rickstergg (but don't flood my channel with my own bot pls <3)

Once you authorize, ACCESS_TOKEN and REFRESH_TOKEN will be filled out here.

## Authorization

### Authorize your App.

Head over to this [link](https://id.twitch.tv/oauth2/authorize?client_id=YOUR_CLIENT_ID_HERE&scope=channel:bot+channel:moderate+chat:edit+chat:read+channel:manage:predictions+channel:manage:broadcast+user:bot+moderator:manage:banned_users&response_type=code&redirect_uri=http://localhost&force_verify=true), replacing the `YOUR_CLIENT_ID_HERE` with the Client ID you got from your created Application.

You'll now see an authorization page, where you can click `Authorize`. You are authorizing the account you're logged in as to be accessed by your own Application.

### Obtain Access and Refresh Token

After you click `Authorize`, you'll be redirected to a broken page. Fret not, record the `code` parameter in the URL and make a post request to the token endpoint to get your refresh token.

If this is successful, you will get your AccessToken and RefreshToken to put in your `prod.env` file.

## Example prod.env file.

```
CLIENT_ID="dlg2nyeweifj234oawiefwie123tl0"
CLIENT_SECRET="w13944ht5t3jkjnke31je1k34"
TWITCH_USER_ID="6789998212"
TWITCH_USER_NAME="rickstergg"
ACCESS_TOKEN="134563b6kmm4j3khkh4klhk43jgb6j4h536m45"
REFRESH_TOKEN="3145h23454hk365mn4bnm4bm345hk"
```

# Run It Down

Now that you're ready to go, make sure you `yarn install` and then `yarn start`!

# Post Setup

## Adding streamers to the shoutout list.

- Add usernames to the array in `data/streamers.json`. This is the file responsible for providing the list of streamer names (lowercased and such, to shoutout).
- If you run the program and it says this list is empty, chances are you either forgot to include this list, or just haven't added anybody to it. It shouldn't break, but this is noteworthy for sure.
