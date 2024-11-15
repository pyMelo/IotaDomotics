import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image, Circle, Rect } from "react-konva";
import useImage from "use-image";
import debounce from 'lodash.debounce';
import './App.css';

function App() {
  const [plantImage] = useImage("/piantinacasa.png");

  const [windows, setWindows] = useState({ window1: false, window2: false, window3: false, window4: false });
  const [heaters, setHeaters] = useState({ heater1: false, heater2: false });
  const [tv, setTv] = useState(false);
  const [lights, setLights] = useState({
    light1: { isOn: false },
    light2: { isOn: false },
    light3: { isOn: false },
  });
  const [selectedElement, setSelectedElement] = useState(null);
  const [doors, setDoors] = useState({ door1: false, door2: false, door3: false, door4: false, door5: false });
  const [isLoading, setIsLoading] = useState(false);

  // Debounced function to send toggle state to relayer
  const debouncedSendToRelayer = useCallback(
    debounce(async (lightId, isOn) => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:4000/relay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lightId: parseInt(lightId.replace('light', ''), 10), isOn }),
        });
        const data = await response.json();
        console.log("Transaction successful:", data.txHash);
      } catch (error) {
        console.error("Failed to toggle light:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  // Toggle light state and send the update to the relayer
  const handleLightToggle = (lightId) => {
    const isOn = !lights[lightId].isOn;
    setLights((prevLights) => ({
      ...prevLights,
      [lightId]: { isOn },
    }));

    debouncedSendToRelayer(lightId, isOn);
  };

  const toggleWindow = (id) => setWindows({ ...windows, [id]: !windows[id] });
  const toggleHeater = (id) => setHeaters({ ...heaters, [id]: !heaters[id] });
  const toggleTv = () => setTv(!tv);
  const toggleDoorColor = (id) => setDoors({ ...doors, [id]: !doors[id] });

  const renderControlPanel = () => {
    if (!selectedElement) return null;

    if (selectedElement.type === 'lamp') {
      const lightId = selectedElement.id;
      const isOn = lights[lightId].isOn;

      return (
        <div className="control-panel">
          <h4>Lampada {lightId}</h4>
          <button onClick={() => handleLightToggle(lightId)} className="btn btn-primary mt-2">
            {isOn ? "Spegni" : "Accendi"}
          </button>
        </div>
      );
    }

    if (selectedElement.type === 'heater') {
      const heaterId = selectedElement.id;
      const isOn = heaters[heaterId];

      return (
        <div className="control-panel">
          <h4>Termosifone {heaterId}</h4>
          <button onClick={() => toggleHeater(heaterId)} className="btn btn-primary mt-2">
            {isOn ? "Spegni" : "Accendi"}
          </button>
        </div>
      );
    }

    if (selectedElement.type === 'window') {
      const windowId = selectedElement.id;
      const isOpen = windows[windowId];

      return (
        <div className="control-panel">
          <h4>Finestra {windowId}</h4>
          <button onClick={() => toggleWindow(windowId)} className="btn btn-secondary mt-2">
            {isOpen ? "Chiudi" : "Apri"}
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
          <h1 style={{ fontFamily: "Arial, sans-serif", fontSize: "40px", fontWeight: "bold", color: "#333" }}>
            Smart Home Control Panel
          </h1>
          <div className="line"></div>
        </header>
        {renderControlPanel()}
      </div>

      <div className="container">
        <Stage width={800} height={600} className="stage-container">
          <Layer>
            <Image image={plantImage} x={0} y={0} width={800} height={600} />

            {/* Lights */}
            <Circle
              x={628}
              y={255}
              radius={10}
              fill={lights.light1.isOn ? "yellow" : "gray"}
              onClick={() => setSelectedElement({ type: 'lamp', id: 'light1' })}
            />
            <Circle
              x={190}
              y={100}
              radius={10}
              fill={lights.light2.isOn ? "yellow" : "gray"}
              onClick={() => setSelectedElement({ type: 'lamp', id: 'light2' })}
            />
            <Circle
              x={310}
              y={100}
              radius={10}
              fill={lights.light3.isOn ? "yellow" : "gray"}
              onClick={() => setSelectedElement({ type: 'lamp', id: 'light3' })}
            />

            {/* Windows */}
            <Rect
              x={129}
              y={138}
              width={17}
              height={62}
              fill={windows.window1 ? "skyblue" : "grey"}
              onClick={() => setSelectedElement({ type: 'window', id: 'window1' })}
            />
            <Rect
              x={129}
              y={277}
              width={18}
              height={33}
              fill={windows.window2 ? "skyblue" : "grey"}
              onClick={() => setSelectedElement({ type: 'window', id: 'window2' })}
            />

            {/* Heaters */}
            <Rect
              x={400}
              y={86}
              width={62}
              height={17}
              fill={heaters.heater1 ? "red" : "gray"}
              onClick={() => setSelectedElement({ type: 'heater', id: 'heater1' })}
            />
            <Rect
              x={424}
              y={276}
              width={17}
              height={62}
              fill={heaters.heater2 ? "red" : "gray"}
              onClick={() => setSelectedElement({ type: 'heater', id: 'heater2' })}
            />
          </Layer>
        </Stage>
        {isLoading && <p>Loading...</p>}
      </div>
    </div>
  );
}

export default App;
