import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from "react";
import { Stage, Layer, Image, Arc, Rect, Circle, Text } from "react-konva";
import useImage from "use-image";
import './App.css';

function App() {
  const [plantImage] = useImage("/piantinacasa.png");

  const [windows, setWindows] = useState({ window1: false, window2: false, window3: false, window4: false });
  const [windowOpenness, setWindowOpenness] = useState({ window1: 0, window2: 0, window3: 0, window4: 0 });
  const [heaters, setHeaters] = useState({ heater1: false, heater2: false });
  const [heaterTemps, setHeaterTemps] = useState({ heater1: 20, heater2: 20 });
  const [tv, setTv] = useState(false);
  const [lamps, setLamps] = useState({ lamp1: false, lamp2: false, lamp3: false });
  const [lampIntensity, setLampIntensity] = useState({ lamp1: 0, lamp2: 0, lamp3: 0 });
  const [selectedElement, setSelectedElement] = useState(null);
  const [doors, setDoors] = useState({ door1: false, door2: false, door3: false, door4: false, door5: false });

  const toggleDoorColor = (id) => {
    setDoors({
      ...doors,
      [id]: !doors[id],
    });
  };

  const toggleHeater = (id) => setHeaters({ ...heaters, [id]: !heaters[id] });
  const toggleWindow = (id) => setWindows({ ...windows, [id]: !windows[id] });
  const toggleTv = () => setTv(!tv);
  const toggleLamp = (id) => setLamps({ ...lamps, [id]: !lamps[id] });

  const handleHeaterClick = (id) => {
    setSelectedElement({ type: 'heater', id });
  };

  const handleWindowClick = (id) => {
    setSelectedElement({ type: 'window', id });
  };

  const handleLampClick = (id) => {
    setSelectedElement({ type: 'lamp', id });
  };

  const interpolateColor = (temperature) => {
    const minTemp = 10;
    const maxTemp = 30;
    const ratio = (temperature - minTemp) / (maxTemp - minTemp);

    const startColor = { r: 255, g: 223, b: 0 };
    const endColor = { r: 255, g: 0, b: 0 };

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

    return `rgb(${r},${g},${b})`;
  };

  const interpolateLampColor = (intensity) => {
    const minIntensity = 0;
    const maxIntensity = 100;
    const ratio = intensity / maxIntensity;

    const startColor = { r: 200, g: 200, b: 200 };
    const endColor = { r: 255, g: 255, b: 0 };

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

    return `rgb(${r},${g},${b})`;
  };

  const getHeaterColor = (id) => {
    return heaters[id] ? interpolateColor(heaterTemps[id]) : "gray";
  };

  const renderControlPanel = () => {
    if (!selectedElement) return null;

    if (selectedElement.type === 'heater') {
      const heaterId = selectedElement.id;
      const isOn = heaters[heaterId];
      const temperature = heaterTemps[heaterId];
      
      return (
        <div className="control-panel">
          <h4>Termosifone {heaterId}</h4>
          <p>Temperatura: {temperature}°C</p>
          <input
            type="range"
            min="10"
            max="30"
            value={temperature}
            onChange={(e) => setHeaterTemps({ ...heaterTemps, [heaterId]: parseInt(e.target.value) })}
          />
          <button onClick={() => toggleHeater(heaterId)} className="btn btn-primary mt-2">
            {isOn ? "Spegni" : "Accendi"}
          </button>
        </div>
      );
    }

    if (selectedElement.type === 'lamp') {
      const lampId = selectedElement.id;
      const intensity = lampIntensity[lampId];

      return (
        <div className="control-panel">
          <h4>Lampada {lampId}</h4>
          <p>Intensità: {intensity}%</p>
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setLampIntensity({ ...lampIntensity, [lampId]: parseInt(e.target.value) })}
          />
        </div>
      );
    }

    if (selectedElement.type === 'window') {
      const windowId = selectedElement.id;
      const openness = windowOpenness[windowId];

      return (
        <div className="control-panel">
          <h4>Finestra {windowId}</h4>
          <p>Apertura: {openness}%</p>
          <input
            type="range"
            min="0"
            max="100"
            value={openness}
            onChange={(e) => setWindowOpenness({ ...windowOpenness, [windowId]: parseInt(e.target.value) })}
          />
          <button onClick={() => toggleWindow(windowId)} className="btn btn-secondary mt-2">
            {windows[windowId] ? "Chiudi" : "Apri"}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="d-flex">
      <div className="sidebar">
        <header className="header">
          <h1 style={{ fontFamily: "Arial, sans-serif", fontSize: "40px", fontWeight: "bold", color: "#333" }}>Smart Home Control Panel</h1>
          <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: "15px", fontWeight: "bold", color: "#333" }}>Optimized with Smart Contract.</h2>
          <div className="line"></div>
        </header>
        {renderControlPanel()}
      </div>

      <div className="container">
        <Stage width={800} height={600} className="stage-container">
          <Layer>
            <Image image={plantImage} x={0} y={0} width={800} height={600} />

            {/* Lampade con intensità regolabile */}
            <Circle
              x={628} y={255} radius={10}
              fill={interpolateLampColor(lampIntensity.lamp1)}
              onClick={() => handleLampClick("lamp1")}
            />
            <Circle
              x={190} y={100} radius={10}
              fill={interpolateLampColor(lampIntensity.lamp2)}
              onClick={() => handleLampClick("lamp2")}
            />
            <Circle
              x={310} y={100} radius={10}
              fill={interpolateLampColor(lampIntensity.lamp3)}
              onClick={() => handleLampClick("lamp3")}
            />
            
            {/* Termosifoni con colore basato sullo stato e temperatura */}
            <Rect
              x={400} y={86}
              width={62} height={17}
              cornerRadius={5}
              fill={getHeaterColor("heater1")}
              onClick={() => handleHeaterClick("heater1")}
            />
            <Rect
              x={424} y={276}
              width={17} height={62}
              cornerRadius={5}
              fill={getHeaterColor("heater2")}
              onClick={() => handleHeaterClick("heater2")}
            />

            {/* Finestre con stato aperto/chiuso */}
            <Rect
              x={129} y={138}
              width={17} height={62}
              fill={windows.window1 ? "skyblue" : "grey"}
              onClick={() => handleWindowClick("window1")}
            />
            <Rect
              x={129} y={277}
              width={18} height={33}
              fill={windows.window2 ? "skyblue" : "grey"}
              onClick={() => handleWindowClick("window2")}
            />
            <Rect
              x={129} y={467}
              width={18} height={53}
              scaleY={-1}
              fill={windows.window3 ? "skyblue" : "grey"}
              onClick={() => handleWindowClick("window3")}
            />
            <Rect
              x={644} y={151}
              width={12} height={64}
              fill={windows.window4 ? "skyblue" : "grey"}
              onClick={() => handleWindowClick("window4")}
            />

            {/* Porte con stato aperto/chiuso */}
            <Arc
              x={369} y={265}
              innerRadius={0}
              outerRadius={35}
              angle={90}
              rotation={-90}
              scaleY={-1}
              stroke={doors.door1 ? "green" : "brown"}
              strokeWidth={4}
              onClick={() => toggleDoorColor("door1")}
            />
            <Arc
              x={393} y={265}
              innerRadius={0}
              outerRadius={35}
              angle={90}
              rotation={-90}
              stroke={doors.door2 ? "green" : "brown"}
              strokeWidth={4}
              onClick={() => toggleDoorColor("door2")}
            />
            <Arc
              x={321} y={278}
              innerRadius={0}
              outerRadius={35}
              angle={90}
              rotation={-180}
              scaleY={-1}
              stroke={doors.door3 ? "green" : "brown"}
              strokeWidth={4}
              onClick={() => toggleDoorColor("door3")}
            />
            <Arc
              x={321} y={367}
              innerRadius={0}
              outerRadius={35}
              angle={90}
              rotation={-180}
              scaleY={-1}
              stroke={doors.door4 ? "green" : "brown"}
              strokeWidth={4}
              onClick={() => toggleDoorColor("door4")}
            />
            <Arc
              x={376} y={514}
              innerRadius={0}
              outerRadius={35}
              angle={90}
              scaleY={-1}
              rotation={-90}
              stroke={doors.door5 ? "green" : "brown"}
              strokeWidth={4}
              onClick={() => toggleDoorColor("door5")}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default App;
