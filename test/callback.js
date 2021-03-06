const fs = require('fs');
const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should allow async data', (done) => {
    const reader = new csv.Reader();
    let delayedLines = 0;
    let seenLines = 0;
    reader.on('end', () => {
      assert.equal(delayedLines, 3);
      done();
    });
    reader.on('data', () => {});
    reader.on('asyncdata', (line, next) => {
      assert.equal(delayedLines, seenLines);

      seenLines++;
      setTimeout(() => {
        delayedLines++;
        next();
      }, 100);
    });
    fs.createReadStream(`${__dirname}/multiline.csv`).pipe(reader);
  });
});
