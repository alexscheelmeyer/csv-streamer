const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should emit errors happening in asyncdata event', (done) => {
    const reader = new csv.Reader();
    let errorCount = 0;
    reader.on('error', (err) => {
      errorCount++;
      assert.equal(errorCount, 1);
      assert.equal(err, 'bad happened');
      done();
    });
    reader.on('asyncdata', (line, next) => {
      let err = null;
      if (line.col1 > 1) err = 'bad happened';
      next(err);
    });
    fs.createReadStream(`${__dirname}/multiline.csv`).pipe(reader);
  });
});
