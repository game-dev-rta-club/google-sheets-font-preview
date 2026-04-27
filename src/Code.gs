function getReservedHeaderNames_() {
  var config = getFontPreviewConfig_();
  return [
    config.headers.image,
    config.headers.baseLanguage,
    config.headers.width,
    config.headers.height,
  ];
}

function createClientPreviewConfig_() {
  var config = getFontPreviewConfig_();
  return {
    imageHeaderName: config.headers.image,
    baseLanguageHeaderName: config.headers.baseLanguage,
    widthHeaderName: config.headers.width,
    heightHeaderName: config.headers.height,
    reservedHeaderNames: getReservedHeaderNames_(),
    pollIntervalMs: config.timing.pollIntervalMs,
    saveDebounceMs: config.timing.saveDebounceMs,
    textFrameBaseWidthUnits: config.textFrame.baseWidthUnits,
    textFrameBaseHeightUnits: config.textFrame.baseHeightUnits,
    textFrameSizePaddingUnits: config.textFrame.sizePaddingUnits,
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
  var cell = sheet.getRange(row, column, 1, 1);
  var now = new Date();
  var headerValues = getHeaderValues_(sheet);
  var currentRowState = createRowState_(sheet, row, headerValues);
  var selectedHeaderKey = createHeaderKey_(column, headerValues[column - 1] || '');
  var rowWindow = createRowWindow_(sheet, row, headerValues, getFontPreviewConfig_().rowWindowRadius);

  return {
    ok: true,
    spreadsheetName: spreadsheet.getName(),
    sheetName: sheet.getName(),
    a1Notation: cell.getA1Notation(),
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

function createHeaderKey_(columnIndex, headerName) {
  return String(columnIndex) + ':' + headerName;
}

function readCellPreview_(range) {
  var value = range.getValue();
  var richText = range.getRichTextValue();
  var displayValue = range.getDisplayValue();
  var formula = range.getFormula();

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
