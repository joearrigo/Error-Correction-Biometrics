const fs=require('fs');
const sm = require('statistical-methods');

//60% of data is used for training, 20% is used for validation/fitting, and 20% is reserved unseen for testing.
const portionUnseen = 0.2;
const portionForTraining = 0.6;

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

// Generates array of data per page, each index represents one text box.
// For each user, then, there should be 25 1D arrays.

const generateData1D = function(array) {
    //Backspace is keycode 8
    //Delete is keycode 46

    let stats = [];

    let fractionedArray = [];
    fractionedArray[0] = array.filter(element => element["info"]["id"] == "01");
    fractionedArray[1] = array.filter(element => element["info"]["id"] == "02");
    fractionedArray[2] = array.filter(element => element["info"]["id"] == "03");
    fractionedArray[3] = array.filter(element => element["info"]["id"] == "04");
    fractionedArray[4] = array.filter(element => element["info"]["id"] == "05");

    //each will have avg, mean, and stddev

    fractionedArray.forEach((element, i)=> {
        /**
         * Dwell times on backspace
         * Flight times to backspace
         * Flight times from backspace
         * 
         * Dwell times on delete
         * Flight times to delete
         * Flight times from delete
         */

        let bDwells = []; //milliseconds
        let bDwellAvg = 0;
        let bDwellMedian = 0;
        let bDwellStd = 0;

        let dDwells = []; //milliseconds
        let dDwellAvg = 0;
        let dDwellMedian = 0;
        let dDwellStd = 0;

        
        element.filter(ele => ele["keyTyped"]["keyCode"] == 8).reduce((accumulator, current) => {
            //keyup is 1, keydown is 0
            if(current["keyTyped"]["repeat"] == true){
                accumulator = 0;
            }else {
                if(current["eventType"] == 1 && accumulator != 0){
                    bDwells.push(Number(current["time"]["$numberLong"]) - accumulator); //Time in ms
                    accumulator = 0;
                }else if(current["eventType"] == 0 && accumulator == 0)
                    accumulator = Number(current["time"]["$numberLong"]);
                else
                    accumulator = 0;
            }
            return accumulator;
        }, 0);

        element.filter(ele => ele["keyTyped"]["keyCode"] == 46).reduce((accumulator, current) => {
            //keyup is 1, keydown is 0
            if(current["keyTyped"]["repeat"] == true){
                accumulator = 0;
            }else {
                if(current["eventType"] == 1 && accumulator != 0){
                    dDwells.push(Number(current["time"]["$numberLong"]) - accumulator); //Time in ms
                    accumulator = 0;
                }else if(current["eventType"] == 0 && accumulator == 0)
                    accumulator = Number(current["time"]["$numberLong"]);
                else
                    accumulator = 0;
            }
            return accumulator;
        }, 0);

        let toBFlights =[];
        let toBAvg = 0;
        let toBMedian = 0;
        let toBStd = 0;

        let fromBFlights = [];
        let fromBAvg = 0;
        let fromBMedian = 0;
        let fromBStd = 0;

        let toDFlights = [];
        let toDAvg = 0;
        let toDMedian = 0;
        let toDStd = 0;

        let fromDFlights = [];
        let fromDAvg = 0;
        let fromDMedian = 0;
        let fromDStd = 0;

        element.reduce((accumulator, current) => {
            if(accumulator[0] == -1)
                return [ current["keyTyped"]["keyCode"] == 8 ? 0 : current["keyTyped"]["keyCode"] == 46 ? 1 : 2 , Number(current["time"]["$numberLong"]) ];

            // 0: previous was backspaceUp
            // 1: previous was deleteUp
            // 2: previous was otherUp
            if(accumulator[0] == 0){
                if(current["keyTyped"]["keyCode"] != 8)
                    fromBFlights.push(Number(current["time"]["$numberLong"]) - accumulator[1]);
            }else if(accumulator[0] == 1){
                if(current["keyTyped"]["keyCode"] != 46)
                    fromDFlights.push(Number(current["time"]["$numberLong"]) - accumulator[1]);
            }else if(accumulator[0] == 2){
                if(current["keyTyped"]["keyCode"] == 46)
                    toDFlights.push(Number(current["time"]["$numberLong"]) - accumulator[1]);
                else if(current["keyTyped"]["keyCode"] == 8)
                    toBFlights.push(Number(current["time"]["$numberLong"]) - accumulator[1]);
            }

            return [ current["keyTyped"]["keyCode"] == 8 ? 0 : current["keyTyped"]["keyCode"] == 46 ? 1 : 2 , Number(current["time"]["$numberLong"]) ];
        }, [-1, 0]);

        //Calculate the stats for those now:

        bDwellAvg = sm.mean(bDwells);
        bDwellMedian = sm.median(bDwells);
        bDwellStd = sm.stddev(bDwells);

        dDwellAvg = sm.mean(dDwells);
        dDwellMedian = sm.median(dDwells);
        dDwellStd = sm.stddev(dDwells);

        toBAvg = sm.mean(toBFlights);
        toBMedian = sm.median(toBFlights);
        toBStd = sm.stddev(toBFlights);

        toDAvg = sm.mean(toDFlights);
        toDMedian = sm.median(toDFlights);
        toDStd = sm.stddev(toDFlights);

        fromBAvg = sm.mean(fromBFlights);
        fromBMedian = sm.median(fromBFlights);
        fromBStd = sm.stddev(fromBFlights);

        fromDAvg = sm.mean(fromDFlights);
        fromDMedian = sm.median(fromDFlights);
        fromDStd = sm.stddev(fromDFlights);

        /**
         * backspace frequency
         * delete frequency
         * selection overwrite frequency
         */

        let total = 0;
        let bFreq = 0;
        let dFreq = 0;
        let sFreq = 0;

        bFreq = element.filter(ele => ele["keyTyped"]["keyCode"] == 8).length;
        dFreq = element.filter(ele => ele["keyTyped"]["keyCode"] == 46).length;
        sFreq = element.filter(ele => ele["selection"]["selectionSize"] > 0 
            && ele["eventType"] == 0
            && ele["keyTyped"]["keyCode"] != 46 && ele["keyTyped"]["keyCode"] != 8).length; //How many selections were overridden not by delete or backspace?

        total = bFreq + dFreq + sFreq;

        bFreq = bFreq / total;
        dFreq = dFreq / total;
        sFreq = sFreq / total;

        stats[i] = [bDwellAvg, bDwellMedian, bDwellStd, dDwellAvg, dDwellMedian, dDwellStd, 
            toBAvg, toBMedian, toBStd, toDAvg, toDMedian, toDStd, 
            fromBAvg, fromBMedian, fromBStd, fromDAvg, fromDMedian, fromDStd,
            bFreq, dFreq, sFreq];
    });

    return stats;
}


///
///
///
///

const allFiles = getAllFiles('./unprocessed_json').filter(file => file.endsWith('.json'));

var peopleData = {};

allFiles.forEach(file => {
    //Go through entire file:
    fs.readFile(file, function (error, content) {
        var data = JSON.parse(content);
        console.log(data.length);

        let page1data = data.filter(element => element["info"]["currentUrl"]=="https://josepharrigo.com/qa1.html" && element["info"]["typoMode"] == "user_input_typod");
        let page2data = data.filter(element => element["info"]["currentUrl"]=="https://josepharrigo.com/qa2.html" && element["info"]["typoMode"] == "user_input_typod"); //We'll have to evenly divide these among train and test
        let page3data = data.filter(element => element["info"]["currentUrl"]=="https://josepharrigo.com/qa3.html" && element["info"]["typoMode"] == "user_input_typod");

        let page4data = data.filter(element => element["info"]["currentUrl"]=="https://josepharrigo.com/shortans.html"); //Evenly divide these too
        let page5data = data.filter(element => element["info"]["currentUrl"]=="https://josepharrigo.com/shortans2.html");

        console.log("lens: ", page1data.length, page2data.length, page3data.length, page4data.length, page5data.length);

        let page1array = generateData1D(page1data);
        let page2array = generateData1D(page2data);
        let page3array = generateData1D(page3data);
        let page4array = generateData1D(page4data);
        let page5array = generateData1D(page5data);

        peopleData[getFileName(file)] = [page1array, page2array, page3array, page4array, page5array];
        
        fs.writeFile('data.json', JSON.stringify(peopleData, null, 4).replace(/null/gi, "0"), (error) => {
            if (error) {
                throw error;
            }
        });
    });
});