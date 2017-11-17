const fs = require('fs');
const csv = require('..');

describe('CSV Stream', () => {
  it('should report error on broken quoting', (done) => {
    const reader = new csv.Reader();
    reader.on('end', () => done('bad'));
    reader.on('error', () => done());
    fs.createReadStream(`${__dirname}/brokenquote.csv`).pipe(reader);
  });
});
