const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support quoted strings with escaped quotes inside', (done) => {
    const reader = new csv.Reader();
    reader.on('end', done);
    reader.on('data', (line) => {
      assert.deepEqual(line, { Id: '12345', Description: 'hello "world"!', Random: '42' });
    });
    fs.createReadStream(`${__dirname}/escaped.csv`).pipe(reader);
  });
});
