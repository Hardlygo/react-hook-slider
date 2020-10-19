import React from "react";
import "./App.css";
import useSlider from "./useSlider";

function App() {
  const [hotAreaProps, thumbProps, sliderState] = useSlider({
    horizon: true,
    initRatio: 0.5,
  });

  const { ratio, setRatio } = sliderState;

  return (
    <div className="App">
      <button
        onClick={() => {
          setRatio(0);
        }}
      >
        0
      </button>
      <button
        onClick={() => {
          setRatio(0.5);
        }}
      >
        0.5
      </button>
      <button
        onClick={() => {
          setRatio(1);
        }}
      >
        1
      </button>
      <div className="val">{`${ratio}`}</div><br/>

      <div className="slider">
        <div className="track" {...hotAreaProps}></div>
        <div className="has" style={{ width: `${ratio * 100}%` }}>
          <div className="ctrl" {...thumbProps}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
