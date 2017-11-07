const fs = require('fs');
const CSVStream = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support empty quoted strings', (done) => {
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
      assert.deepEqual(line, { col1: '', col2: '', col3: 3, col4: '' });
      assert.ok(!dataSent);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/emptystring.csv`).pipe(csv);
  });
});
