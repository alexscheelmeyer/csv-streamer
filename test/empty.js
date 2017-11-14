const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support empty lines', (done) => {
    const reader = new csv.Reader();
    let headersSent = false;
    let dataSent = false;
    reader.on('end', () => {
      assert.ok(headersSent);
      assert.ok(dataSent);
      done();
    });
    reader.on('headers', (headers) => {
      assert.deepEqual(headers, ['col1', 'col2', 'col3', 'col4']);
      assert.ok(!headersSent);
      headersSent = true;
    });
    reader.on('data', (line) => {
      assert.deepEqual(line, { col1: '', col2: '', col3: 3, col4: '' });
      assert.ok(!dataSent);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/empty.csv`).pipe(reader);
  });
});
