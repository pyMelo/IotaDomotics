require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import CORS
const { ethers } = require('ethers');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' })); // Enable CORS for requests from localhost:3000
app.use(express.json());

// Set up provider and owner wallet (acting as relayer)
const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
const relayerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [
    {
        "inputs": [{ "internalType": "uint256", "name": "_intensity", "type": "uint256" }],
        "name": "setLightIntensity",
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
        // Send transaction to update the light intensity
        const tx = await lightContract.setLightIntensity(isOn ? intensity : 0);
        console.log("Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        // Calculate transaction cost
        const gasUsed = receipt.gasUsed;
        const gasPrice = tx.gasPrice;
        const transactionCost = gasUsed * gasPrice; // Total cost in wei (ethers v6 allows arithmetic with BigInts)

        // Convert transaction cost to Ether (or the native token of the network)
        const transactionCostInEth = ethers.formatEther(transactionCost);

        // Get remaining balance of the wallet
        const balance = await provider.getBalance(relayerWallet.address);
        const balanceInEth = ethers.formatEther(balance);

        // Log transaction cost and remaining balance
        console.log(`Transaction cost: ${transactionCostInEth} SMR`);
        console.log(`Remaining balance: ${balanceInEth} SMR`);

        res.json({
            status: "Success",
            txHash: tx.hash,
            transactionCost: transactionCostInEth,
            remainingBalance: balanceInEth
        });
    } catch (error) {
        console.error("Error relaying transaction:", error);
        res.status(500).json({ error: "Transaction failed" });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Relayer running on http://localhost:${PORT}`));