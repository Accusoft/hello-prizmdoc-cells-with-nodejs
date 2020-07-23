const express = require('express');
const router = express.Router();
const joinPath = require('path').join;
const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
const cellsServer = require('../cellsServer/cellsServerRequest');

router.get('/', async (req, res /*, next*/) => {
  let cellsServerResponse;

  const filename = 'World Sales & Opps Sheet.xlsx';

  // 1. Upload the workbook (XLSX file). This only needs to be done once.
  cellsServerResponse = await cellsServer.post('/api/v1/workbooks', {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename
    },
    body: await(readFileFromDocumentsDirectory(filename))
  });

  const body = JSON.parse(cellsServerResponse.body);

  // 2. Create a session for an end user to view the workbook.
  cellsServerResponse = await cellsServer.post('/api/v1/sessions', {
    json: {
      workbookId: body.workbookId,
      user: {
        displayName: 'Test User',
        initials: 'TU'
      }
    }
  });

  // 3. Render the page HTML, initializing the Workbook Control with the sessionId.
  res.render('index', {
    sessionId: cellsServerResponse.body.sessionId
  });
});

// Util function to read a document from the documents/ directory
async function readFileFromDocumentsDirectory(filename) {
  return readFile(joinPath(__dirname, '..', 'documents', filename));
}

module.exports = router;
