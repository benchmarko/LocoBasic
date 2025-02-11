const fs = require('fs');
const path = require('path');

//import fs from 'fs';
//import path from 'path';

// Read the version from package.json
const packageJson = require('./package.json');
const version = packageJson.version;

// Path to the index.html file
const indexPath = path.join(__dirname, 'dist', 'index.html');

// Read the index.html file
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Replace the version in the title tag
indexHtml = indexHtml.replace(/<title>LocoBasic v[\d.]+<\/title>/, `<title>LocoBasic v${version}</title>`);

// Write the updated index.html file
fs.writeFileSync(indexPath, indexHtml, 'utf8');

console.log(`Updated index.html to version ${version}`);
