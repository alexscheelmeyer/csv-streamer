const fs = require('fs');
const CSVStream = require('../csv-stream');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should read files with utf byte order mark', (done) => {
    const csv = new CSVStream({ headers: true });
    csv.on('end', done);
    csv.on('data', (line) => {
      assert(line.Date !== undefined);
    });
    fs.createReadStream(`${__dirname}/utfbyte.csv`).pipe(csv);
  });
});
