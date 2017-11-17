const fs = require('fs');
const zlib = require('zlib');
const { Transform } = require('stream');

// This is from : http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ',');

  // Create a regular expression to parse the CSV values.
  const objPattern = new RegExp(
    (
      // Delimiters.
      `(\\${strDelimiter}|\\r?\\n|\\r|^)` +

      // Quoted fields.
      '\\s*(?:"([^"]*(?:""[^"]*)*)\\s*"|' +

      // Standard fields.
      `([^"\\${strDelimiter}\\r\\n]*))`
    ), 'gi');


  // Create an array to hold our data. Give the array
  // a default empty first row.
  const arrData = [[]];
  // Create an array to hold our individual pattern
  // matching groups.
  let arrMatches = null;
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  let pos = 0;
  // eslint-disable-next-line no-cond-assign
  while (arrMatches = objPattern.exec(strData)) {
    // if the pos has moved further than expected, we skipped
    // some bad data
    if (arrMatches.index > pos) {
      const skipped = strData.substring(pos, arrMatches.index).trim();
      if (skipped.length > 0) {
        throw new Error(`bad data was skipped (${strData.substr(pos, arrMatches.index)})`);
      }
    }
    pos = arrMatches.index + arrMatches[0].length;

    // Get the delimiter that was found.
    const strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    } else if ((arrMatches.index === 0) && (strMatchedDelimiter === strDelimiter)) {
      // this is to fix extra item when line starts with delimiter
      // (thus an implicit empty item is indicated)
      arrData[arrData.length - 1].push('');
    }


    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    let strMatchedValue;
    if (arrMatches[2] !== undefined) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(
        new RegExp('""', 'g'),
        '"'
        );
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }


    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return (arrData);
}

// this is needed because the CSVToArray function fails on newlines in quoted strings
// splits string into array of lines, with last cell in array being the remainder
function splitNewlines(str) {
  let inString = false;
  const parts = [];
  let lastIndex = 0;
  let i = 0;
  for (;i < str.length; i++) {
    const c = str[i];
    if (c === '"') {
      if (inString && (i < (str.length - 2))) {
        if (str[i + 1] !== '"')inString = !inString;
        else i++;
      } else inString = !inString;
    } else if ((c === '\n') && !inString) {
      parts.push(str.substr(lastIndex, i - lastIndex));
      lastIndex = i + 1;
    }
  }
  if (i !== lastIndex)parts.push(str.substr(lastIndex, i - lastIndex));

  // this is to correct for the fact that a newline is lost if it is the last character in input
  if (str[str.length - 1] === '\n')parts[parts.length - 1] += '\n';

  return parts;
}

// this is to create a custom constructor that hopefully will
// trigger the V8 "hidden classes" feature for maximum performance
function makeItem(headers) {
  let setString = `  if(args.length!==${headers.length})throw new Error("Expected ${headers.length} values, but got "+args.length);\n`;
  for (let h = 0; h < headers.length; h++) {
    const name = headers[h];
    setString += `  this["${name}"]=args[${h}];\n`;
  }
  // eslint-disable-next-line no-new-func
  return new Function('args', setString);
}

class CSVReader extends Transform {
  constructor(options) {
    super(Object.assign({}, options, { readableObjectMode: true }));

    this.options = {};
    options = options || {};
    this.options.delimiter = options.delimiter || ',';
    this.options.headers = true;
    if (options.headers !== undefined) this.options.headers = options.headers;

    this.buffer = '';
    this.queue = [];
    this.headers = null;
    this.Item = {};
    this.firstWrite = true;
    this.lineCount = 0;
  }

  addToQueue(lines, callback) {
    this.queue = this.queue.concat(lines);

    const doEmit = () => {
      if (this.queue.length > 0) {
        const line = this.queue.shift();
        this.emitLine(line, (err) => {
          if (err) {
            this.emit('error', err);
          }
          doEmit();
        });
      } else if (callback) callback(null);
    };
    doEmit();
  }

  emitLine(line, callback) {
    let data;
    try {
      data = CSVToArray(line, this.options.delimiter)[0];
    } catch (e) {
      callback(e.message);
      return;
    }

    const emitData = (value, cb) => {
      this.push(value);
      if (this.listenerCount('asyncdata') > 0) {
        this.emit('asyncdata', value, cb);
      } else cb(null);
    };

    this.lineCount++;
    if (this.options.headers) {
      if (this.headers === null) {
        this.headers = data;
        this.emit('headers', data);
        this.Item = makeItem(this.headers);
        callback(null);
      } else {
        try {
          const item = new this.Item(data);
          emitData(item, callback);
        } catch (e) {
          this.emit('error', `Error at line ${this.lineCount} (${e.message})`);
          callback(null);
        }
      }
    } else emitData(data, callback);
  }

  _transform(chunk, encoding, callback) {
    let data = chunk.toString('utf8');
    if (this.firstWrite && data.charCodeAt(0) === 0xFEFF) {
      data = data.slice(1);
    }
    this.firstWrite = false;
    this.buffer += data;

    const lines = splitNewlines(this.buffer);
    if (lines.length > 1) {
      const outLines = lines.slice(0, -1);
      this.buffer = lines[lines.length - 1];  // set buffer to remainder
      this.addToQueue(outLines, callback);
    } else {
      callback(null);
    }
  }

  _flush(callback) {
    if (this.buffer.length > 0) {
      // emit very last line
      this.addToQueue([this.buffer], () => {
        callback(null);
      });
    } else callback(null);
  }
}

function load(filename, options) {
  const fileStream = fs.createReadStream(filename);
  const stream = filename.endsWith('.gz') ?
    fileStream.pipe(zlib.createGunzip()) :
    fileStream;

  return new Promise((resolve, reject) => {
    const csv = new CSVReader(options);
    const lines = [];
    csv.on('end', () => resolve(lines));
    csv.on('error', (err) => reject(err));
    csv.on('data', (line) => lines.push(line));
    stream.pipe(csv);
  });
}

function escapeField(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function save(filename, data, keys) {
  if (data.length === 0) throw new Error('no data to save');
  if (keys === undefined) keys = Object.keys(data[0]);

  return new Promise((resolve) => {
    const out = fs.createWriteStream(filename);
    out.on('finish', resolve);

    out.write(`${keys.join(',')}\n`);
    for (const row in data) {
      out.write(`${keys.map((key) => escapeField(row[key])).join(',')}\n`);
    }

    out.end();
  });
}


module.exports = {
  Reader: CSVReader,
  load,
  save,
};
