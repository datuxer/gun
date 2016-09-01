var fs = require('fs');

var dir = __dirname + '/../';

var read = function(path){
	return fs.readFileSync(dir + path).toString();
}

var write = function(path, data){
	return fs.writeFileSync(dir + path, data);
}

var rm = function(path, full) {
	path = full || dir + path;
  if(!fs.existsSync(path)){ return }
  fs.readdirSync(path).forEach(function(file,index){
    var curPath = path + "/" + file;
    if(fs.lstatSync(curPath).isDirectory()) { // recurse
      rm(null, curPath);
    } else { // delete file
      fs.unlinkSync(curPath);
    }
  });
  fs.rmdirSync(path);
};

var mk = function(path){
	path = dir + path;
  if(fs.existsSync(path)){ return }
	fs.mkdirSync(path);
}

var between = function(text, start, end){
	end = end || start;
	var s = text.indexOf(start);
	if(s < 0){ return ''}
	s += start.length;
	var e = text.indexOf(end, s);
	if(e < 0){ return '' }
	var code = text.slice(s, e);
	return {s: s, t: code, e: e};
}

var next = function(start, end){
	end = end || start;
	if(!next.text){
		next.text = start;
		return;
	}
	var code = between(next.text, start, end);
	next.text = next.text.slice(code.e + end.length);
	return code.t;
}

var path = function(){
	var code = next(',', ')');
	var path;
	try{path = eval(code);
	}catch(e){console.log("fail", e)};
	if(!path){ return }
	if('.js' !== path.slice(-3)){
		path += '.js';
	}
	return path;
}

var undent = function(code, n){
	var regex = /\n\t\t/ig;
	if(1 === n){
		regex = /\n\t/ig;
	}
	return code.replace(regex, '');
}

;(function(){

	rm('./src');
	mk('./src');

	var gun = read('gun.js');
	var code = next(gun);


	code = next("/* UNBUILD */");
	write('src/unbuild.js', undent(code, 1));

	(function recurse(c){
		code = next(";require(function(module){", "})(require");
		if(!code){ return }
		var file = path();
		if(!file){ return }
		write(file, undent(code));
		recurse();
	}());
}());