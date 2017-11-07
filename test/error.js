const fs = require('fs');
const CSVStream = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should emit errors happening in asyncdata event', (done) => {
    const csv = new CSVStream({ headers: true });
    let errorCount = 0;
    csv.on('error', (err) => {
      errorCount++;
      assert.equal(errorCount, 1);
      assert.equal(err, 'bad happened');
      done();
    });
    csv.on('asyncdata', (line, next) => {
      let err = null;
      if (line.col1 > 1) err = 'bad happened';
      next(err);
    });
    fs.createReadStream(`${__dirname}/multiline.csv`).pipe(csv);
  });
});
