# Shimmer Smart Light

![License](https://img.shields.io/badge/license-MIT-green)

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Overview

This project is built using **Hardhat** and deployed on the **Shimmer Testnet**. It allows developers to manage and deploy smart contracts, providing an easy setup for Solidity-based projects.

---

## Prerequisites

Ensure you have the following installed before setting up the project:

- **Node.js** (v16 or above)
- **npm** or **yarn**
- **Hardhat**

---

## Setup Instructions

### 1. Clone the Repository

Start by cloning the repository to your local machine and navigating to the project directory:

```bash
git clone https://github.com/your-username/ShimmerSmartLight.git
cd ShimmerSmartLight
```
---

### 2. Install dependencies

Install all the dependencies of this project, backend & frontend

```bash
npm install
```

 
### 3. Create an .env file

Add the parameters like your private key and the contract deployed with the followed

```bash
PRIVATE_KEY= "your private key"
CONTRACT_ADDRESS= "your contract"
NETWORK_URL=https://json-rpc.evm.testnet.shimmer.network
PORT=4000
```

### 4. Deploy your contract

Use this command line in sequence to compile an deploy your contract in shimmerTest network. In the terminal will show up the contract address that you 
should replace in the *.env* file.

```bash
npx hardhat compile

```

```bash
npx hardhat run scripts/deploy.js --network shimmerTestnet

```

### 5. Run the project

After doing all the previous steps you can run the project and.

```bash
npm run start

```

In the terminal it will show the output given by the relayer and if the tx has succeded.


