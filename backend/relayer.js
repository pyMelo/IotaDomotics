require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Set up provider and relayer wallet
const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
const relayerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract setup
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = 
[
    {
        "inputs": [
            { "internalType": "uint256", "name": "lightId", "type": "uint256" },
            { "internalType": "bool", "name": "isOn", "type": "bool" }
        ],
        "name": "setLight",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "heaterId", "type": "uint256" },
            { "internalType": "bool", "name": "isOn", "type": "bool" }
        ],
        "name": "setHeater",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "doorId", "type": "uint256" },
            { "internalType": "bool", "name": "isOpen", "type": "bool" }
        ],
        "name": "setDoor",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "lightId", "type": "uint256" }],
        "name": "getLight",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "heaterId", "type": "uint256" }],
        "name": "getHeater",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "doorId", "type": "uint256" }],
        "name": "getDoor",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    }
];


const smartHomeContract = new ethers.Contract(contractAddress, contractABI, relayerWallet);

// API endpoint for handling relay
app.post('/relay', async (req, res) => {
    const { type, id, isOn, isOpen } = req.body;

    console.log(`Received request: Type=${type}, ID=${id}, isOn=${isOn}, isOpen=${isOpen}`);

    try {
        let tx;

        if (type === 'light') {
            tx = await smartHomeContract.setLight(id, isOn, { gasLimit: 300000 });
        } else if (type === 'heater') {
            tx = await smartHomeContract.setHeater(id, isOn, { gasLimit: 300000 });
        } else if (type === 'door') {
            tx = await smartHomeContract.setDoor(id, isOpen, { gasLimit: 300000 });
        } else {
            throw new Error("Invalid type. Must be 'light', 'heater', or 'door'.");
        }

        console.log("Transaction sent:", tx.hash);
        const balance = await provider.getBalance(relayerWallet.address);
        console.log("Wallet balance:", ethers.formatEther(balance));

        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        res.json({ status: "Success", txHash: tx.hash });
    } catch (error) {
        console.error("Error relaying transaction:", {
            action: error.action,
            data: error.data,
            reason: error.reason || "Unknown reason",
            transaction: error.transaction,
            code: error.code,
        });
        res.status(500).json({ error: error.reason || "Transaction failed", details: error });
    }
});

app.get('/state', async (req, res) => {
    try {
        const lightStates = {};
        const heaterStates = {};
        const doorStates = {};

        // Fetch light states
        for (let i = 0; i < 3; i++) { // Assuming 3 lights
            lightStates[`light${i + 1}`] = await smartHomeContract.getLight(i);
        }   

        // Fetch heater states
        for (let i = 0; i < 2; i++) { // Assuming 2 heaters
            heaterStates[`heater${i + 1}`] = await smartHomeContract.getHeater(i);
        }

        // Fetch door states
        for (let i = 0; i < 3; i++) { // Assuming 3 doors
            doorStates[`door${i + 1}`] = await smartHomeContract.getDoor(i);
        }

        res.json({ lights: lightStates, heaters: heaterStates, doors: doorStates });
    } catch (error) {
        console.error("Error fetching state:", error);
        res.status(500).json({ error: "Failed to fetch state", details: error.message });
    }
});


// Start the server
const PORT = 4000;
app.listen(PORT, () => console.log(`Relayer running on http://localhost:${PORT}`));
