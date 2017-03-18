const fs = require('fs');
const CSVStream = require('../csv-stream');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support quoted strings', (done) => {
    const csv = new CSVStream();
    let dataSent = false;
    csv.on('end', () => {
      assert.ok(dataSent);
      done();
    });
    csv.on('data', (line) => {
      assert.deepEqual(line, ['hello world', 'hello, world', 'hello\nworld']);
      assert.ok(!dataSent);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/quoted.csv`).pipe(csv);
  });
});
