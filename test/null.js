const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should make empty fields into nulls', (done) => {
    const reader = new csv.Reader();
    let dataSent = false;
    let lineCount = 0;
    reader.on('end', () => {
      assert.ok(dataSent);
      done();
    });
    reader.on('data', (line) => {
      const expected = { 'col 0': null, 'col 1': null, 'col 2': null };
      expected[`col ${lineCount}`] = lineCount.toString();
      lineCount++;
      assert.deepEqual(line, expected);
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/null.csv`).pipe(reader);
  });
});
