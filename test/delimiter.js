const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support custom delimiter', (done) => {
    const reader = new csv.Reader({ delimiter: '\t' });
    let headersSent = false;
    let dataSent = false;
    let lineNum = 0;
    reader.on('end', () => {
      assert.ok(headersSent);
      assert.ok(dataSent);
      done();
    });
    reader.on('headers', (headers) => {
      assert.deepEqual(headers, ['col1', 'col2', 'col3', 'col4']);
      headersSent = true;
    });
    reader.on('data', (line) => {
      switch(lineNum) {
        case 0:
          assert.deepEqual(line, { col1: 1, col2: 2, col3: 3, col4: 4 });
          assert.ok(!dataSent);
          break;
        case 1:
          assert.deepEqual(line, { col1: 1, col2: null, col3: 3, col4: null });
          break;
        default:
          assert.ok(false);
      }
      dataSent = true;
      lineNum++;
    });
    fs.createReadStream(`${__dirname}/delimiter.tsv`).pipe(reader);
  });
});
