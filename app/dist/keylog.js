keyEvents = []

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

//TODO: ADD TYPO DETECTION-- DETECT IF EVENT HAPPENS INSIDE OF A TYPO WORD AND NOTE THAT IN MAKEPAIR()
//TODO: ADD MOUSE TRACKING WITH TYPO DETECTION ALSO

function makePair(eventType, event, id) {
    info = {
        id: id,
        typoMode: document.getElementById(id).className, 
    }
    keyTyped = {
        keyCode: event.keyCode,
        code: event.code,
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        repeat: event.repeat
    }
    let selStart = document.getElementById(id).selectionStart
    let selEnd = document.getElementById(id).selectionEnd
    let selLen = selEnd - selStart

    selectionInfo = {
        word: getWordAt(document.getElementById(id).value, selStart), //If on the left of the whitespace, it gives the preceding word. If to the right, it gives the following word.
        before: document.getElementById(id).value.substr(selStart, 1),
        after: document.getElementById(id).value.substr(selStart-1, 1),
        entireSelection: document.getElementById(id).value.substr(selStart, selLen), //Selection end is the index after the substring ends.
        selectionSize: selLen
    }
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

//Different error-correction behavior classifications:
//  1) Single backspace                                                         done
//  2) Single delete                                                            done
//  3) Held backspace (several key_down for backspace in a row, but no key_up)  done
//  4) Held delete                                                              done
//  5) Repeated backspace (key_down and key_up several times)                   done
//  6) Repeated delete                                                          done
//  7) Control + backspace                                                      done
//  8) Control + delete                                                         done
//  9) Selection overwrite (select text, then start typing letters)             
// 10) Selection backspace                                                      
// 11) Selection delete     
// 12) Constructive correction (i.e. word is 'h|me', user types 'o', fixing typo)                                                    

//When monitoring normal text, record the following at least:                                   
//  1) Modifier keys (Control or shift) --> Can be ascertained after                                done

//When monitoring backspace, delete, or selected text, record the following:                    
//  1) Word (or space) before cursor (i.e. 'he|llo', before is 'he'; ' |hello', before is ' ')      
//  2) Word (or space) after cursor (i.e. 'he|llo', after is 'llo'; 'hello| ', after is ' ')        
//  3) Selected text block                                                                      
//  4) Selection size                                                                           

textBoxes = document.getElementsByClassName("user_input");

console.log('hi');
Array.from(textBoxes).forEach((box) => {
    console.log(box);
    box.addEventListener("keyup", (event) => {
        addKeyEvent(1, event, box.id) //Event type 1 is keyup
    });

    box.addEventListener("keydown", (event) => {
        addKeyEvent(0, event, box.id) //Event type 0 is keydown
      });

});