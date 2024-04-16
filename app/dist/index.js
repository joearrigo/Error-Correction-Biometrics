import React from "react";
import { createRoot } from "react-dom/client";
import Navbar from "./Components/Navbar";
function IndexPage() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Navbar, {
    href: "settings.html",
    pageName: "index.html"
  }));
}
const root = document.getElementById('root');
createRoot(root).render( /*#__PURE__*/React.createElement(IndexPage, null));