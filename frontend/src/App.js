import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { ethers } from 'ethers';

const App = () => {
    const [isOn, setIsOn] = useState(false);
    const [intensity, setIntensity] = useState(50);
    const [confirmedIntensity, setConfirmedIntensity] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Connect to Shimmer or other network via JSON-RPC provider
    const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_SHIMMER_RPC_URL || "https://json-rpc.evm.testnet.shimmer.network");

    const contractAddress = "0x496e99977fFd702Bee98a194937c507fAc074D12"; // Replace with your deployed contract address
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

    // Fetch the current state from the contract when the component mounts
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
    }, [contract]);

    // Debounce function for sending updates to the relayer
    const debouncedSendToRelayer = debounce(async (newIntensity) => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:4000/relay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isOn: true, intensity: newIntensity }),
            });
            const data = await response.json();

            setConfirmedIntensity(newIntensity);
            setIsLoading(false);
            console.log("Transaction successful:", data.txHash);
        } catch (error) {
            console.error("Failed to update intensity:", error);
            setIsLoading(false);
        }
    }, 500);

    // Send intensity to relayer on changes
    useEffect(() => {
        if (isOn) {
            debouncedSendToRelayer(intensity);
        }
        return () => debouncedSendToRelayer.cancel();
    }, [intensity, isOn]);

    const handleIntensityChange = (e) => {
        const newIntensity = parseInt(e.target.value, 10);
        setIntensity(newIntensity);
    };

    const toggleLight = () => {
        const newStatus = !isOn;
        setIsOn(newStatus);
        if (!newStatus) {
            debouncedSendToRelayer(0);
        }
    };

    const getLightColor = () => {
        if (!isOn) return "gray";

        const minColor = { r: 255, g: 230, b: 128 };
        const maxColor = { r: 255, g: 204, b: 0 };

        const r = minColor.r + ((maxColor.r - minColor.r) * (confirmedIntensity / 100));
        const g = minColor.g + ((maxColor.g - minColor.g) * (confirmedIntensity / 100));
        const b = minColor.b + ((maxColor.b - minColor.b) * (confirmedIntensity / 100));

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h2>Light Control</h2>
            <button onClick={toggleLight}>
                {isOn ? "Turn Light Off" : "Turn Light On"}
            </button>
            
            {isOn && (
                <>
                    <p>Intensity: {intensity}%</p>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={intensity}
                        onChange={handleIntensityChange}
                    />
                </>
            )}

            <div
                style={{
                    marginTop: "20px",
                    width: "100px",
                    height: "100px",
                    backgroundColor: getLightColor(),
                    borderRadius: "50%",
                    boxShadow: isOn ? `0px 0px ${confirmedIntensity * 0.5}px ${confirmedIntensity * 0.2}px ${getLightColor()}` : "none",
                    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                }}
            >
                {isLoading && <p style={{ textAlign: "center", color: "#999" }}>Updating...</p>}
            </div>
        </div>
    );
};

export default App;
