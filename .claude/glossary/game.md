# Game

What the game server sends during play and what the Player sends back.

## Language

### Text

**Game Text**:
Text the game server sends for the Player to read, marked up with StormFront protocol tags.

**Command**:
A line the Player, or a trigger, sends to the game server.
_Avoid_: input, action

**Stream**:
A named channel of game text, such as `main`, `room`, `thoughts`, `combat` or `experience`.
Text that names no stream belongs to `main`.
_Avoid_: window, feed, channel

**Prompt**:
The marker the game server sends when it is ready for the next command.

**Text Style Preset**:
A named style the game server asks for, such as room name, room description, speech, whisper or thought.
_Avoid_: preset

**Output Class**:
A text format the game server asks for, such as monospace.
Not related to a setting class.

### Character Status

**Room**:
Where the Character is: its name, description, objects, other players and exits.

**Compass**:
The exits the Character can take from the current room.

**Vitals**:
The Character's health, mana, spirit, stamina and concentration, each as a percentage.

**Indicator**:
A yes/no condition of the Character, such as kneeling, hidden, stunned or bleeding.

**Hands**:
What the Character holds in its left and right hands, plus the spell it is preparing.

**Server Time**:
The game server's clock, sent with each prompt.
Round Time and Cast Time are deadlines on this clock.

**Round Time**:
How long the Character must wait after an action before it can act again.
_Avoid_: roundtime, RT (in prose)

**Cast Time**:
How long until the spell the Character is preparing can be cast.
_Avoid_: casttime, CT (in prose)

**Aim Time**:
How long after the `AIM` command until the Character's ranged weapon has its best shot.
The game added an aim timer window in June 2026; Phoenix doesn't parse it yet.
_Avoid_: aimtime, AT (in prose)

### Experience

**Skill**:
A trainable ability of the Character, such as Attunement or First Aid, with a rank.

**Rank**:
A skill's whole-number level, shown with the percent toward the next rank, from 0 to 99.
Ranks cap at 1750.

**Field Experience**:
Learning a skill has gained from practice but not yet turned into ranks.
Each skill holds it in a pool that fills from "clear" to "mind lock"; Mind State and Learning Rate say how full it is.
_Avoid_: exp, pool (alone)

**Mind State**:
The text label for how much field experience a skill holds, from "clear" to "mind lock".
It is the same value as Learning Rate, shown as words.
_Avoid_: mindstate

**Learning Rate**:
The number from 0 to 34 for how much field experience a skill holds.
It is the same value as Mind State, shown as a number.
_Avoid_: mind state rate
