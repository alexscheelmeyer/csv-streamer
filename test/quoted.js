const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support quoted strings', (done) => {
    const reader = new csv.Reader({ headers: false });
    let dataSent = false;
    reader.on('end', () => {
      assert.ok(dataSent);
      done();
    });
    reader.on('data', (line) => {
      assert.deepEqual(line, ['hello world', 'hello, world', 'hello\nworld']);
      assert.ok(!dataSent);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/quoted.csv`).pipe(reader);
  });
});
