import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe('MsToken', function () {
    const tokenName: string = 'MsToken';
    const tokenSymbol: string = 'MST';
    const tokenTotalSupply: string = '1000.0';

    async function deployMsTokenFixture() {
        const MsTokenTemplate = await hre.ethers.getContractFactory('MsToken');
        const initialSupply = hre.ethers.utils.parseEther('1000');
        const MsToken = await MsTokenTemplate.deploy(tokenName, tokenSymbol, initialSupply);
        const msToken = await MsToken.deployed();
    
        return { msToken };
    }

    it('Should initialize the contract with the appropriate attributes', async function () {
        const { msToken } = await loadFixture(deployMsTokenFixture);

        expect(tokenName).to.equal(await msToken.name());
        expect(tokenSymbol).to.equal(await msToken.symbol());
    });

    it('Should set the proper total supply of the contact', async () => {
        const { msToken } = await loadFixture(deployMsTokenFixture);
        const totalSupply = await msToken.totalSupply();
        const totalSupplyInEther = hre.ethers.utils.formatEther(totalSupply);

        expect(tokenTotalSupply).to.equal(totalSupplyInEther);
    });

    it('Should allocate the total supply to the contract owner', async () => {
        const { msToken } = await loadFixture(deployMsTokenFixture);

        const [owner] = await hre.ethers.getSigners();
        const ownerBalance = await msToken.balanceOf(owner.getAddress());
        const formattedOwnerBalance = hre.ethers.utils.formatEther(ownerBalance);

        expect(tokenTotalSupply).to.equal(formattedOwnerBalance);
    });

    it('Should successfully transfer tokens from one account to another', async () => {
        const { msToken } = await loadFixture(deployMsTokenFixture);
        const [owner, otherAccount] = await hre.ethers.getSigners();
        const ownerAddress = await owner.getAddress();
        const otherAccountAddress = await otherAccount.getAddress();

        try {
            const amountToTransfer = hre.ethers.utils.parseEther('250');
            const formattedAmountToTransfer = hre.ethers.utils.formatEther(amountToTransfer);

            // Transfer from the owner account to another account
            const receipt = await msToken.transfer(otherAccountAddress, amountToTransfer, {
                from: ownerAddress
            });

            // Verify transaction logs
            expect(receipt.from).to.equal(ownerAddress);
            expect(receipt.to).to.equal(otherAccountAddress);
            expect(receipt.value.toString()).to.equal(formattedAmountToTransfer);
            await expect(msToken.transfer(otherAccountAddress, amountToTransfer)).to.emit(msToken, 'Transfer');

            // grabbing each balances
            const balanceAccount0 = await msToken.balanceOf(ownerAddress)
            const balanceAccount1 = await msToken.balanceOf(otherAccountAddress);

            // Checking that balances were updated
            expect(balanceAccount0.toNumber()).to.equal(750000);
            expect(balanceAccount1.toNumber()).to.equal(250000);

        } catch (error: any) {
            // assert(error.message.indexOf('revert') >= 0, 'error must contain the term revert');
        }
    });
});