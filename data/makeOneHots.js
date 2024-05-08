const fs=require('fs');
const dfd = require("danfojs-node")

const getAllFiles = function(dir, allFilesList = []) {
    const files = fs.readdirSync(dir);
    files.map(file => {
      const name = dir + '/' + file;
      if (fs.statSync(name).isDirectory()) { // check if subdirectory is present
        getAllFiles(name, allFilesList);     // do recursive execution for subdirectory
      } else {
          allFilesList.push(name);           // push filename into the array
      }
    })
    
    return allFilesList;
}

const getFileName = function(str){
    return str.substring(str.lastIndexOf('/')+1);
}


const allFiles = getAllFiles('./unprocessed_json').filter(file => file.endsWith('.json'));

let jsNames = {
    values: []
}
let oneHots = {};

allFiles.forEach(file => {
    jsNames.values.push(getFileName(file));
});

let df = new dfd.DataFrame(jsNames)
let encode = new dfd.OneHotEncoder();
encode.fit(df['values'])
oneHots = encode.transform(df['values'].values);

let mapping = {}

oneHots.forEach((arrIn, index) => {
    mapping[jsNames.values[index]] = arrIn;
})

console.log(mapping);

fs.writeFile('encodings.json', JSON.stringify(mapping, null, 4).replace(/null/gi, "0"), (error) => {
    if (error) {
        throw error;
    }
});