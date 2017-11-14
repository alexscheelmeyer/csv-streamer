const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should read simple files', (done) => {
    const reader = new csv.Reader({ headers: false });
    let dataSent = false;
    reader.on('end', () => {
      assert.ok(dataSent);
      done();
    });
    reader.on('data', (line) => {
      assert.deepEqual(line, [1, 2, 3, 4]);
      assert.ok(!dataSent);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/simple.csv`).pipe(reader);
  });
});
