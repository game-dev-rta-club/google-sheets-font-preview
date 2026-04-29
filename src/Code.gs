var PROJECT_OPTIONS_PROPERTY_KEY = 'GoogleSheetsFontPreview.ProjectOptions';

function cloneJson_(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeHeaderName_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function getDefaultProjectOptions_() {
  return cloneJson_(getFontPreviewConfig_().projectOptions);
}

function getStoredProjectOptions_() {
  var raw = PropertiesService.getDocumentProperties().getProperty(PROJECT_OPTIONS_PROPERTY_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function sanitizeProjectOptions_(rawOptions) {
  var defaults = getDefaultProjectOptions_();
  var raw = rawOptions || {};

  var visibleSections = raw.visibleSections || {};
  var textPreview = raw.textPreview || raw.textDisplay || {};
  var languageSettings = raw.languageSettings || {};
  var fixedStrings = raw.fixedStrings || {};

  return {
    visibleSections: {
      previewCell: visibleSections.previewCell !== false,
      screenshot: visibleSections.screenshot !== false,
      note: visibleSections.note !== false,
      baseLanguage: visibleSections.baseLanguage !== false,
      localization: visibleSections.localization !== false,
    },
    textPreview: {
      defaultWidthUnits: Math.max(
        1,
        Number(textPreview.defaultWidthUnits) || defaults.textPreview.defaultWidthUnits
      ),
      defaultHeightUnits: Math.max(
        1,
        Number(textPreview.defaultHeightUnits) || defaults.textPreview.defaultHeightUnits
      ),
      useSharedPreviewSize: Boolean(
        textPreview.useSharedPreviewSize !== undefined
          ? textPreview.useSharedPreviewSize
          : textPreview.fixedFontSize
      ),
    },
    languageSettings: {
      defaultLanguage: String(languageSettings.defaultLanguage || defaults.languageSettings.defaultLanguage).trim() || defaults.languageSettings.defaultLanguage,
      ignoredColumns: sanitizeIgnoredColumns_(languageSettings.ignoredColumns),
    },
    fixedStrings: {
      screenshot: sanitizeFixedStringValue_(fixedStrings.screenshot, defaults.fixedStrings.screenshot),
      note: sanitizeFixedStringValue_(fixedStrings.note, defaults.fixedStrings.note),
      width: sanitizeFixedStringValue_(fixedStrings.width, defaults.fixedStrings.width),
      height: sanitizeFixedStringValue_(fixedStrings.height, defaults.fixedStrings.height),
    },
  };
}

function sanitizeFixedStringValue_(value, fallback) {
  var normalized = String(value || '').trim();
  return normalized || fallback;
}

function sanitizeIgnoredColumns_(value) {
  var values = Array.isArray(value)
    ? value
    : String(value || '')
        .split(/\r?\n|,/)
        .map(function(entry) { return entry.trim(); });

  var seen = {};
  var sanitized = [];
  values.forEach(function(entry) {
    if (!entry) {
      return;
    }

    var normalized = normalizeHeaderName_(entry);
    if (!normalized || seen[normalized]) {
      return;
    }

    seen[normalized] = true;
    sanitized.push(entry);
  });
  return sanitized;
}

function getResolvedProjectOptions_() {
  var defaults = getDefaultProjectOptions_();
  var stored = getStoredProjectOptions_();
  return sanitizeProjectOptions_(Object.assign({}, defaults, stored));
}

function saveProjectOptions(options) {
  var resolved = sanitizeProjectOptions_(options);
  PropertiesService.getDocumentProperties().setProperty(PROJECT_OPTIONS_PROPERTY_KEY, JSON.stringify(resolved));
  return createClientPreviewConfig_();
}

function getReservedHeaderNames_() {
  var options = getResolvedProjectOptions_();
  return [
    options.fixedStrings.screenshot,
    options.fixedStrings.note,
    options.fixedStrings.width,
    options.fixedStrings.height,
  ];
}

function createClientPreviewConfig_() {
  var config = getFontPreviewConfig_();
  var options = getResolvedProjectOptions_();
  var reservedHeaderNames = getReservedHeaderNames_();
  return {
    screenshotHeaderName: options.fixedStrings.screenshot,
    noteHeaderName: options.fixedStrings.note,
    baseLanguageHeaderName: options.languageSettings.defaultLanguage,
    widthHeaderName: options.fixedStrings.width,
    heightHeaderName: options.fixedStrings.height,
    reservedHeaderNames: reservedHeaderNames,
    projectReservedHeaderNames: reservedHeaderNames,
    userIgnoredColumns: options.languageSettings.ignoredColumns,
    visibleSections: options.visibleSections,
    defaultWidthUnits: options.textPreview.defaultWidthUnits,
    defaultHeightUnits: options.textPreview.defaultHeightUnits,
    useSharedPreviewSize: options.textPreview.useSharedPreviewSize,
    pollIntervalMs: config.timing.pollIntervalMs,
    saveDebounceMs: config.timing.saveDebounceMs,
    cacheRetentionRadius: config.cacheRetentionRadius,
    textFrameBaseWidthUnits: config.textFrame.baseWidthUnits,
    textFrameBaseHeightUnits: config.textFrame.baseHeightUnits,
    textFrameSizePaddingUnits: config.textFrame.sizePaddingUnits,
    projectOptions: options,
  };
}

function onOpen() {
  var config = getFontPreviewConfig_();
  SpreadsheetApp.getUi()
    .createMenu(config.ui.menuName)
    .addItem(config.ui.menuItemName, 'showLocalizationPreviewSidebar')
    .addToUi();
}

function showLocalizationPreviewSidebar() {
  var config = getFontPreviewConfig_();
  var template = HtmlService.createTemplateFromFile('Sidebar');
  template.bootstrapConfigJson = JSON.stringify(createClientPreviewConfig_());
  var html = template.evaluate()
    .setTitle(config.ui.sidebarTitle);
  SpreadsheetApp.getUi().showSidebar(html);
}

function getPreviewState() {
  var serverStartedAt = new Date();
  var state = readActiveRangeState_();

  if (!state) {
    state = {
      ok: false,
      message: 'No active cell.',
      triggerSource: 'directPolling',
      serverSavedAtMs: serverStartedAt.getTime(),
      serverSavedAtIso: serverStartedAt.toISOString(),
    };
  }

  var serverFinishedAt = new Date();
  state.serverStartedAtMs = serverStartedAt.getTime();
  state.serverStartedAtIso = serverStartedAt.toISOString();
  state.serverFinishedAtMs = serverFinishedAt.getTime();
  state.serverFinishedAtIso = serverFinishedAt.toISOString();
  state.serverProcessingMs = serverFinishedAt.getTime() - serverStartedAt.getTime();
  return state;
}

function getActualSelectionState() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    return { ok: false, message: 'No active spreadsheet.' };
  }

  var sheet = spreadsheet.getActiveSheet();
  var range = sheet ? sheet.getActiveRange() : null;
  if (!sheet || !range) {
    return { ok: false, message: 'No active cell.' };
  }

  var row = range.getRow();
  var column = range.getColumn();
  var headerValues = getHeaderValues_(sheet);
  var now = new Date();

  return {
    ok: true,
    spreadsheetName: spreadsheet.getName(),
    sheetName: sheet.getName(),
    a1Notation: buildA1Notation_(row, column),
    row: row,
    column: column,
    selectedHeaderKey: createHeaderKey_(column, headerValues[column - 1] || ''),
    triggerSource: 'actualSelection',
    serverSavedAtMs: now.getTime(),
    serverSavedAtIso: now.toISOString(),
  };
}

function getPreviewStateForPosition(request) {
  if (!request) {
    return { ok: false, message: 'Missing request.' };
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    return { ok: false, message: 'No active spreadsheet.' };
  }

  var sheet = request.sheetName
    ? spreadsheet.getSheetByName(request.sheetName)
    : spreadsheet.getActiveSheet();

  if (!sheet) {
    return { ok: false, message: 'Target sheet not found.' };
  }

  var row = clamp_(Number(request.row) || 1, 1, sheet.getMaxRows());
  var column = clamp_(Number(request.column) || 1, 1, Math.max(sheet.getLastColumn(), 1));
  return createPreviewStateFromCoordinates_(spreadsheet, sheet, row, column, 'internalSelection');
}

function moveSelectionTo(row, column) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    return { ok: false, message: 'No active spreadsheet.' };
  }

  var sheet = spreadsheet.getActiveSheet();
  if (!sheet) {
    return { ok: false, message: 'No active sheet.' };
  }

  var safeRow = clamp_(row, 1, sheet.getMaxRows());
  var safeColumn = clamp_(column, 1, Math.max(sheet.getLastColumn(), 1));
  var range = sheet.getRange(safeRow, safeColumn, 1, 1);
  sheet.setActiveRange(range);
  SpreadsheetApp.flush();

  return createPreviewStateFromCoordinates_(spreadsheet, sheet, safeRow, safeColumn, 'moveSelection');
}

function updateCellText(request) {
  if (!request) {
    return { ok: false, message: 'Missing request.' };
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    return { ok: false, message: 'No active spreadsheet.' };
  }

  var sheet = request.sheetName
    ? spreadsheet.getSheetByName(request.sheetName)
    : spreadsheet.getActiveSheet();

  if (!sheet) {
    return { ok: false, message: 'Target sheet not found.' };
  }

  var row = Number(request.row);
  var column = Number(request.column);
  if (!row || !column) {
    return { ok: false, message: 'Invalid target cell.' };
  }

  var range = sheet.getRange(row, column, 1, 1);
  var actualA1 = range.getA1Notation();
  var expectedA1 = request.a1Notation || '';
  if (expectedA1 && actualA1 !== expectedA1) {
    return {
      ok: false,
      message: 'Edit target changed before update was applied.',
      actualA1: actualA1,
      expectedA1: expectedA1,
    };
  }

  var headerValues = getHeaderValues_(sheet);
  var actualHeaderKey = createHeaderKey_(column, headerValues[column - 1] || '');
  if (request.headerKey && actualHeaderKey !== request.headerKey) {
    return {
      ok: false,
      message: 'Column header changed before update was applied.',
      actualHeaderKey: actualHeaderKey,
      expectedHeaderKey: request.headerKey,
    };
  }

  range.setValue(request.value || '');
  SpreadsheetApp.flush();

  return {
    ok: true,
    row: row,
    column: column,
    a1Notation: actualA1,
    headerKey: actualHeaderKey,
    value: request.value || '',
  };
}

function readActiveRangeState_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    return null;
  }

  var sheet = spreadsheet.getActiveSheet();
  var range = sheet ? sheet.getActiveRange() : null;
  if (!range) {
    return null;
  }

  return createPreviewStateFromCoordinates_(spreadsheet, sheet, range.getRow(), range.getColumn(), 'directPolling');
}

function createPreviewStateFromCoordinates_(spreadsheet, sheet, row, column, triggerSource) {
  var now = new Date();
  var headerValues = getHeaderValues_(sheet);
  var lastColumn = headerValues.length;
  var selectedHeaderKey = createHeaderKey_(column, headerValues[column - 1] || '');
  var radius = getFontPreviewConfig_().rowWindowRadius;
  var rowWindowStart = Math.max(2, row - radius);
  var rowWindowEnd = Math.min(sheet.getMaxRows(), row + radius);
  var rowWindowData = createRowDataBlock_(sheet, rowWindowStart, rowWindowEnd - rowWindowStart + 1, lastColumn);
  var currentRowState = row >= rowWindowStart && row <= rowWindowEnd
    ? createRowStateFromBlockRow_(row, headerValues, rowWindowData, row - rowWindowStart)
    : createSingleRowState_(sheet, row, headerValues, lastColumn);
  var rowWindow = createRowWindowFromBlock_(rowWindowStart, rowWindowEnd, headerValues, rowWindowData);

  return {
    ok: true,
    spreadsheetName: spreadsheet.getName(),
    sheetName: sheet.getName(),
    a1Notation: buildA1Notation_(row, column),
    row: row,
    column: column,
    selectedHeaderKey: selectedHeaderKey,
    triggerSource: triggerSource || 'unknown',
    serverSavedAtMs: now.getTime(),
    serverSavedAtIso: now.toISOString(),
    columns: currentRowState.columns,
    rowWindow: rowWindow,
    config: createClientPreviewConfig_(),
  };
}

function getHeaderValues_(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn <= 0) {
    return [];
  }

  return sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
}

function createRowWindow_(sheet, centerRow, headerValues, radius) {
  var rows = [];
  var minRow = Math.max(2, centerRow - radius);
  var maxRow = Math.min(sheet.getMaxRows(), centerRow + radius);

  for (var row = minRow; row <= maxRow; row++) {
    rows.push(createRowState_(sheet, row, headerValues));
  }

  return rows;
}

function createRowState_(sheet, row, headerValues) {
  var columns = [];

  for (var columnIndex = 1; columnIndex <= headerValues.length; columnIndex++) {
    var headerName = (headerValues[columnIndex - 1] || '').trim();
    if (!headerName) {
      continue;
    }

    var cellRange = sheet.getRange(row, columnIndex);
    var preview = readCellPreview_(cellRange);
    columns.push({
      key: createHeaderKey_(columnIndex, headerName),
      label: headerName,
      columnIndex: columnIndex,
      a1Notation: cellRange.getA1Notation(),
      hasImage: preview.hasImage,
      imageUrl: preview.imageUrl,
      text: preview.text,
      hasText: preview.hasText,
      formula: preview.formula,
    });
  }

  return {
    row: row,
    columns: columns,
  };
}

function createRowDataBlock_(sheet, startRow, rowCount, lastColumn) {
  if (rowCount <= 0 || lastColumn <= 0) {
    return {
      values: [],
      richTextValues: [],
      displayValues: [],
      formulas: [],
    };
  }

  var range = sheet.getRange(startRow, 1, rowCount, lastColumn);
  return {
    values: range.getValues(),
    richTextValues: range.getRichTextValues(),
    displayValues: range.getDisplayValues(),
    formulas: range.getFormulas(),
  };
}

function createSingleRowState_(sheet, row, headerValues, lastColumn) {
  var rowData = createRowDataBlock_(sheet, row, 1, lastColumn);
  return createRowStateFromBlockRow_(row, headerValues, rowData, 0);
}

function createRowWindowFromBlock_(startRow, endRow, headerValues, rowData) {
  var rows = [];
  for (var row = startRow; row <= endRow; row++) {
    rows.push(createRowStateFromBlockRow_(row, headerValues, rowData, row - startRow));
  }
  return rows;
}

function createRowStateFromBlockRow_(row, headerValues, rowData, rowOffset) {
  var columns = [];
  var valuesRow = rowData.values[rowOffset] || [];
  var richTextRow = rowData.richTextValues[rowOffset] || [];
  var displayRow = rowData.displayValues[rowOffset] || [];
  var formulaRow = rowData.formulas[rowOffset] || [];

  for (var columnIndex = 1; columnIndex <= headerValues.length; columnIndex++) {
    var headerName = (headerValues[columnIndex - 1] || '').trim();
    if (!headerName) {
      continue;
    }

    var preview = readCellPreviewValues_(
      valuesRow[columnIndex - 1],
      richTextRow[columnIndex - 1],
      displayRow[columnIndex - 1],
      formulaRow[columnIndex - 1]
    );

    columns.push({
      key: createHeaderKey_(columnIndex, headerName),
      label: headerName,
      columnIndex: columnIndex,
      a1Notation: buildA1Notation_(row, columnIndex),
      hasImage: preview.hasImage,
      imageUrl: preview.imageUrl,
      text: preview.text,
      hasText: preview.hasText,
      formula: preview.formula,
    });
  }

  return {
    row: row,
    columns: columns,
  };
}

function createHeaderKey_(columnIndex, headerName) {
  return String(columnIndex) + ':' + headerName;
}

function readCellPreview_(range) {
  var value = range.getValue();
  var richText = range.getRichTextValue();
  var displayValue = range.getDisplayValue();
  var formula = range.getFormula();

  return readCellPreviewValues_(value, richText, displayValue, formula);
}

function readCellPreviewValues_(value, richText, displayValue, formula) {

  var imageUrl = getImageUrlFromValue_(value);
  if (!imageUrl) {
    imageUrl = getImageUrlFromFormula_(formula);
  }

  var text = richText ? richText.getText() : displayValue;
  text = text || '';

  return {
    hasImage: Boolean(imageUrl),
    imageUrl: imageUrl || '',
    text: text,
    hasText: text.trim() !== '',
    formula: formula || '',
  };
}

function buildA1Notation_(row, column) {
  return columnToA1Letters_(column) + String(row);
}

function columnToA1Letters_(column) {
  var value = Math.max(1, Number(column) || 1);
  var result = '';

  while (value > 0) {
    var remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }

  return result;
}

function getImageUrlFromValue_(value) {
  if (!value || typeof value !== 'object') {
    return '';
  }

  if (value.valueType === SpreadsheetApp.ValueType.IMAGE && typeof value.getContentUrl === 'function') {
    return value.getContentUrl() || '';
  }

  return '';
}

function getImageUrlFromFormula_(formula) {
  if (!formula) {
    return '';
  }

  var match = formula.match(/^\s*=IMAGE\(\s*"([^"]+)"/i);
  return match ? match[1] : '';
}

function clamp_(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
