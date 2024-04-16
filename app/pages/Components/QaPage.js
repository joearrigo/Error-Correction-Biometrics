import React, {useEffect, useState} from "react"
import Navbar from "./Navbar"

function submitButton(){
    let buttonReq = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            q1: document.getElementById("01").value,
            q2: document.getElementById("02").value,
            q3: document.getElementById("03").value,
            q4: document.getElementById("04").value,
            q5: document.getElementById("05").value,
        })
    };

    fetch(window.location.href + "/questionSubmit", buttonReq).then((response) => {
        response.json().then((res) =>{
            if(response.status == 200){
                window.location.replace('..' + res.nextPage);
            }else if(response.status == 400){
                console.log(res.badWords);
                alert("Error. Question(s) numbered " + res.errors + " still contain spelling errors. \n" + JSON.stringify(res.badWords, null, 2));
            }else {
                alert("Internal server or network error.");
            }
        });
    });
}

function verifyButton(){
    let buttonReq = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            q1: document.getElementById("01").value,
            q2: document.getElementById("02").value,
            q3: document.getElementById("03").value,
            q4: document.getElementById("04").value,
            q5: document.getElementById("05").value,
        })
    };

    fetch(window.location.href + "/questionVerify", buttonReq).then((response) => {
        response.json().then((res) =>{
            if(response.status == 200){
                document.getElementById("hiddenButton").style.display = "block";
                document.getElementById("submitButton2").disabled = false;
                document.getElementById("shownButton").style.display = "none";
                document.getElementById("submitButton").disabled = true;

                document.getElementById("01").value = res.q1;
                document.getElementById("02").value = res.q2;
                document.getElementById("03").value = res.q3;
                document.getElementById("04").value = res.q4;
                document.getElementById("05").value = res.q5;

                alert("Spelling errors have been added to your answers. Please correct them to submit this page without completely re-writing each answer.");

                let textAreas = document.getElementsByClassName("user_input");

                Array.from(textAreas).forEach((box) => {
                    box.className = "user_input_typod";
                });
            }else if(response.status == 400){
                alert("Error. Question(s) numbered " + res.errors + " do not fulfill the character count requirements.");
            }else {
                alert("Internal server or network error.");
            }
        });
    });
}

//Add listeners.
//These will include the timer logic
//  A flight is characterized by a keyup -> keydown
//  A dwell is characterized by a keydown -> keyup
//
//This can be analyzed after data collection

function getWordAt (str, pos) {
    // check ranges
    if ((pos < 0) || (pos > str.length)) {
        return '';
    }
    // Perform type conversions.
    str = String(str);
    pos = Number(pos) >>> 0;
    
    // Search for the word's beginning and end.
    var left = str.slice(0, pos + 1).search(/\S+\s*$/), // use /\S+\s*$/ to return the preceding word 
        right = str.slice(pos).search(/\s/);
    
    // The last word in the string is a special case.
    if (right < 0) {
        return str.slice(left);
    }
    
    // Return the word, using the located bounds to extract it from the string.
    return str.slice(left, right + pos);
    
}

function makePair(eventType, event, id) {
    let info = {
        id: id,
        typoMode: document.getElementById(id).className, 
        currentUrl: window.location.href
    };
    let keyTyped = {
        keyCode: event.keyCode,
        code: event.code,
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        repeat: event.repeat
    };
    let selStart = document.getElementById(id).selectionStart
    let selEnd = document.getElementById(id).selectionEnd
    let selLen = selEnd - selStart

    let selectionInfo = {
        word: getWordAt(document.getElementById(id).value, selStart), //If on the left of the whitespace, it gives the preceding word. If to the right, it gives the following word.
        before: document.getElementById(id).value.substr(selStart, 1),
        after: document.getElementById(id).value.substr(selStart-1, 1),
        entireSelection: document.getElementById(id).value.substr(selStart, selLen), //Selection end is the index after the substring ends.
        selectionSize: selLen
    };
    return {info: info, eventType: eventType, keyTyped: keyTyped, selection: selectionInfo, time: Date.now()}
}

function addKeyEvent(eventType, event, id) {
    console.log('adding key event');
    keyEvents.push(makePair(eventType,event, id)) 

    if(keyEvents.length >= 10){
        console.log("keyevents full");
        //Send to server and refresh it
        fetch("data_in", {
            method: "POST",
            body: JSON.stringify({
                userId: 1,
                data: keyEvents
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        keyEvents = [];
    }
}

export default function QaPage(props) {

    let blurbType;
    if(props.qaBlurb == null)
        blurbType = true;
    else
        blurbType = props.qaBlurb;

    const [spellCheck, setSpellCheck] = useState(false);

    useEffect(() => {
        document.getElementById("hiddenButton").style.display = "none";
        document.getElementById("submitButton2").disabled = true;
    })

    

    let headers = {};
    headers.header1 = "";
    headers.header2 = "";
    headers.header3 = "";
    if(blurbType == true) {
        headers.header1 = "Please answer each of the following questions in 100-130 characters.";
        headers.header2 = "Character counts are listed below or to the left of each text box.";
        headers.header3 = "Only use regular worlds in your responses: do not use any names, abbreviations, or fake words. Only dictionary words are acceptable.";
    }
    else
        headers.header1 = "Please correct the spelling errors, denoted by asterisks, in the following statements."

    return (<>
    <Navbar href="" pageName={props.pName}/>

    <p><br/></p>

    <h2>{headers.header1}</h2>
    <h2>{headers.header2}</h2>
    <h2>{headers.header3}</h2>

    <p><br/></p>
    
    <h3>{props.q1}</h3>
    <textarea className="user_input" id="01" spellCheck={spellCheck} onInput={(e) => {
        document.getElementById("min_01").innerHTML = e.target.value.length;
    }}
    onKeyUp={(event) => {
        addKeyEvent(1, event, "01");
    }}
    onKeyDown={(event) => {
        addKeyEvent(0, event, "01");
    }}
    onPaste={(e)=>{
      e.preventDefault()
      return false;
    }} 
    onCopy={(e)=>{
      e.preventDefault()
      return false;
    }}
    ></textarea>
    <div className="wordCount">
        <span id="min_01">0</span>
        <span id="max_01">/ {props.minCount} to {props.maxCount}</span>
    </div>

    <p><br/></p>

    <h3>{props.q2}</h3>
    <textarea className="user_input" id="02" spellCheck={spellCheck} onInput={(e) => {
        document.getElementById("min_02").innerHTML = e.target.value.length;
    }}
    onKeyUp={(event) => {
        addKeyEvent(1, event, "02");
    }}
    onKeyDown={(event) => {
        addKeyEvent(0, event, "02");
    }}
    onPaste={(e)=>{
      e.preventDefault()
      return false;
    }} 
    onCopy={(e)=>{
      e.preventDefault()
      return false;
    }}
    ></textarea>
    <div className="wordCount">
        <span id="min_02">0</span>
        <span id="max_02">/ {props.minCount} to {props.maxCount}</span>
    </div>

    <p><br/></p>

    <h3>{props.q3}</h3>
    <textarea className="user_input" id="03" spellCheck={spellCheck} onInput={(e) => {
        document.getElementById("min_03").innerHTML = e.target.value.length;
    }}
    onKeyUp={(event) => {
        addKeyEvent(1, event, "03");
    }}
    onKeyDown={(event) => {
        addKeyEvent(0, event, "03");
    }}
    onPaste={(e)=>{
      e.preventDefault()
      return false;
    }} 
    onCopy={(e)=>{
      e.preventDefault()
      return false;
    }}
    ></textarea>
    <div className="wordCount">
        <span id="min_03">0</span>
        <span id="max_03">/ {props.minCount} to {props.maxCount}</span>
    </div>

    <p><br/></p>

    <h3>{props.q4}</h3>
    <textarea className="user_input" id="04" spellCheck={spellCheck} onInput={(e) => {
        document.getElementById("min_04").innerHTML = e.target.value.length;
    }}
    onKeyUp={(event) => {
        addKeyEvent(1, event, "04");
    }}
    onKeyDown={(event) => {
        addKeyEvent(0, event, "04");
    }}
    onPaste={(e)=>{
      e.preventDefault()
      return false;
    }} 
    onCopy={(e)=>{
      e.preventDefault()
      return false;
    }}
    ></textarea>
    <div className="wordCount">
        <span id="min_04">0</span>
        <span id="max_04">/ {props.minCount} to {props.maxCount}</span>
    </div>

    <p><br/></p>

    <h3>{props.q5}</h3>
    <textarea className="user_input" id="05" spellCheck={spellCheck} onInput={(e) => {
        document.getElementById("min_05").innerHTML = e.target.value.length;
    }}
    onKeyUp={(event) => {
        addKeyEvent(1, event, "05");
    }}
    onKeyDown={(event) => {
        addKeyEvent(0, event, "05");
    }}
    onPaste={(e)=>{
      e.preventDefault()
      return false;
    }} 
    onCopy={(e)=>{
      e.preventDefault()
      return false;
    }}
    ></textarea>
    <div className="wordCount">
        <span id="min_05">0</span>
        <span id="max_05">/ {props.minCount} to {props.maxCount}</span>
    </div>

    <p><br/></p>
    <div id="shownButton"> <button id="submitButton" type="button" onClick={(e)=>{
        if(blurbType == true)
            verifyButton();
        else
            submitButton();
        //setSpellCheck(stats);
    }}>Verify Completion</button> </div>
    <div id="hiddenButton"> 
        <button id="submitButton2" type="button" onClick={submitButton}>Spellcheck and Submit</button>
    </div>
    </>);
};