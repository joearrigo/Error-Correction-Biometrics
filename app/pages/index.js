import React from "react"
import {createRoot} from "react-dom/client";
import Navbar from "./Components/Navbar"

function submitButton(){
    let buttonReq = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({input: document.getElementById("code_input").value})
    };
    
    fetch(window.location.href + "/login", buttonReq).then((response) => {
        response.json().then((res) =>{
            if(res.failCode == 0)
                document.getElementById("status").innerText = "Invalid code."
            else if(res.failCode == 1)
                document.getElementById("status").innerText = "Code has already been used."
            else {
                document.getElementById("status").innerText = ""
                document.getElementById("code_input").disabled = true;
                document.getElementById("submitButto").disabled = true;


            if(document.cookie.includes("uname")){
                document.getElementById('logout').disabled = false;
                document.getElementById('logout').style.display = "block";
            }
            else{
                document.getElementById('logout').disabled = true;
                document.getElementById('logout').style.display = "none";
            }

                window.location.replace('../waiver.html');
            }
        });
    });
}

function IndexPage() {
    return (<>
    <Navbar href="settings.html" pageName="Home"/>

    <p><br/></p>
    <p>Welcome to the research portal. Please enter your access code.</p>
    <input type="text" id="code_input" name="Access Code"/>
    <button type="button" id="submitButto" onClick={submitButton}>Submit</button>
    <form id="nextContainer" action="/waiver.html">
    </form>
    <p id="status"></p>
    </>);
}

const root = document.getElementById('root')
createRoot(root).render(<IndexPage/>);