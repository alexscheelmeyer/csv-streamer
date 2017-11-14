const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should read files with utf byte order mark', (done) => {
    const reader = new csv.Reader();
    reader.on('end', done);
    reader.on('data', (line) => {
      assert(line.Date !== undefined);
    });
    fs.createReadStream(`${__dirname}/utfbyte.csv`).pipe(reader);
  });
});
