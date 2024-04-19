# ShortyBot

## CypherCam, Tmi.JS, and Twurple

This is an improvement upon [CypherCam](https://github.com/rickstergg/CypherCam), which since built on top of [tmi.js](https://github.com/tmijs/tmi.js), lost a lot of its capabilities like `!thanos`, etc since commands like `/timeout` weren't able to be done anymore.

While we wait for [tmi.js-v2](https://github.com/tmijs/tmi.js-v2) to be fleshed out fully, we're gonna start with ShortyBot as an application that uses [Twurple](https://twurple.js.org/) instead. If we really like Twurple we'll just stick with it.

It would be real nice to use TypeScript so I might include a tsconfig soon since Twurple is written in ts, would be great to just lean into that.

## Used Scopes

I should list these here first because it's important that you know what ShortyBot can do / not do.

Scopes (disclaimer, I'm just summarizing stuff, best to look at actual Twitch scopes to confirm what I'm saying here LOL):

- user:bot (allows the bot to send messages that look like you sent them)
- chat:edit (to send messages)
- chat:read (to actually see messages from chat)
- channel:bot (to actively join a channel as a bot)
- channel:moderate (to be a moderator / delete messages / anti-spam capabilities)
- channel:manage:predictions (for easy predictions)
- channel:manage:broadcast (for stream markers and clips)
- moderator:manage:banned_users (for thanos, and banning bots)

## Setup

### To be you, or not to be you?

Do you want ShortyBot to act as you on Twitch, or a Bot as a mod on your channel?

Before you authorize, make sure you're logged into the account that you want the bot to act as.

### Authorization

We are using the Code Authorization flow here, where you log into Twitch and authorize the application to make calls related to your account / channel.

1. Log in as the user you want ShortyBot to operate as.

- This could be another bot who is modded on your channel, or your own twitch account. I recommend the latter, as we have not tested the former use case just yet.

It may be best to have Rick or Faded help you with the next two steps. We're going to generate some tokens that the application can use.

2. Head over to this [link](https://id.twitch.tv/oauth2/authorize?client_id=dlg2nyeix9wx5279mq3i6saxxnstl0&scope=channel:bot+channel:moderate+chat:edit+chat:read+channel:manage:predictions+channel:manage:broadcast+channel:manage:moderators+user:bot&response_type=code&redirect_uri=http://localhost&force_verify=true) and click `Authorize`.
3. Save the `code` parameter that you see in the URL and make a POST to `https://id.twitch.tv/oauth2/token`.

### Configure the Application

We will give you a series of tokens to save to your machine, in a file called: `tokens.{twitchId}.json` in the root directory. Where `twitchId`` should be replaced with the numeric identifier of your Twitch name.
e.g. `1234567`instead of`rickstergg`.

If you are unsure of what it is, head [here](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/) and find out!

Ensure that the keys you provide in the .json file are camel case instead of snake case. That is, `camelCase` instead of `snake_case`.

## Run It Down

Now that you're ready to go, make sure you `yarn install` and then `yarn start`.

# Adding streamers to the shoutout list.

- Rename `data/streamers.example.json` to `data/streamers.json`. This is the file responsible for providing the list of streamer names (lowercased and such, to shoutout).
- If you run the program and it says this list is empty, chances are you either forgot to include this list, or just haven't added anybody to it. It shouldn't break, but this is noteworthy for sure.
