var PREVIEW_STATE_KEY = 'LOCALIZATION_PREVIEW_SELECTED_CELL';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Localization Preview')
    .addItem('Open Sidebar', 'showLocalizationPreviewSidebar')
    .addToUi();

  updatePreviewStateFromActiveRange();
}

function onSelectionChange(e) {
  if (!e || !e.range) {
    return;
  }

  savePreviewState_(createPreviewStateFromRange_(e.range));
}

function showLocalizationPreviewSidebar() {
  updatePreviewStateFromActiveRange();

  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Localization Preview');
  SpreadsheetApp.getUi().showSidebar(html);
}

function getPreviewState() {
  var value = PropertiesService.getDocumentProperties().getProperty(PREVIEW_STATE_KEY);

  if (!value) {
    var state = updatePreviewStateFromActiveRange();
    return state || {
      ok: false,
      message: 'No active cell.',
    };
  }

  return JSON.parse(value);
}

function updatePreviewStateFromActiveRange() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();
  var range = sheet.getActiveRange();

  if (!range) {
    var emptyState = {
      ok: false,
      message: 'No active cell.',
    };
    savePreviewState_(emptyState);
    return emptyState;
  }

  var state = createPreviewStateFromRange_(range);
  savePreviewState_(state);
  return state;
}

function createPreviewStateFromRange_(range) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = range.getSheet();
  var cell = range.getCell(1, 1);
  var richText = cell.getRichTextValue();
  var text = richText ? richText.getText() : cell.getDisplayValue();

  return {
    ok: true,
    spreadsheetName: spreadsheet.getName(),
    sheetName: sheet.getName(),
    a1Notation: cell.getA1Notation(),
    row: cell.getRow(),
    column: cell.getColumn(),
    text: text || '',
  };
}

function savePreviewState_(state) {
  PropertiesService.getDocumentProperties().setProperty(
    PREVIEW_STATE_KEY,
    JSON.stringify(state)
  );
}
