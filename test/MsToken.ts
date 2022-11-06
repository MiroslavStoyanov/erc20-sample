import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('MsToken', function () {
    const tokenName = 'MsToken';
    const tokenSymbol = 'MST';
    const tokenDecimals = 18;

    async function deployMsTokenFixture() {
        const MsTokenTemplate = await hre.ethers.getContractFactory(tokenName);
        const [owner, addr1, addr2] = await hre.ethers.getSigners();
        const MsToken = await MsTokenTemplate.deploy(tokenName, tokenSymbol, 100);
        const msToken = await MsToken.deployed();
    
        return { msToken, owner, addr1, addr2 };
    }

    describe('Deployment', function () {
        it('Should initialize the contract with the appropriate attributes', async function () {
            const { msToken } = await loadFixture(deployMsTokenFixture);
    
            expect(tokenName).to.equal(await msToken.name());
            expect(tokenSymbol).to.equal(await msToken.symbol());
            expect(tokenDecimals).to.equal(await msToken.decimals());
        });
    
        it('Should set the proper total supply of the contact', async () => {
            const { msToken, owner } = await loadFixture(deployMsTokenFixture);

            const ownerBalance = await msToken.balanceOf(owner.address);
            expect(await msToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe('Transfer', function () {
        it('Should transfer tokens between accounts', async function () {
            const { msToken, owner, addr1, addr2 } = await loadFixture(deployMsTokenFixture);
    
            await expect(msToken.transfer(addr1.address, 50))
                .to.changeTokenBalances(msToken, [owner, addr1], [-50, 50]);

            await expect(msToken.transfer(addr1.address, 50)).to.emit(msToken, 'Transfer');

            await expect(msToken.connect(addr1).transfer(addr2.address, 50))
                .to.changeTokenBalances(msToken, [addr1, addr2], [-50, 50]);
        });

        it('Should revert the transfer if there are insufficient funds', async function () {
            const { msToken, addr1 } = await loadFixture(deployMsTokenFixture);
    
            await expect(msToken.transfer(addr1.address, 150))
                .to.be.revertedWith('Transfer amount exceeds balance');
        });
    });

    describe('Approval and allowances', function () {
        it('Should approve a spender', async function () {
            const { msToken, owner, addr1 } = await loadFixture(deployMsTokenFixture);
    
            await expect(msToken.approve(addr1.address, 50)).to.emit(msToken, 'Approval');
            
            const allowance = await msToken.allowance(owner.address, addr1.address);
            expect(allowance).to.equal(50);
        });

        it('Should increase allowance', async function () {
            const { msToken, owner, addr1 } = await loadFixture(deployMsTokenFixture);
    
            await expect(msToken.approve(addr1.address, 50)).to.emit(msToken, 'Approval');
            const allowance = await msToken.allowance(owner.address, addr1.address);
            expect(allowance).to.equal(50);

            await expect(msToken.increaseAllowance(addr1.address, 20)).to.emit(msToken, 'Approval');
            const increasedAllowance = await msToken.allowance(owner.address, addr1.address);
            expect(increasedAllowance).to.equal(70);
        });

        it('Should decrease allowance', async function () {
            const { msToken, owner, addr1 } = await loadFixture(deployMsTokenFixture);
    
            await expect(msToken.approve(addr1.address, 50)).to.emit(msToken, 'Approval');
            const allowance = await msToken.allowance(owner.address, addr1.address);
            expect(allowance).to.equal(50);

            await expect(msToken.decreaseAllowance(addr1.address, 20)).to.emit(msToken, 'Approval');
            const increasedAllowance = await msToken.allowance(owner.address, addr1.address);
            expect(increasedAllowance).to.equal(30);
        });

        it('Should not decrease allowance if the subtracted value is bigger than the allowance value', async function () {
            const { msToken, owner, addr1 } = await loadFixture(deployMsTokenFixture);
    
            await expect(msToken.approve(addr1.address, 50)).to.emit(msToken, 'Approval');
            await msToken.allowance(owner.address, addr1.address);

            await expect(msToken.decreaseAllowance(addr1.address, 60)).to.be.revertedWith('Decreased allowance is below zero');
        });
    })
});