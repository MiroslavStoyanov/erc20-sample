import { ethers } from "hardhat";

async function main() {
  const contractName = 'MsToken';
  const contractSymbol = 'MST'
  const initialSupply = ethers.utils.parseEther('1000');

  const MsTokenTemplate = await ethers.getContractFactory(contractName);

  const msToken = await MsTokenTemplate.deploy(contractName, contractSymbol, initialSupply);
  await msToken.deployed();

  console.log(`Contract '${contractName}' deployed to address:`, msToken.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
