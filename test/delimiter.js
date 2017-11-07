const fs = require('fs');
const CSVStream = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support custom delimiter', (done) => {
    const csv = new CSVStream({ headers: true, delimiter: '\t' });
    let headersSent = false;
    let dataSent = false;
    csv.on('end', () => {
      assert.ok(headersSent);
      assert.ok(dataSent);
      done();
    });
    csv.on('headers', (headers) => {
      assert.deepEqual(headers, ['col1', 'col2', 'col3', 'col4']);
      headersSent = true;
    });
    csv.on('data', (line) => {
      assert.deepEqual(line, { col1: 1, col2: 2, col3: 3, col4: 4 });
      assert.ok(!dataSent);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/delimiter.tsv`).pipe(csv);
  });
});
