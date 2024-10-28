require("dotenv").config();

require("@nomiclabs/hardhat-ethers");
module.exports = {
  solidity: "0.8.18",
  networks: {
    "iotaevm-testnet": {
      chainId: 1075,
      url: "https://json-rpc.evm.testnet.iotaledger.net", // Replace with your EVM-compatible IOTA/Shimmer URL
      accounts: [`${process.env.PRIVATE_KEY}`], // Add your private key in .env for security
    },
  },
};
