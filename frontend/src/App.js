// Frontend (React)
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css"; // Include your custom CSS if needed

const contractABI = [
  "function toggleLight(uint8 lightNumber) public",
  "function getLightsStatus() public view returns (bool, bool, bool)",
];

function App() {
  const [lights, setLights] = useState([false, false, false]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [contract, setContract] = useState(null); // State to store the contract instance

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          // Request access to MetaMask accounts
          await window.ethereum.request({ method: "eth_requestAccounts" });
          setIsMetaMaskConnected(true);
        } catch (error) {
          console.error("User denied account access to MetaMask", error);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        // Get the signer instance from the provider
        const signer = await provider.getSigner();

        // Create a contract instance with the signer
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance); // Save the contract instance to state
      } else {
        console.error("MetaMask is not installed!");
      }
    };

    initProvider();
  }, [contractAddress]);

  useEffect(() => {
    if (contract) {
      fetchLightsStatus(contract);
    }
  }, [contract]);

  const fetchLightsStatus = async (contractInstance) => {
    try {
      const status = await contractInstance.getLightsStatus();
      console.log("Fetched status:", status);
      setLights([status[0], status[1], status[2]]);
    } catch (error) {
      console.error("Error fetching lights status:", error);
    }
  };

  const toggleLight = async (lightNumber) => {
    try {
      if (!contract) return; // Ensure the contract is defined
      const tx = await contract.toggleLight(lightNumber);
      await tx.wait();
      // Update the light status after toggling
      fetchLightsStatus(contract);
    } catch (error) {
      console.error("Error toggling light:", error);
    }
  };

  return (
    <div className="container text-center mt-5">
      <h1 className="mb-4">IoT Lights Control Panel</h1>
      {!isMetaMaskConnected && (
        <div className="alert alert-warning">
          Please connect to MetaMask to use this app.
        </div>
      )}
      <div className="row justify-content-center">
        {lights.map((isOn, index) => (
          <div key={index} className="col-4 mb-3">
            <div
              className={`rounded-circle mb-2 ${
                isOn ? "bg-success" : "bg-danger"
              }`}
              style={{ width: "100px", height: "100px" }}
            ></div>
            <button
              className="btn btn-primary"
              onClick={() => toggleLight(index)}
            >
              Toggle Light {index + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;