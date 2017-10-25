const fs = require('fs');
const CSVStream = require('../csv-stream');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support quoted strings with escaped quotes inside', (done) => {
    const csv = new CSVStream({ headers: true });
    csv.on('end', done);
    csv.on('data', (line) => {
      assert.deepEqual(line, { Id: '12345', Description: 'hello "world"!', Random: '42' });
    });
    fs.createReadStream(`${__dirname}/escaped.csv`).pipe(csv);
  });
});
