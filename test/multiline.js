const fs = require('fs');
const CSVStream = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support multiple lines', (done) => {
    const csv = new CSVStream({ headers: true });
    let headersSent = false;
    let dataSent = false;
    let count = 0;
    csv.on('end', () => {
      assert.ok(headersSent);
      assert.ok(dataSent);
      assert.equal(count, 3);
      done();
    });
    csv.on('headers', (headers) => {
      assert.deepEqual(headers, ['col1', 'col2', 'col3', 'col4']);
      assert.ok(!headersSent);
      headersSent = true;
    });
    csv.on('data', (line) => {
      switch (count) {
        case 0:
          assert.deepEqual(line, { col1: 1, col2: 2, col3: 3, col4: 4 });
          break;
        case 1:
          assert.deepEqual(line, { col1: 5, col2: 6, col3: 7, col4: 8 });
          break;
        case 2:
          assert.deepEqual(line, { col1: 9, col2: 10, col3: 11, col4: 12 });
          break;
        default:
          throw new Error('extraneous line');
      }
      count++;
      dataSent = true;
    });
    fs.createReadStream(`${__dirname}/multiline.csv`).pipe(csv);
  });
});
