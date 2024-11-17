import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image, Circle, Rect } from "react-konva";
import useImage from "use-image";
import debounce from 'lodash.debounce';
import './App.css';
import piantinacasa from './images/planthouse.png';


function App() {
  const [plantImage] = useImage(piantinacasa);
  const [lights, setLights] = useState({});
    const [heaters, setHeaters] = useState({});
    const [doors, setDoors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);

    // Fetch the current state from the backend on component mount
    useEffect(() => {
        const fetchState = async () => {
            try {
                const response = await fetch("http://localhost:4000/state");
                if (!response.ok) {
                    throw new Error(`Error fetching state: ${response.statusText}`);
                }
                const data = await response.json();

                setLights(data.lights);
                setHeaters(data.heaters);
                setDoors(data.doors);
            } catch (error) {
                console.error("Failed to fetch state:", error.message);
            }
        };

        fetchState();
    }, []);

    const debouncedSendToRelayer = useCallback(
        debounce(async (type, id, state) => {
            setIsLoading(true);
            try {
                const response = await fetch("http://localhost:4000/relay", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type, id, ...state }),
                });
                if (!response.ok) {
                    throw new Error(`Error toggling ${type}: ${response.statusText}`);
                }
                const data = await response.json();
                console.log("Transaction successful:", data.txHash);
            } catch (error) {
                console.error("Failed to toggle:", error.message);
            } finally {
                setIsLoading(false);
            }
        }, 500),
        []
    );

    const handleLightToggle = (lightId) => {
        const isOn = !lights[lightId];
        setLights((prevLights) => ({
            ...prevLights,
            [lightId]: isOn,
        }));

        debouncedSendToRelayer("light", parseInt(lightId.replace('light', ''), 10), { isOn });
    };

    const toggleHeater = (heaterId) => {
        const isOn = !heaters[heaterId];
        setHeaters((prevHeaters) => ({ ...prevHeaters, [heaterId]: isOn }));
        debouncedSendToRelayer("heater", parseInt(heaterId.replace('heater', ''), 10), { isOn });
    };

    const toggleDoor = (doorId) => {
        const isOpen = !doors[doorId];
        setDoors((prevDoors) => ({ ...prevDoors, [doorId]: isOpen }));
        debouncedSendToRelayer("door", parseInt(doorId.replace('door', ''), 10), { isOpen });
    };

    const renderControlPanel = () => {
        if (!selectedElement) return null;

        if (selectedElement.type === 'lamp') {
            const lightId = selectedElement.id;
            const isOn = lights[lightId];

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

        if (selectedElement.type === 'door') {
            const doorId = selectedElement.id;
            const isOpen = doors[doorId];

            return (
                <div className="control-panel">
                    <h4>Porta {doorId}</h4>
                    <button onClick={() => toggleDoor(doorId)} className="btn btn-secondary mt-2">
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
                    <h1>Smart Home Control Panel</h1>
                </header>
                {renderControlPanel()}
            </div>
            <div className="container">
                <Stage width={800} height={600}>
                    <Layer>
                        <Image image={plantImage} x={0} y={0} width={800} height={600} />

                        {/* Lights */}
                        <Circle
                            x={628}
                            y={255}
                            radius={10}
                            fill={lights.light1 ? "yellow" : "gray"}
                            onClick={() => setSelectedElement({ type: 'lamp', id: 'light1' })}
                        />
                        <Circle
                            x={190}
                            y={100}
                            radius={10}
                            fill={lights.light2 ? "yellow" : "gray"}
                            onClick={() => setSelectedElement({ type: 'lamp', id: 'light2' })}
                        />
                        <Circle
                            x={310}
                            y={100}
                            radius={10}
                            fill={lights.light3 ? "yellow" : "gray"}
                            onClick={() => setSelectedElement({ type: 'lamp', id: 'light3' })}
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

                        {/* Doors */}
                        <Rect
                            x={129}
                            y={138}
                            width={17}
                            height={62}
                            fill={doors.door1 ? "green" : "gray"}
                            onClick={() => setSelectedElement({ type: 'door', id: 'door1' })}
                        />
                        <Rect
                            x={129}
                            y={277}
                            width={18}
                            height={33}
                            fill={doors.door2 ? "green" : "gray"}
                            onClick={() => setSelectedElement({ type: 'door', id: 'door2' })}
                        />
                        <Rect
                            x={500}
                            y={300}
                            width={18}
                            height={33}
                            fill={doors.door3 ? "green" : "gray"}
                            onClick={() => setSelectedElement({ type: 'door', id: 'door3' })}
                        />
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}

export default App;
