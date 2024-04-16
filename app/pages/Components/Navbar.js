import React, {useEffect} from "react"

export default function Navbar(props){
    useEffect(() => {
        if(document.cookie.includes("uname")){
            document.getElementById('logout').disabled = false;
            document.getElementById('logout').style.display = "block";
        }
        else{
            document.getElementById('logout').disabled = true;
            document.getElementById('logout').style.display = "none";
        }
     });

    return (<>
    <div className="leftNav">
        <h1>Joseph Arrigo: Research Portal</h1>
        <p><em>{props.pageName}  -  User: {document.cookie.split("; ").find((row) => row.startsWith("uname="))?.split("=")[1]}</em></p>
    </div>
    <div className="rightNav">
        <button id="logout" onClick={(e) => {
            let buttonReq = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            };
            fetch(window.location.href + "/logout", buttonReq).then((response) => {
                console.log("running");
                console.log(response.status);
                window.location.replace('../index.html');
            })
        }}
        >Logout</button>
    </div>
    </>);
}