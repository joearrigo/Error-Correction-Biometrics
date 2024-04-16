import {createRoot} from "react-dom/client";
import QaPage from "./Components/QaPage";


function Qa2Page(props) {

    return (<>
    <QaPage minCount="100" maxCount="130" pName="Questions Page 2"
    q1="1. What is your favorite movie genre and why?"
    q2="2. When was the last time you went to a book store? What did you buy?"
    q3="3. Do you prefer paper or digital notes? Why?"
    q4="4. What is your favorite breakfast in the Winter? Why?"
    q5="5. What is a place you've never been to and would like to visit? Why?"
    ></QaPage>
    </>);
}


const root = document.getElementById('root')
createRoot(root).render(<Qa2Page/>);