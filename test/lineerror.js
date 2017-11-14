const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should report linenumber for error in line', (done) => {
    const reader = new csv.Reader();
    reader.on('end', done);
    reader.on('data', () => {});
    reader.on('error', (error) => {
      assert(error.indexOf('line 3') > 0);
    });
    fs.createReadStream(`${__dirname}/lineerror.csv`).pipe(reader);
  });
});
