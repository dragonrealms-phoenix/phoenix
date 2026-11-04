# Layout

Where game text appears on screen.

## Language

**App Window**:
Phoenix's desktop window.
_Avoid_: window (alone), main window

**Stream Window**:
A pane inside the app window that shows one stream.
_Avoid_: window (alone), grid item, item, panel

**Main Stream Window**:
The stream window for the `main` stream, where text with no other home appears.
_Avoid_: game window

**Layout**:
A saved, named arrangement of the app window and its stream windows: position, size, font, colors and visibility.
_Avoid_: workspace

**Redirect**:
Sending a hidden stream window's text to another stream window the layout names, following the chain until one is visible.
_Avoid_: forward
