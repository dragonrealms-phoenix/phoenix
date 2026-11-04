# Settings

Rules and preferences the Player configures to change how game text is handled and shown.

## Language

### Settings

**Setting**:
A rule the Player writes in Genie's text format, such as a trigger or a highlight, stored in a profile.
Genie is defined in the Connection glossary.
_Avoid_: config, option

**Profile**:
A named set of settings.
Playing a Character loads two: `default`, shared by every Character, and one for that Character on its game code.
_Avoid_: global settings, character settings

**Class**:
A named on/off switch that groups settings.
A setting with a class applies only while that class is on; a setting with no class always applies.
_Avoid_: group, category

**Trigger**:
A setting that runs actions when game text matches its pattern, such as sending a command, beeping, flashing, or turning a class on or off.

**Ignore**:
A setting that hides game text matching its pattern.
_Avoid_: gag, squelch

**Substitute**:
A setting that replaces matching game text before it is shown.
_Avoid_: sub, replace

**Highlight**:
A setting that colors game text matching its text, as an exact match, contains, starts with, or regex.

### Preferences

**Preference**:
An app-wide option that does not depend on the profile, such as zoom, the prompt character, or where Lich is installed.
_Avoid_: setting
