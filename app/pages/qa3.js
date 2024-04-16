import {createRoot} from "react-dom/client";
import QaPage from "./Components/QaPage";


function Qa3Page(props) {

    return (<>
    <QaPage minCount="100" maxCount="130" pName="Questions Page 3"
    q1="1. Can you describe a time you faced your fears?"
    q2="2. What is your favorite song and why?"
    q3="3. What type of science fascinates you the most? Why?"
    q4="4. What is your favorite lunch in Autumn? Why?"
    q5="5. If you could have any superpower, what would it be and why?"
    ></QaPage>
    </>);
}


const root = document.getElementById('root')
createRoot(root).render(<Qa3Page/>);