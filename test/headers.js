const fs = require('fs');
const CSVStream = require('../csv-stream');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support headers', (done) => {
    const csv = new CSVStream({ headers: true });
    let headersSent = false;
    let dataSent = false;
    csv.on('end', () => {
      assert.ok(headersSent);
      assert.ok(dataSent);
      done();
    });
    csv.on('headers', (headers) => {
      assert.deepEqual(headers, ['col1', 'col2', 'col3', 'col4']);
      assert.ok(!headersSent);
      headersSent = true;
    });
    csv.on('data', (line) => {
      assert.deepEqual(line, { col1: 1, col2: 2, col3: 3, col4: 4 });
      assert.ok(!dataSent);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/headers.csv`).pipe(csv);
  });
});
