const express = require('express')
const path = require('path');

//Cookies
const cookieParser = require('cookie-parser');

//Webpage-related
const app = express()
const port = 9000
const dir = path.join(__dirname, 'dist');

//DB vars
const mongodb = require('mongodb');
const { cursorTo } = require('readline');
const mongoURI = 'mongodb://mongo:27017';
const client = new mongodb.MongoClient(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});

//Research vars
const typo = require("typo-js");
const dict = new typo('en_US');

const startDB = async function(){
    try{
        await client.connect();
        await client.db("database").command({ping: 1});

        console.log("Successfully connected to MongoDB");
    }catch(exc){
        console.error("MongoDB Connection Error ", exc);
    }
}

const closeDB = async function() {
    await client.close();
}

const pushManyDB = async function(mcoll, dataIn){
    try{
    let coll = client.db("database").collection(mcoll)
    await coll.insertMany(dataIn)
    }catch(exc){
        console.error("Database push error", exc);
        return false;
    }
    return true;
}

const pushOneDB = async function(mcoll, dataIn){
    try{
        let coll = client.db("database").collection(mcoll)
        await coll.insertOne(dataIn)
        }catch(exc){
            console.error("Database push error", exc);
            return false;
        }
        return true;
}

const updateOneDB = async function(mcoll, key, newData){
    try{
        let coll = client.db("database").collection(mcoll);
        let updateDoc = {
            $set: {
                [key]: newData
            }
        };

        let options =  { upsert: true };
        await coll.updateOne({[key] : {$exists : true}}, updateDoc, options);
        }catch(exc){
            console.error("Database update error", exc);
            return false;
        }
        return true;
}

const deleteOneDB = async function(mcoll, pair){
    try{
        let coll = client.db("database").collection(mcoll);
        await coll.deleteOne(pair);
        }catch(exc){
            console.error("Database delete error", exc);
            return false;
        }
        return true;
}

const queryDB = function(mcoll, query){
    try{
        let coll = client.db("database").collection(mcoll)
        return coll.find(query);
    }catch(exc){
            console.error("Database query error", exc);
            return null;
    }
}

//From stackoverflow: Roko C. Buljan
//    https://stackoverflow.com/a/69262622
const strReplaceFormatter = (str, i, rep) => {
    if (!str) return;                      // Do nothing if no string passed
    const arr = [...str];                  // Convert String to Array
    const len = arr.length
    i = Math.min(Math.abs(i), len);        // Fix to Positive and not > len 
    while (i) {
      const r = ~~(Math.random() * len);
      if (Array.isArray(arr[r])) continue; // Skip if is array (not a character)
      arr[r] = [rep];                      // Insert an Array with the rep char
      --i;
    }
    return arr.flat().join("");
};

const spellCheckPar = function (textBody){
    let badWords = [];
    let regexVal = /[^a-zA-Z( )(*)(')]/g;
    let newBody = textBody.replace(regexVal, "");
    newBody.split(" ").forEach((val) => {
        if(!dict.check(val))
            badWords.push(val);
    });

    let finalBadWords = badWords.filter(bw => bw !== '');

    return finalBadWords;
}


const pageGuides = {
    "login.html"   : "/waiver.html",
    "waiver.html"   : "/qa1.html",
    "qa1.html"      : "/qa2.html",
    "qa2.html"      : "/qa3.html",
    "qa3.html"      : "/shortans.html",
    "shortans.html" : "/shortans2.html",
    "shortans2.html" : "/complete.html"
}

const timeoutMinutes = 60;


const security = function(req, res, next) { 

    if('timestamp' in req.signedCookies){
        let lastDate = Date.parse(req.signedCookies.timestamp);
        let diff = Math.abs((new Date()).getTime() - lastDate);
        if(diff < timeoutMinutes*60*1000){
            res.cookie('timestamp', (new Date()).toString(), {signed: true});
        }else {
            res.clearCookie('user');
            res.clearCookie('uname');
            res.clearCookie('timestamp');
        }
    }else {
        res.clearCookie('user');
        res.clearCookie('uname');
        res.clearCookie('timestamp');
    }

    if('user' in req.signedCookies){
        res.cookie('uname', req.signedCookies.user);
    }else {
        res.clearCookie('user');
        res.clearCookie('uname');
        res.clearCookie('timestamp');
    }

    if(req.url == '/' || /\/index[.]html[\/]*$/.test(req.url) || /\/favicon[.]ico[\/]*$/.test(req.url) || /\/login[\/]*$/.test(req.url) || /\/404[.]html[\/]*$/.test(req.url) 
        || /\/undefined[\/]*$/.test(req.url) || /[.]css$/.test(req.url) || /[.]js$/.test(req.url)){
        next();
        return;
    }

    if(!('user' in req.signedCookies)){
        if(req.accepts(['html', 'json']) === 'html')
            res.status(403).redirect('/index.html');
        res.status(403).send("403. Forbidden");
        console.log("sending 403 to user for req ", req.url);
        return;
    }

    let result = queryDB("unusedKeys", {"code" : req.signedCookies.user});
    if(result == null || result == {}){
        res.status(500).send("500. Internal error");
        console.log("sending 500 to user");
        return;
    }

    result.toArray().then((arr) => {
        if(arr.length > 0){
            if(/[.]html[\/]*$/.test(req.url)){
                let res2 = queryDB("progress", {[req.signedCookies.user] : {$exists : true } } );
                if(res2 == null || res2 == {}){
                    res.redirect("/waiver.html");
                    return;
                }
                res2.toArray().then((arr2) => {
                    if(arr2.length > 0){
                        if(req.url.includes(pageGuides[arr2[0][arr[0].code]]))
                            next();
                        else{
                            res.redirect(pageGuides[arr2[0][arr[0].code]]);
                        }

                    }else {
                        res.redirect("/waiver.html");
                        return;
                    }
                });
            }else {
                next();
                return;
            }
            
        }else {
            res.status(500).send("500. Internal error");
        }
    });
    
    return;
}

app.use(cookieParser('BHWBSoUIASHDj2890345y234uirnj23jtkmn2t25n123j4kud0sd8fkkJNSJKFNAISDFHKKJkjnjknslfjknifrhioJASIHUOSUIAFHsejfnjkNASEUI29845y72378017823yr183752893'),
            security, express.static(dir), express.json());


app.post(/[\?\/]questionSubmit/, (req, res) => {
    let wordsMispelled = {
        Question1: spellCheckPar(req.body.q1),
        Question2: spellCheckPar(req.body.q2),
        Question3: spellCheckPar(req.body.q3),
        Question4: spellCheckPar(req.body.q4),
        Question5: spellCheckPar(req.body.q5)
    };

    let errors = "";
    if(wordsMispelled.Question1.length > 0)
        errors = errors + "1, ";
    else
        delete wordsMispelled.Question1;
    if(wordsMispelled.Question2.length > 0)
        errors = errors + "2, ";
    else
        delete wordsMispelled.Question2;
    if(wordsMispelled.Question3.length > 0)
        errors = errors + "3, ";
    else
        delete wordsMispelled.Question3;
    if(wordsMispelled.Question4.length > 0)
        errors = errors + "4, ";
    else
        delete wordsMispelled.Question4;
    if(wordsMispelled.Question5.length > 0)
        errors = errors + "5, ";
    else
        delete wordsMispelled.Question5;

        errors.replace(/(, )$/, "");


    if(errors.length > 0){
        res.status(400).json({"errors" : errors, "badWords" : wordsMispelled});
    }else {
        let nextPage = "";
        if(/qa1[.]html/.test(req.url)){
            nextPage = "/qa2.html";
            updateOneDB("progress", req.signedCookies.user, "qa1.html");
        } else if(/qa2[.]html/.test(req.url)){
            nextPage = "/qa3.html";
            updateOneDB("progress", req.signedCookies.user, "qa2.html");
        }
        else if(/qa3[.]html/.test(req.url)){
            nextPage = "/shortans.html";
            updateOneDB("progress", req.signedCookies.user, "qa3.html");
        }
        else if(/shortans[.]html/.test(req.url)){
            nextPage = "/shortans.html";
            updateOneDB("progress", req.signedCookies.user, "shortans.html");
        }
        else if(/shortans2[.]html/.test(req.url)){
            nextPage = "/complete.html";
            updateOneDB("progress", req.signedCookies.user, "shortans2.html");
            pushOneDB("usedKeys", {"code" : req.signedCookies.user});
            deleteOneDB("unusedKeys", {"code" : req.signedCookies.user});

        }
        else   
            nextPage = "/404.html";
        res.status(200).json({"nextPage" : nextPage});
    }
});

app.post(/[\?\/]questionVerify/, (req, res) => {
    let badOnes = "";
    if(req.body.q1.length < 100 || req.body.q1.length > 130)
        badOnes = badOnes + "1, ";
    if(req.body.q2.length < 100 || req.body.q2.length > 130)
        badOnes = badOnes + "2, ";
    if(req.body.q3.length < 100 || req.body.q3.length > 130)
        badOnes = badOnes + "3, ";
    if(req.body.q4.length < 100 || req.body.q4.length > 130)
        badOnes = badOnes + "4, ";
    if(req.body.q5.length < 100 || req.body.q5.length > 130)
        badOnes = badOnes + "5, ";

    badOnes.replace(/(, )$/, "");

    if(badOnes.length > 0){
        res.status(400).json({errors: badOnes});
    }else {
        let resBody = {
            q1: strReplaceFormatter(req.body.q1, Math.floor(25 * req.body.q1.length / 130), "*"),
            q2: strReplaceFormatter(req.body.q2, Math.floor(25 * req.body.q2.length / 130), "*"),
            q3: strReplaceFormatter(req.body.q3, Math.floor(25 * req.body.q3.length / 130), "*"),
            q4: strReplaceFormatter(req.body.q4, Math.floor(25 * req.body.q4.length / 130), "*"),
            q5: strReplaceFormatter(req.body.q5, Math.floor(25 * req.body.q5.length / 130), "*")
        }
        res.status(200).json(resBody);
    }
});

app.get(/[\?\/]waiverAccept/, (req, res) => {
    let query = queryDB("waivers", {"user" : req.signedCookies.user});

    if(query == null || query == {}){
        res.status(500).send("500. Internal error");
        console.log("sending 500");
        return;
    }

    query.toArray().then((arr) => {
        if(arr.length <= 0){
            pushOneDB("waivers", {"user" : req.signedCookies.user});
        }

        updateOneDB("progress", req.signedCookies.user, "waiver.html");

        res.status(201).send();
    });

})

app.post(/[\?\/]data_in/, (req, res) => {
    pushManyDB(req.signedCookies.user + '', req.body.data);
    res.status(201).send();
})

app.get(/[\?\/]logout/, (req, res) => {
    res.clearCookie("user");
    res.clearCookie("uname");

    res.status(200).end();
})

app.post(/[\?\/]login/, (req, res) => {
    res.status(200);

    cursorOut = queryDB("unusedKeys", {
        "code": req.body.input
    }).toArray().then((arr) => {
        if(arr.length > 0){
            res.cookie('user', req.body.input, { signed: true });
            res.cookie('timestamp', (new Date()).toString(), { signed: true });
            res.cookie('uname', req.body.input, { signed: false });

            let res2 = queryDB("progress", {[req.body.input] : {$exists : true } } );
            if(res2 == null || res2 == {}){
                console.log("no res2");
                updateOneDB("progress", req.body.input, "login.html");}
            else
                res2.toArray().then((arr) => {
                    if(arr.length <= 0){
                        updateOneDB("progress", req.body.input, "login.html");
                        console.log("no res2");
                    }
                })
            res.json({
                failCode: -1
            });
        }
        else
            cursorOut = queryDB("usedKeys", {
                "code": req.body.input
            }).toArray().then((arr2) =>{
                if(arr2.length > 0)
                    res.json({
                        failCode: 1
                    });
                else
                    res.json({
                        failCode: 0
                    });
            });
    });
})

function fallbackPage(req, res) {
    res.status(404);
    console.log("404 found at ", req.url);
    // respond with html page
    if (req.accepts('html')) {
        res.redirect("/404.html");
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.json({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
}
app.use(fallbackPage);

//PROGRAM EXECUTION STARTS HERE

var key_obj;
(async function () {
    await startDB();
})();
/*
pushOneDB("unusedKeys", {"code" : "MXQ74RC"});
pushOneDB("unusedKeys", {"code" : "8A19U85"}); 
pushOneDB("unusedKeys", {"code" : "CG9FP37"}); 
pushOneDB("unusedKeys", {"code" : "P70W1TN"}); 
pushOneDB("unusedKeys", {"code" : "FWLHD3I"}); 

pushOneDB("unusedKeys", {"code" : "98J9433"}); 
pushOneDB("unusedKeys", {"code" : "YN6XXQV"}); 
pushOneDB("unusedKeys", {"code" : "0KNNNBX"}); 
pushOneDB("unusedKeys", {"code" : "4KGL198"});  
pushOneDB("unusedKeys", {"code" : "QBW9Y0B"});

pushOneDB("unusedKeys", {"code" : "VTY0W43"});
pushOneDB("unusedKeys", {"code" : "6Z3T2O7"});
pushOneDB("unusedKeys", {"code" : "9DP7JN3"});
pushOneDB("unusedKeys", {"code" : "3917OEL"});
pushOneDB("unusedKeys", {"code" : "4YQF2IE"});
pushOneDB("unusedKeys", {"code" : "YC884O6"});
pushOneDB("unusedKeys", {"code" : "7725M62"});
pushOneDB("unusedKeys", {"code" : "P6711OQ"});
pushOneDB("unusedKeys", {"code" : "FYLFE10"});
pushOneDB("unusedKeys", {"code" : "Y76YQ3I"});
pushOneDB("unusedKeys", {"code" : "V8N524B"});
pushOneDB("unusedKeys", {"code" : "7G9VK4B"});
pushOneDB("unusedKeys", {"code" : "M34VMK9"});
pushOneDB("unusedKeys", {"code" : "22508NQ"});
pushOneDB("unusedKeys", {"code" : "BTDP145"});
pushOneDB("unusedKeys", {"code" : "F791L98"});
pushOneDB("unusedKeys", {"code" : "8BH7479"});
pushOneDB("unusedKeys", {"code" : "P972NDQ"});
pushOneDB("unusedKeys", {"code" : "9K5511U"});
pushOneDB("unusedKeys", {"code" : "2I0IUQW"});
pushOneDB("unusedKeys", {"code" : "E29USJM"});
pushOneDB("unusedKeys", {"code" : "9VOK58Y"});
pushOneDB("unusedKeys", {"code" : "EP6V395"});
pushOneDB("unusedKeys", {"code" : "XXT8Z70"});
pushOneDB("unusedKeys", {"code" : "36R5E77"});
pushOneDB("unusedKeys", {"code" : "D20RR64"});
pushOneDB("unusedKeys", {"code" : "8G7N5AG"});
pushOneDB("unusedKeys", {"code" : "0T54752"});
pushOneDB("unusedKeys", {"code" : "2AEG5V5"});
pushOneDB("unusedKeys", {"code" : "I1812MN"});
*/
app.listen(port)


//EXIT CLEANUP

process.on("exit", () => {
    closeDB();
});

//Cleanups
//catching signals and doing cleanup
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function (signal) {
    process.on(signal, function () {
        process.exit(1);
    });
});
