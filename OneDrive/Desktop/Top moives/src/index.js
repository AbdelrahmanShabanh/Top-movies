import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import StarRating from "./starRating";
// import Text from "./starRating";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <Text/> */}
    {/* <StarRating maxRating={10} /> */}
    {/* <StarRating maxRating={10} />
    <StarRating
      maxRating={5}
      color="red"
      size={24}
      className="test"
      messages={["terrible", "bad", "okay", "good", "amazing"]}
    /> */}
    {/* this helps in props reuseabilty for other developers to custumize the componenet */}
  </React.StrictMode>
);
