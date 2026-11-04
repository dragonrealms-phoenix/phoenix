# Glossary Map

Phoenix is a desktop client for DragonRealms, a text-based multiplayer game by Simutronics.
A Player logs in, reads streams of game text, and sends commands back.

## Areas

- [Connection](./connection.md): how a Player's Account and Character become a live connection to the game server, and the other front ends (Wrayth, Saga, Genie) and Lich
- [Game](./game.md): what the game server sends during play and what it means
- [Settings](./settings.md): rules and preferences the Player configures
- [Layout](./layout.md): where streams appear on screen

## Relationships

- **Connection → Game**: Connection ends with an access token accepted by the game server; everything after that is Game.
- **Connection → Settings**: Playing a Character loads the `default` profile plus that Character's own profile.
- **Game → Settings**: Every line of game text passes through the Player's triggers, ignores, substitutes and highlights before it is shown.
- **Game → Layout**: Each stream is shown in the stream window the layout gives it, or redirected when that window is hidden.
