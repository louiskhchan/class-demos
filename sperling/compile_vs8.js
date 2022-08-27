const fs = require('fs');
const path = require('path');

let dirn = './vs8';
let dir = fs.readdirSync(dirn);

let output = '';
for (let fn of dir) if (fn.match(/vs8.*\.js/i)) {
    console.log(fn);
    let fnpath = path.join(dirn, fn);
    output += "/*" + fn + "*/\n\n";
    output += fs.readFileSync(fnpath).toString();
}

// //shorten
// output = output.replace(/\/\/.*$/gm, '');
// output = output.replace(/\s+/g, ' ');
// output = output.replace(/\/\*.*?\*\//g, '');
//find all functions
let ms = output.matchAll(/^(async\s+function|function|class|var|let|const)\s+(\w+)/igm);
let fnns = [];
for (let m of ms) fnns.push(m[2]);
output += `module.exports={${fnns.join(',')}};\n\n`;
console.log(fnns.length + " objects exported.");
//save
fs.writeFileSync('vs8_compiled.js', output);







