// Load environment variables from .env file
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

// Optional: Debugging line to check if PRIVATE_KEY is loaded

module.exports = {
  solidity: "0.8.18", // Specify the Solidity version
  networks: {
    shimmerTestnet: {
      url: "https://json-rpc.evm.testnet.shimmer.network", // Shimmer EVM RPC URL
      accounts: [`0x${process.env.PRIVATE_KEY}`]    },
  },
  paths: {
    sources: "./contracts", // Replace with your contracts directory path
  },
};