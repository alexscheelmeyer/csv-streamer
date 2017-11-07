const fs = require('fs');
const CSVStream = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support quoted strings with delimiters inside and whitespace outside', (done) => {
    const csv = new CSVStream({ headers: true });
    csv.on('end', done);
    csv.on('data', (line) => {
      assert.deepEqual(line, { Id: '12345', Description: 'a,b,c,d', Random: '42' });
    });
    fs.createReadStream(`${__dirname}/quoteddelimiter.csv`).pipe(csv);
  });
});
