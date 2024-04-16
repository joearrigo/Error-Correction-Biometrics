import React, {useEffect, useState} from "react"
import {createRoot} from "react-dom/client";
import Navbar from "./Components/Navbar"

function submitButton(){
    let buttonReq = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    };

    console.log("pressed");

    fetch(window.location.href + "/waiverAccept", buttonReq).then((response) => {
        response.text().then((res) =>{
            if(response.status == 201)
                window.location.replace('../qa1.html');
        });
    });
}

function WaiverPage() {

    const [enable, setEnable] = useState(true);

    return (<>
    <Navbar href="" pageName="Waiver"/>

    <p><br/></p>

    <p>Please read and accept the agreement below to participate in the experiment.</p>
    <h1>Participation Agreement</h1>
    <p><br></br> By checking 'I agree to these terms' below, I (the user) agree that:</p>
    <ul>
        <li>I consent that statistics about my typing will be anonymized and recorded for use in the training and testing of an experimental machine learning model.</li>
        <li>I consent that any data collected from my participation in this experiment, as well as any model training performed using that data, will not be used for any purpose outside of the scope of this research project.</li>
        <li>Only I will participate in this experiment with the access code I entered to log in, using a desktop or laptop PC and with no help from others.</li>
        <li>I will attempt to answer all prompts in good faith and will complete this activity to the best of my ability.</li>
    </ul>
    <p><br/></p>
    <label><input type="checkbox" onChange={(ev) => {
        if (ev.currentTarget.checked) {
            setEnable(false);
          } else {s
            setEnable(true);
          }
    }} />I agree to the terms above.</label>
    <p><br/></p>
    <button id="submitButton" type="button" onClick={submitButton} disabled={enable}>Agree and Submit</button>
    </>);
}

const root = document.getElementById('root')
createRoot(root).render(<WaiverPage/>);