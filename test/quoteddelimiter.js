const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support quoted strings with delimiters inside and whitespace outside', (done) => {
    const reader = new csv.Reader();
    reader.on('end', done);
    reader.on('data', (line) => {
      assert.deepEqual(line, { Id: '12345', Description: 'a,b,c,d', Random: '42' });
    });
    fs.createReadStream(`${__dirname}/quoteddelimiter.csv`).pipe(reader);
  });
});
