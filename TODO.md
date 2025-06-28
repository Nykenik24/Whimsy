## Phase 1: Wrappers, thin abstractions

- [ ] WebSockets
  - [ ] Server
    - [x] Make small, simple wrapper for `gorilla/websocket`
    - [ ] Implement main events
  - [ ] Client
    - [x] Make small, simple client abstraction
    - [ ] Implement main events
- [ ] REST
  - [x] Make very simple helper functions
  - [ ] Implement parameters in routes (e.g. `/users/{id}`, where `id` is the parameter)
  - [ ] Implement main routes
    - [ ] `/users`: get all users
      - [ ] `/users/{id}`: get user with ID `{id}`.
      - [ ] `/users/connected`: get all connected users.
      - [ ] `/users/disconnected`: get all disconnected users.
    - [ ] `/channels`: get all channels
      - [ ] `/channels/{id}`: get channel with ID `{id}`.
      - [ ] `/channels/{id}/messages`: get messages of channel with ID `{id}`.
    - [ ] `/admin`: admin "panel" (needs bearer token in the Authorization header).

## Phase 2: Server models and services

- [ ] Models
  - [ ] User model
  - [ ] Channel model
    > Channel here being a room inside the server with it's own independent message history, properties, etc.
  - [ ] Token model
    > Refers to both the access tokens, which the corresponding service converts into a Token structure, and to token generators, which make tokens.
  - [ ] Hash model
    > Refers to only hash generators, as there is no need to fragment a hash into a structure, as the only information extracted is the hash, opposite to tokens, which have scopes, the HMAC key, and the token itself.
    > Hashed data is slow hashed and salted to avoid rainbow tables and brute forcing.
  - [ ] ID model
    > Simple ID abstraction including ID generators.
- [ ] Services
  - [ ] ID service
    > Generates IDs.
  - [ ] User service
    > Handles user's ID, hashes user's credentials, handles the highest-level information (=username, bio, etc.), etc.
  - [ ] Channel service
    > Handles channel's ID, client-to-server and server-to-client routing of all messages sent to the channel, etc.
  - [ ] Token service
    > Handles token generation, signing and scoping (read/write, read-only, write-only).
  - [ ] Hash service
    > Uses slow hashing + salting to hash data.
  - [ ] Auth service
    - [ ] Validate tokens
    - [ ] Validate hashes
    - [ ] Attach context to request/socket
  - [ ] Configuration service
    - [ ] Use `whimsy.yaml` configuration file
    - [ ] Access configuration through REST API
    - [ ] Modify configuration through REST API (using token)
