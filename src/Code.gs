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

function getReservedHeaderNamesFromOptions_(options) {
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
  var reservedHeaderNames = getReservedHeaderNamesFromOptions_(options);
  return {
    githubUrl: config.ui.githubUrl,
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

function createSampleSheet() {
  var options = getResolvedProjectOptions_();
  var fixedStrings = options.fixedStrings || {};
  var defaultLanguage = String((options.languageSettings || {}).defaultLanguage || 'en').trim() || 'en';
  var languageHeaders = buildSampleLanguageHeaders_(defaultLanguage);
  var spreadsheet = SpreadsheetApp.create('Google Sheets Font Preview Sample');
  var sheet = spreadsheet.getSheets()[0];
  sheet.setName('Sample');

  var headers = [
    fixedStrings.screenshot,
    fixedStrings.note,
    fixedStrings.width,
    fixedStrings.height,
  ].concat(languageHeaders);

  var rows = buildSampleSheetRows_(languageHeaders);
  sheet.getRange(1, 1, rows.length + 1, headers.length).setValues([headers].concat(rows));
  sheet.setFrozenRows(1);
  formatSampleSheet_(sheet, headers.length, rows.length + 1);

  var defaultLanguageColumnIndex = headers.indexOf(defaultLanguage) + 1;
  if (defaultLanguageColumnIndex > 0) {
    sheet.setActiveRange(sheet.getRange(2, defaultLanguageColumnIndex));
  }

  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    sheetId: sheet.getSheetId(),
    url: spreadsheet.getUrl() + '#gid=' + sheet.getSheetId(),
  };
}

function buildSampleLanguageHeaders_(defaultLanguage) {
  var candidates = [
    defaultLanguage,
    'en',
    'ja',
    'zh',
    'ko',
    'fr',
  ];
  var seen = {};
  var headers = [];

  candidates.forEach(function(candidate) {
    var value = String(candidate || '').trim();
    if (!value) {
      return;
    }

    var normalized = normalizeHeaderName_(value);
    if (!normalized || seen[normalized]) {
      return;
    }

    seen[normalized] = true;
    headers.push(value);
  });

  return headers.slice(0, 5);
}

function buildSampleSheetRows_(languageHeaders) {
  var imageUrls = [
    buildCommonsImageUrl_('Creative Commons.jpg'),
    buildCommonsImageUrl_('CC0.jpg'),
    buildCommonsImageUrl_('Capoeiragem (colorized).jpg'),
  ];

  var entries = [
    {
      screenshotUrl: imageUrls[0],
      note: 'Short button label. Use this row to test compact UI copy.',
      width: 4,
      height: 1,
      texts: {
        en: 'Play',
        ja: 'プレイ',
        zh: '开始',
        ko: '플레이',
        fr: 'Jouer',
      },
    },
    {
      screenshotUrl: imageUrls[1],
      note: 'A short menu item with a little more width.',
      width: 8,
      height: 1,
      texts: {
        en: 'Save Game',
        ja: 'セーブ',
        zh: '保存游戏',
        ko: '게임 저장',
        fr: 'Sauvegarder',
      },
    },
    {
      screenshotUrl: imageUrls[2],
      note: 'A single-line label that still needs room for wider translations.',
      width: 10,
      height: 1,
      texts: {
        en: 'Inventory',
        ja: 'インベントリ',
        zh: '物品栏',
        ko: '인벤토리',
        fr: 'Inventaire',
      },
    },
    {
      screenshotUrl: imageUrls[0],
      note: 'A confirmation message with two lines of preview height.',
      width: 18,
      height: 2,
      texts: {
        en: 'Are you sure you want to delete this save file?',
        ja: 'このセーブデータを削除しますか？',
        zh: '确定要删除这个存档吗？',
        ko: '이 저장 데이터를 삭제하시겠습니까?',
        fr: 'Voulez-vous vraiment supprimer cette sauvegarde ?',
      },
    },
    {
      screenshotUrl: imageUrls[1],
      note: 'A tooltip-style sentence that uses more vertical space.',
      width: 16,
      height: 3,
      texts: {
        en: 'This item can only be used during the night event.',
        ja: 'このアイテムは夜のイベント中にのみ使用できます。',
        zh: '该物品只能在夜间事件期间使用。',
        ko: '이 아이템은 야간 이벤트 중에만 사용할 수 있습니다.',
        fr: 'Cet objet ne peut être utilisé que pendant l’événement de nuit.',
      },
    },
    {
      screenshotUrl: imageUrls[2],
      note: 'A longer helper sentence to show four-line previews.',
      width: 15,
      height: 4,
      texts: {
        en: 'Tap and hold to open the advanced settings panel.',
        ja: '長押しすると詳細設定パネルを開きます。',
        zh: '长按即可打开高级设置面板。',
        ko: '길게 눌러 고급 설정 패널을 엽니다.',
        fr: 'Appuyez longuement pour ouvrir le panneau des paramètres avancés.',
      },
    },
  ];

  return entries.map(function(entry) {
    var row = [
      '=IMAGE("' + entry.screenshotUrl + '")',
      entry.note,
      entry.width,
      entry.height,
    ];

    languageHeaders.forEach(function(languageHeader) {
      var normalized = normalizeHeaderName_(languageHeader);
      row.push(entry.texts[normalized] || entry.texts.en || '');
    });

    return row;
  });
}

function buildCommonsImageUrl_(fileName) {
  return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(fileName);
}

function formatSampleSheet_(sheet, totalColumns, totalRows) {
  sheet.getRange(1, 1, 1, totalColumns)
    .setFontWeight('bold')
    .setBackground('#efe8d5');

  sheet.getRange(2, 1, Math.max(totalRows - 1, 1), totalColumns)
    .setVerticalAlignment('middle')
    .setWrap(true);

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 72);
  sheet.setColumnWidth(4, 72);

  for (var column = 5; column <= totalColumns; column += 1) {
    sheet.setColumnWidth(column, 180);
  }

  for (var row = 2; row <= totalRows; row += 1) {
    sheet.setRowHeight(row, 124);
  }
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
