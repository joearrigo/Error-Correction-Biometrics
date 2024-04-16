import {createRoot} from "react-dom/client";
import QaPage from "./Components/QaPage";


function Qa1Page(props) {

    return (<>
    <QaPage minCount="100" maxCount="130" pName="Questions Page 1"
    q1="1. What is your favorite book and why?"
    q2="2. What is your favorite historical era and why?"
    q3="3. What is your favorite dinner to eat in the Summer? Why?"
    q4="4. What's your favorite genre of music and why?"
    q5="5. Do you have any special skills? Explain."
    ></QaPage>
    </>);
}


const root = document.getElementById('root')
createRoot(root).render(<Qa1Page/>);