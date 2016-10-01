/**
 * Created by Paul on 10/1/2016.
 */
var fs = require('fs');
var nodePath = require('path');

var banner = "//console.log(\"!!!!!!!!!!!!!!!! WARNING THIS IS GUN 0.5 !!!!!!!!!!!!!!!!!!!!!!\");\n";
var polyCover = "\n\t/* UNBUILD */\n";
var immediateStart = "\n;(function(){\n";
var immediateEnd = "\n}());\n";
var requireStart = "\n\trequire.register('$filename', function(exports, require, module){\n";
var requireEnd = "\n\t});//module $filename\n";

function indent(text, i) {
  var replacer = '\n' + Array((i || 1) + 1).join('\t');
  return text.replace(/\n/ig, replacer);
}

function buildByPath(path) {
  var buffers = [];
  var files = fs.readdirSync(path);
  for(var i = 0, len = files.length; i < len; i++) {
    var filePath = nodePath.join(path, files[i]);
    if(fs.statSync(filePath).isFile()) {
      var content = fs.readFileSync(filePath, 'utf8');
      buffers.push(
        requireStart.replace('$filename', path.replace(/\.\/src/ig, '.') + '/' + files[i].slice(0, -3)),
        indent(content, 2),
        requireEnd.replace('$filename', path.replace(/\.\/src/ig, '.') + '/' + files[i].slice(0, -3))
      );
    }
  }
  return buffers;
}


;(function(){
  var polyfill = fs.readFileSync('./src/require/unbuild.js', 'utf8');
  // var requirePolyfill = readModuleFile('commonjs-require-definition/require')
  var buffers = [
    banner,
    // requirePolyfill,
    immediateStart,
    // '\n\t;'
    polyCover,
    indent(polyfill),
    polyCover
  ];

  ['./src', './src/adapters', './src/polyfills'].forEach(function (dir) {
    var buf = buildByPath(dir)
    buffers = buffers.concat(buf);
  });

  var order = fs.readFileSync('./src/require/order.js', 'utf8');

  buffers.push(polyCover, indent(order), polyCover, immediateEnd);

  return fs.writeFileSync('./result.js', buffers.join(''));
}());