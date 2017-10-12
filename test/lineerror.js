const fs = require('fs');
const CSVStream = require('../csv-stream');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should report linenumber for error in line', (done) => {
    const csv = new CSVStream({ headers: true });
    csv.on('end', done);
    csv.on('error', (error) => {
      assert(error.indexOf('line 3') > 0);
    });
    fs.createReadStream(`${__dirname}/lineerror.csv`).pipe(csv);
  });
});
