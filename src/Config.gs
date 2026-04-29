var FONT_PREVIEW_CONFIG = {
  ui: {
    menuName: 'Localization',
    menuItemName: 'Font Preview',
    sidebarTitle: 'Localization Preview',
  },
  rowWindowRadius: 5,
  projectOptions: {
    visibleSections: {
      previewCell: true,
      screenshot: true,
      note: true,
      baseLanguage: true,
      localization: true,
    },
    textPreview: {
      sharedPreviewSizePx: 20,
      useSharedPreviewSize: false,
    },
    languageSettings: {
      defaultLanguage: 'en',
      ignoredColumns: [],
    },
    fixedStrings: {
      screenshot: 'screenshot',
      note: 'note',
      width: 'width',
      height: 'height',
    },
  },
  timing: {
    pollIntervalMs: 200,
    saveDebounceMs: 350,
  },
  textFrame: {
    baseWidthUnits: 20,
    baseHeightUnits: 4,
    sizePaddingUnits: 0.25,
  },
};

function getFontPreviewConfig_() {
  return FONT_PREVIEW_CONFIG;
}
