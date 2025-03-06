# Whimsy
Whimsy is a peer-to-peer chatting app with a simple terminal-based chat app made in NodeJS.

It is a hobby project and is completely open source, it contains commented and readable code for learning purpose.

## W.I.P
Whimsy is currently Work In Progress, I am working hard on it. If you want to contribute, read [**CONTRIBUTING.md**](/CONTRIBUTING.md).

# Setup
Install the dependencies with `npm install`.

# Usage
Run `npm start`
> NOTE: In the future, binaries will be released so users don't need to setup and run manually.

# More information
## Why use Whimsy?
Whimsy isn't designed to be an alternative to already-existing chat apps, such as Discord or Slack. **BUT**, if you want to use Whimsy, it is secure and open-source, completely free and no login data or any confindential data is needed, thus making it a safe alternative for
secure chatting compared to other apps, like the afromentioned Discord.
| Feature | Discord | Whimsy |
| --------------- | --------------- | --------------- |
| message storing | yes | no |
| data collection (telemetry) | yes | no |
| encrypted chats | yes | planned |
| voice calls | yes | no |
| peer-to-peer | no | yes |
| account | yes | no |

**Notes:**
- What account refers to is having a database with login data, having the user login and letting them logout, etc.
- Whimsy isn't made for a replacement to usual chat apps, so accounts are not actually planned. Also, a database would be needed, alongside authentication, two things that I don't know how to manage and can't pay. The nearest things to accounts is having a unique username.
- What profile refers to is having a username, bio, etc.

## How does it work?
When using Whimsy, you can either join or host a chat room. Whimsy uses a local tunnel + websocket system to open a local server in the host's machine and allow for other people to join.

When the host of a chat room leaves, the tunnel is transferred to the next user (the user that connected before all other connected users).
