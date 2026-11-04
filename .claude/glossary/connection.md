# Connection

How a Player gets from an Account to a live connection with the game server.

## Language

### Login

**Player**:
The person using Phoenix to play.
_Avoid_: user (in domain discussion), customer

**Account**:
A play.net account, identified by a username and password, that owns one or more Characters.
_Avoid_: login, credentials, profile

**Character**:
A persona on an Account, in one DragonRealms instance, that the Player plays.
_Avoid_: avatar, toon

**Game Code**:
The code for the DragonRealms instance a Character lives in: DR (Prime), DRX (Platinum), DRF (Fallen), DRT (Test) or DRD (Development).
_Avoid_: game, instance

**SGE**:
Simutronics Game Entry, the login service that checks an Account and issues an access token for one of its Characters.
_Avoid_: eaccess, auth server

**Access Token**:
The one-time token SGE issues to play one Character, used like a session token when connecting to the game server.
_Avoid_: game key, key, credentials

**Game Server**:
The host and port SGE returns with the access token, where play happens.
_Avoid_: game host

**StormFront Protocol**:
The XML game protocol first built for Simutronics' StormFront front end, now called Wrayth, which Phoenix speaks.
SGE calls it `STORM`.
_Avoid_: Storm, Wrayth protocol

### Front Ends

**Front End**:
A program a Player uses to play DragonRealms, such as Phoenix, Wrayth, Saga or Genie.
It names itself to the game server when it connects; Phoenix sends `/FE:PHOENIX`.
_Avoid_: client (in domain discussion)

**Wrayth**:
Simutronics' official front end for Windows, named StormFront until about 2023.
_Avoid_: StormFront, Storm (for the front end)

**Saga**:
Simutronics' newer official front end for Windows, macOS and Linux, in open beta, which runs Wrayth scripts.

**Genie**:
A third-party, open-source front end whose settings files Phoenix reads, so Players can bring their settings over and keep editing them by hand.
Genie 4 is Windows-only; Genie 5 is a cross-platform rewrite, in beta, that imports Genie 4 settings.

**Lich**:
An optional, separately installed Ruby program that sits between a front end and the game server so the Player can run Lich scripts.
Phoenix starts it with `--genie`, so Lich treats Phoenix as Genie.
