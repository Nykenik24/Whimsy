# Whimsy

Whimsy is going through a rework in **Go**. Why? Because it was **TRASH**.

Not only the code was inconsitent, but also very messy, DRY wasn't applied, there were some dumb bugs, etc.

That's why Whimsy is being rewritten in Go, and some things are also changing.

## The new (expected) Whimsy

_Note that everything here is conceptual, a goal, not a promise. This is what I want, not what you will 100% get._

Now, instead of trusting LocalTunnel, you just open the server to the port you want and handle it's public avaliablity (can even open it to LocalTunnel).

Also, the backend is being reworked, and as now it's being made into a user-hosted centralized app, more features, including QoL changes, security improvments, etc.

Things like:

- Accounts (per-server, tho could make shared accounts client-side).
- Attachments, such as photos, videos, voice messages, etc. Maximum file size can be configured, with default being probably something between 100MB and 125MB.
- Banning, either through simple ID banning, or IP banning.
- Cool commands (old version had only a command to get pretty JSON of the server's raw info).
- And more!

Also, the client is probably getting an UI, tho it will first be also a terminal client.
