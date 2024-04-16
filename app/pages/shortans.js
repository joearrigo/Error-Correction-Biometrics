import {createRoot} from "react-dom/client";
import {useEffect, useState} from "react"
import QaPage from "./Components/QaPage";


function ShortAnsPage(props) {

     
    useEffect(() => {
        window.executePage();
      }, []);

    return (<>
    <QaPage minCount="100" maxCount="130" pName="Short Answers" qaBlurb={false}
    q1="Statement 1"
    q2="Statement 2"
    q3="Statement 3"
    q4="Statement 4"
    q5="Statement 5"    
    ></QaPage>
    </>);
    
}


const root = document.getElementById('root')
createRoot(root).render(<ShortAnsPage/>);