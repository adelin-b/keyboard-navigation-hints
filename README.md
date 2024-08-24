# Keyboard navigation hints (Beta)

This extension adds keyboard navigation hints to VSCode.

## Requirements

:warning: You absolutely need to have the [APC](https://github.com/drcika/apc-extension) extension installed to use this extension. You can use others custom scripts loader, but this one is the most advanced.

And also you need to have VSCode Vim installed

## Features

Keyboard navigation hints

To enable the feature:

1. Make sure you have the [APC](https://github.com/drcika/apc-extension) extension installed.
2. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P on Mac).
3. Type "Enable Keyboard Navigation Hints" and select the command.
4. Reload VSCode.

Now you can use <kbd>Ctrl</kbd>+<kbd>Space</kbd> to toggle the hints. :warning: This short cut is not configurable. It will be in the future. It wont work from inside input or when in EDIT mode.

The keyboard navigation hints will be active after reloading.

## Known Issues

This is a first release, a few things are not working yet and PR are welcomes.

- Cannot open the dropdowns "..." on top right.
- Cannot open a tab in the tab bar.
- Cannot open detected links.
- Cannot configure the shortcut or style

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of keyboard navigation hints.
