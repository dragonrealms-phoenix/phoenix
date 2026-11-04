# Settings use Genie's text format

Player settings (classes, triggers, ignores, substitutes, highlights) are stored as Genie-format `.cfg` files per profile, not as Phoenix's own JSON.
Most DragonRealms players come from Genie, so they can copy their existing files in unchanged.
Players also edit these files by hand in a text editor, which is why Phoenix reloads them whenever they change on disk.

## Consequences

- Don't replace the format without also shipping an importer for Genie files.
