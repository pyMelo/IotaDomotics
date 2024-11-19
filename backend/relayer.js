require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' })); 
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
const relayerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [
    {
        "inputs": [],
        "name": "lightIntensity",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isLightOn",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_intensity", "type": "uint256" }],
        "name": "setLightIntensity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "turnLightOff",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const lightContract = new ethers.Contract(contractAddress, contractABI, relayerWallet);

app.post('/relay', async (req, res) => {
    const { isOn, intensity } = req.body;

    console.log(`Received request - Light On: ${isOn}, Intensity: ${intensity}%`);

    try {
        let tx;
        if (isOn) {
            tx = await lightContract.setLightIntensity(intensity);
        } else {
            tx = await lightContract.turnLightOff();
        }

        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        const gasUsed = receipt.gasUsed;
        const gasPrice = tx.gasPrice;
        const transactionCost = gasUsed * gasPrice;
        const transactionCostInEth = ethers.formatEther(transactionCost);

        const balance = await provider.getBalance(relayerWallet.address);
        const balanceInEth = ethers.formatEther(balance);

        console.log(`Transaction cost: ${transactionCostInEth} SMR`);
        console.log(`Remaining balance: ${balanceInEth} SMR`);

        res.json({
            status: "Success",
            txHash: tx.hash,
            transactionCost: transactionCostInEth,
            remainingBalance: balanceInEth,
        });
    } catch (error) {
        console.error("Error relaying transaction:", error);
        res.status(500).json({ error: "Transaction failed" });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Relayer running on http://localhost:${PORT}`));
