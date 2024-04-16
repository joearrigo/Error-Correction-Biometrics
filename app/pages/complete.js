import React, {useEffect, useState} from "react"
import {createRoot} from "react-dom/client";
import Navbar from "./Components/Navbar"

function WaiverPage() {

    return (<>
    <Navbar href="" pageName="Finish"/>

    <p><br/></p>

    <h2>Thank you!</h2>
    <p>Thank you for participating in this experiment. If there are any updates on the status of this research in the future, you will be notified.</p>
    <p>You may now log out.</p>
    
    </>);
}

const root = document.getElementById('root')
createRoot(root).render(<WaiverPage/>);