"icons.svg" holds the artwork for the various icons defined in
components/Icons.tsx. It is an Inkscape document that contains a layer per
icon. Within that document (i.e. in Inkscape), we expect each icon to be a
single path.

- Icons should fit w/in the 16x16px dimensions of the document
- For now, we're leaving ~1/2px padding around the path of the icon (to allow for 1-px stroke)

To get the path string for an icon:

- select the icon path
- Open the Edit -> XML Editor
- Select the `d` property
- Note: The XML tool has a nice little utility for rounding path coordinates to vaarious precisions. This is helpful in cleaning up the path string
- Copy/paste the path string, removing all newlines.
