const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const IotaLights = await ethers.getContractFactory("IotaLights");
  const lights = await IotaLights.deploy();

  console.log("IotaLights contract deployed to:", lights.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
