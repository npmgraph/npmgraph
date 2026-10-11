"icons.svg" holds the artwork for the various icons defined in
components/ui/Icons.tsx (as files in images/icons). It is an Inkscape document that contains a layer per
icon. Within that document (i.e. in Inkscape), we expect each icon to be a
single path.

- Icons should fit w/in the 16x16px dimensions of the document
- For now, we're leaving ~1/2px padding around the path of the icon (to allow for 1-px stroke)

To update an icon:

- select the icon path
- Open the Edit -> XML Editor
- Select the `d` property
- Note: The XML tool has a nice little utility for rounding path coordinates to vaarious precisions. This is helpful in cleaning up the path string
- Copy/paste the path string, removing all newlines, into the `d` attribute of the file in `images/icons`

To add an icon, create a new file in `images/icons` (see the others for the attributes to set on the path), and add a component for it in `components/ui/Icons.tsx`.
