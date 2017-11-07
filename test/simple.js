const fs = require('fs');
const CSVStream = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should read simple files', (done) => {
    const csv = new CSVStream();
    let dataSent = false;
    csv.on('end', () => {
      assert.ok(dataSent);
      done();
    });
    csv.on('data', (line) => {
      assert.deepEqual(line, [1, 2, 3, 4]);
      assert.ok(!dataSent);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/simple.csv`).pipe(csv);
  });
});
