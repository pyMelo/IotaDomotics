const { ethers } = require("hardhat");

async function main() {
  // Get a different account each time by using a different index
  const [deployer] = await ethers.getSigners(); // Using second account
  console.log("Deploying contracts with the account:", deployer.address);

  const IotaLights = await ethers.getContractFactory("IotaLights", deployer);
  const lights = await IotaLights.deploy();
  
  await lights.waitForDeployment();
  const address = await lights.getAddress();

  console.log("IotaLights contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});