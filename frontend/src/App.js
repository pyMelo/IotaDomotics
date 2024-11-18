import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

const App = () => {
    const [isOn, setIsOn] = useState(false);
    const [intensity, setIntensity] = useState(50); // UI-controlled value
    const [confirmedIntensity, setConfirmedIntensity] = useState(0); // Blockchain-confirmed value
    const [isLoading, setIsLoading] = useState(false); // Show rotating animation
    const [showPopup, setShowPopup] = useState(false); // Show popup window after slider release

    const debounceTimeout = useRef(null); // Timeout for debouncing

    const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_SHIMMER_RPC_URL || "https://json-rpc.evm.testnet.shimmer.network");
    const contractAddress = "0x1C44510e244dB511c08743A96cDb3f9ed3620f0c";
    const contractABI = [
        {
            "inputs": [],
            "name": "lightIntensity",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    useEffect(() => {
        const fetchContractState = async () => {
            try {
                const intensityFromContract = await contract.lightIntensity();
                const currentIntensity = parseInt(intensityFromContract.toString(), 10);

                setConfirmedIntensity(currentIntensity);
                setIntensity(currentIntensity);
                setIsOn(currentIntensity > 0);
            } catch (error) {
                console.error("Failed to fetch contract state:", error);
            }
        };

        fetchContractState();
    }, []); // Run only once when the component mounts

    const sendToRelayer = async (newIntensity) => {
        setShowPopup(true); // Show the popup once the transaction starts
        setIsLoading(true); // Show rotating animation
        try {
            const response = await fetch("http://localhost:4000/relay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isOn: true, intensity: newIntensity }),
            });
            const data = await response.json();
            console.log("Transaction successful:", data.txHash);

            const intensityFromContract = await contract.lightIntensity();
            const confirmed = parseInt(intensityFromContract.toString(), 10);

            setConfirmedIntensity(confirmed);
        } catch (error) {
            console.error("Failed to update intensity:", error);
        } finally {
            setIsLoading(false); // Stop animation
            setShowPopup(false); // Close the popup
        }
    };

    const handleIntensityChange = (e) => {
        const newIntensity = parseInt(e.target.value, 10);
        setIntensity(newIntensity);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Debounce to only send the transaction after the user has released the slider
        debounceTimeout.current = setTimeout(() => {
            if (isOn) {
                sendToRelayer(newIntensity);
            }
        }, 500);
    };

    const toggleLight = () => {
        const newStatus = !isOn;
        setIsOn(newStatus);

        setShowPopup(true); // Show popup on light toggle
        setIsLoading(true); // Show animation for turning on/off

        if (!newStatus) {
            setIntensity(0);
            sendToRelayer(0);
        } else {
            setTimeout(() => {
                setIsLoading(false);
                setShowPopup(false);
            }, 1000); // Simulate delay for turning on
        }
    };

    const getLightColor = () => {
        if (!isOn) return "gray";

        const minColor = { r: 255, g: 230, b: 128 }; // Soft yellow
        const maxColor = { r: 255, g: 204, b: 0 }; // Bright yellow

        const r = minColor.r + ((maxColor.r - minColor.r) * (confirmedIntensity / 100));
        const g = minColor.g + ((maxColor.g - minColor.g) * (confirmedIntensity / 100));
        const b = minColor.b + ((maxColor.b - minColor.b) * (confirmedIntensity / 100));

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(to bottom, #6a0dad, #f4f4f9)", // Themed background
                position: "relative",
            }}
        >
            <div
                style={{
                    padding: "40px",
                    backgroundColor: "#6a0dad",
                    borderRadius: "16px",
                    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)",
                    textAlign: "center",
                    width: "400px",
                }}
            >
                <h2 style={{ fontSize: "2rem", color: "#fff", marginBottom: "30px" }}>Light Control</h2>
                <button
                    onClick={toggleLight}
                    style={{
                        padding: "12px 30px",
                        fontSize: "1.2rem",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#fff",
                        color: "#6a0dad",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: isOn ? "0px 4px 12px rgba(106, 13, 173, 0.4)" : "none",
                        transition: "all 0.3s ease",
                        marginBottom: "30px",
                    }}
                >
                    {isOn ? "Turn Light Off" : "Turn Light On"}
                </button>

                {isOn && (
                    <>
                        <p style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "15px" }}>
                            Intensity: {intensity}%
                        </p>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={intensity}
                            onChange={handleIntensityChange}
                            style={{
                                width: "90%",
                                height: "6px",
                                marginBottom: "40px",
                                background: "#fff",
                                accentColor: "#fff",
                                borderRadius: "5px",
                            }}
                        />
                    </>
                )}

                <div
                    style={{
                        width: "150px",
                        height: "150px",
                        backgroundColor: getLightColor(),
                        borderRadius: "50%",
                        margin: "40px auto 0",
                        boxShadow: isOn ? `0 0 ${confirmedIntensity * 1.2}px ${confirmedIntensity * 0.6}px ${getLightColor()}` : "none",
                        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
                        animation: isLoading ? "spin 1s linear infinite" : "none", // Rotate when loading
                    }}
                />
            </div>

            {/* Popup Window for Updating */}
            {showPopup && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            padding: "30px",
                            borderRadius: "12px",
                            textAlign: "center",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        <h3 style={{ marginBottom: "15px", color: "#6a0dad" }}>Updating...</h3>
                        <p style={{ marginBottom: "10px", color: "#333" }}>
                            Please wait while we process your changes.
                        </p>
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                border: "4px solid #6a0dad",
                                borderTop: "4px solid transparent",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite", // Smooth spinning animation
                                margin: "0 auto",
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
