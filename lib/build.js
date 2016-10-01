/**
 * Created by Paul on 10/1/2016.
 */
var fs = require('fs');
var nodePath = require('path');

var banner = "//console.log(\"!!!!!!!!!!!!!!!! WARNING THIS IS GUN 0.5 !!!!!!!!!!!!!!!!!!!!!!\");";
var polyCover = "\n\t/* UNBUILD */\n";
var immediateStart = "\n;(function(){\n";
var immediateEnd = "\n}());\n";
var requireStart = "\n\t;require(function(module){\n";
var requireEnd = "\n\t})(require, './$filename');\n";

function indent(text, i) {
  var replacer = '\n' + Array((i || 1) + 1).join('\t');
  return text.replace(/\n/ig, replacer);
}

;(function(){
  var polyfill = fs.readFileSync('./src/polyfill/unbuild.js', 'utf8');
  var buffers = [
    banner,
    immediateStart,
    polyCover,
    indent(polyfill),
    polyCover
  ];

  var files = fs.readdirSync('./src');
  for(var i = 0, len = files.length; i < len; i++) {
    var filePath = nodePath.join('./src', files[i]);
    if(fs.statSync(filePath).isFile()) {
      var content = fs.readFileSync(filePath, 'utf8');
      buffers.push(requireStart, indent(content, 2), requireEnd.replace('$filename', files[i].slice(0, -3)));
    }
  }

  buffers.push(immediateEnd);

  return fs.writeFileSync('./result.js', buffers.join(''));
}());