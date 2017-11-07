const fs = require('fs');
const CSVStream = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should allow callbacks in data', (done) => {
    const csv = new CSVStream();
    let delayedLines = 0;
    let seenLines = 0;
    csv.on('end', () => {
      assert.equal(delayedLines, 3);
      done();
    });
    csv.on('asyncdata', (line, next) => {
      assert.equal(delayedLines, seenLines);

      seenLines++;
      setTimeout(() => {
        delayedLines++;
        next();
      }, 100);
    });
    fs.createReadStream(`${__dirname}/multiline.csv`).pipe(csv);
  });
});
