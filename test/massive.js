const csv = require('..');
const assert = require('assert');

describe('CSV Stream', () => {
  it('should support massive streams', function test(done) {
    this.timeout(10000);
    const reader = new csv.Reader();

    const numColumns = 20;
    const numRows = 100000;
    const columns = [];
    for (let c = 0; c < numColumns; c++)columns.push(`col${c}`);

    let headersSent = false;
    let dataSent = false;
    reader.on('end', () => {
      assert.ok(headersSent);
      assert.ok(dataSent);
      done();
    });
    reader.on('headers', (headers) => {
      for (let c = 0; c < numColumns; c++) {
        assert.equal(headers[c], columns[c]);
      }
      assert.ok(!headersSent);
      headersSent = true;
    });
    reader.on('data', (line) => {
      for (let c = 0; c < numColumns; c++) {
        assert.ok(line[columns[c]].match(/^abc(\d|\d\.|\.\d)+$/) != null);
      }
      dataSent = true;
    });

    reader.write(`${columns.join(',')}\n`);
    for (let i = 0; i < numRows; i++) {
      const line = [];
      for (let j = 0; j < numColumns; j++) {
        line.push(`abc${1.0 + Math.random()}`);
      }
      reader.write(`${line.join(',')}\n`);
    }
    reader.end();
  });
});
