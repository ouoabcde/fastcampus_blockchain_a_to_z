const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Lottery", () => {
    async function deployLottery() {
        const Signers = await ethers.getSigners();

        const LotteryContract = await ethers.getContractFactory("Lottery");
        const Lottery = await LotteryContract.deploy();

        return { Lottery, Signers };
    }

    let lottery;
    let signers;

    before(async () => {
        const {Lottery, Signers} = await loadFixture(deployLottery);
        lottery = Lottery;
        signers = Signers;
    });

    describe("Constructor", () => {
        it("Owner should be set to signers[0]", async () => {
            const owner = await lottery.owner();
            expect(owner).to.equal(signers[0].address);
        });
    });

    describe("Enter", () => {
        it("Should revert if a player enters less than 0.01 ether", async () => {
            const enterAmt = ethers.utils.parseEther("0.009");
            console.log(`enterAmt: ${enterAmt}`);

            await expect(lottery.connect(signers[1]).enter({ value: enterAmt })).to.be.revertedWith("msg.value should be greater than or equal to 0.01 ether");
        });

        it("Enter 5 players and check values", async () => {
            const enterAmt = ethers.utils.parseEther("0.01");
            console.log(`enterAmt: ${enterAmt}`);

            // player1 enter
            await lottery.connect(signers[1]).enter({ value: enterAmt });
            expect(await lottery.getBalance()).to.equal(enterAmt);
            expect(await lottery.getPlayers()).to.deep.equal([signers[1].address]);

            // player2 enter
            await lottery.connect(signers[2]).enter({ value: enterAmt });
            expect(await lottery.getBalance()).to.equal(enterAmt.mul(2));
            expect(await lottery.getPlayers()).to.deep.equal([signers[1].address, signers[2].address]);

            // player2 enter
            await lottery.connect(signers[3]).enter({ value: enterAmt });
            expect(await lottery.getBalance()).to.equal(enterAmt.mul(3));
            expect(await lottery.getPlayers()).to.deep.equal([signers[1].address, signers[2].address, signers[3].address]);

            // player4 enter
            await lottery.connect(signers[4]).enter({ value: enterAmt });
            expect(await lottery.getBalance()).to.equal(enterAmt.mul(4));
            expect(await lottery.getPlayers()).to.deep.equal([signers[1].address, signers[2].address, signers[3].address, signers[4].address]);

            // player5 enter
            await lottery.connect(signers[5]).enter({ value: enterAmt });
            expect(await lottery.getBalance()).to.equal(enterAmt.mul(5));
            expect(await lottery.getPlayers()).to.deep.equal([signers[1].address, signers[2].address, signers[3].address, signers[4].address, signers[5].address]);
        });
    });

    describe("PickWinner", () => {
        it("Should revert if pickWinner is called by not owner", async () => {
            // owner: signers[0]
            await expect(lottery.connect(signers[1]).pickWinner()).to.be.revertedWith("you're not owner");
        });

        it("PickWinner", async () => {
            console.log(">>> before pickWinner");

            for (let i = 1; i <= 5; i++) {
                console.log(`signers[${i}] address: ${signers[i].address}`);
            }

            const account1EthBal_bef = await ethers.provider.getBalance(signers[1].address);
            console.log(`account1's ETH balance: ${account1EthBal_bef}`);
            console.log(`account1's ETH balance: ${account1EthBal_bef / 10**18}`);
            const account2EthBal_bef = await ethers.provider.getBalance(signers[2].address);
            console.log(`account2's ETH balance: ${account2EthBal_bef}`);
            const account3EthBal_bef = await ethers.provider.getBalance(signers[3].address);
            console.log(`account3's ETH balance: ${account3EthBal_bef}`);
            const account4EthBal_bef = await ethers.provider.getBalance(signers[4].address);
            console.log(`account4's ETH balance: ${account4EthBal_bef}`);
            const account5EthBal_bef = await ethers.provider.getBalance(signers[5].address);
            console.log(`account5's ETH balance: ${account5EthBal_bef}`);

            console.log(">>> pickWinner");
            await lottery.pickWinner();

            console.log(">>> after pickWinner");

            const lotteryId = await lottery.lotteryId();
            console.log(`lottyerId: ${lotteryId}`);
            expect(lotteryId).to.equal(1);

            const winner = await lottery.lotteryHistory(lotteryId - 1);
            console.log(`winner at lotteryId ${lotteryId-1}: ${winner}`);

            const account1EthBal_aft = await ethers.provider.getBalance(signers[1].address);
            console.log(`account1's ETH balance: ${account1EthBal_aft}`);
            const account2EthBal_aft = await ethers.provider.getBalance(signers[2].address);
            console.log(`account2's ETH balance: ${account2EthBal_aft}`);
            const account3EthBal_aft = await ethers.provider.getBalance(signers[3].address);
            console.log(`account3's ETH balance: ${account3EthBal_aft}`);
            const account4EthBal_aft = await ethers.provider.getBalance(signers[4].address);
            console.log(`account4's ETH balance: ${account4EthBal_aft}`);
            const account5EthBal_aft = await ethers.provider.getBalance(signers[5].address);
            console.log(`account5's ETH balance: ${account5EthBal_aft}`);

            console.log(`account1 balance difference: ${account1EthBal_aft.sub(account1EthBal_bef)}`);
            console.log(`account1 balance difference: ${(account1EthBal_aft.sub(account1EthBal_bef)) / 10**18}`);
            console.log(`account2 balance difference: ${account2EthBal_aft.sub(account2EthBal_bef)}`);
            console.log(`account2 balance difference: ${(account2EthBal_aft.sub(account2EthBal_bef))/10**18}`);
            console.log(`account3 balance difference: ${account3EthBal_aft.sub(account3EthBal_bef)}`);
            console.log(`account3 balance difference: ${(account3EthBal_aft.sub(account3EthBal_bef))/10**18}`);
            console.log(`account4 balance difference: ${account4EthBal_aft.sub(account4EthBal_bef)}`);
            console.log(`account4 balance difference: ${(account4EthBal_aft.sub(account4EthBal_bef))/10**18}`);
            console.log(`account5 balance difference: ${account5EthBal_aft.sub(account5EthBal_bef)}`);
            console.log(`account5 balance difference: ${(account5EthBal_aft.sub(account5EthBal_bef)) / 10**18}`);
        });

        it.skip("Calculate winner - getRandomNumber()", async () => {
            const lotteryId = await lottery.lotteryId();
            console.log(`lotteryId: ${lotteryId}`);

            const winner = await lottery.lotteryHistory(lotteryId - 1);
            console.log(`winner: ${winner}`);

            const randomNum = await lottery.getRandomNumber();
            console.log(`randomNum: ${randomNum}`);

            const blockNumber = await ethers.provider.getBlockNumber();
            console.log(`block number: ${blockNumber}`);

            const currentBlock = await ethers.provider.getBlock(blockNumber);
            console.log(`current block:`, currentBlock);

            const calculatedRandomNum = ethers.BigNumber.from(ethers.utils.solidityKeccak256(["address", "uint256"], [await lottery.owner(), currentBlock.timestamp]));
            console.log(`calculated random number: ${calculatedRandomNum}`);
            expect(randomNum).to.equal(calculatedRandomNum);

            const calculatedWinnerIndex = ethers.BigNumber.from(ethers.utils.solidityKeccak256(["address", "uint256"], [await lottery.owner(), currentBlock.timestamp])).mod(5);
            console.log(`calculated winner index: ${calculatedWinnerIndex}`);
            expect(winner).to.equal(signers[calculatedWinnerIndex.add(1)].address);
        });

        it.skip("Calculate winner - getRandomNumberV2()", async () => {
            const lotteryId = await lottery.lotteryId();
            console.log(`lotteryId: ${lotteryId}`);

            const winner = await lottery.lotteryHistory(lotteryId - 1);
            console.log(`winner: ${winner}`);

            const blockNumber = await ethers.provider.getBlockNumber();
            console.log(`block number: ${blockNumber}`);

            const currentBlock = await ethers.provider.getBlock(blockNumber);
            console.log(`current block:`, currentBlock);

            const calculatedRandomNum = ethers.BigNumber.from(ethers.utils.solidityKeccak256(["uint256", "uint256", "address[]"], [currentBlock.difficulty, currentBlock.timestamp, [signers[1].address, signers[2].address, signers[3].address, signers[4].address, signers[5].address]]));
            console.log(`calculated random number: ${calculatedRandomNum}`);

            const calculatedWinnerIndex = ethers.BigNumber.from(ethers.utils.solidityKeccak256(["uint256", "uint256", "address[]"], [currentBlock.difficulty, currentBlock.timestamp, [signers[1].address, signers[2].address, signers[3].address, signers[4].address, signers[5].address]])).mod(5);
            console.log(`calculated winner index: ${calculatedWinnerIndex}`);
            expect(winner).to.equal(signers[calculatedWinnerIndex.add(1)].address);
        });

        it("Calculate winner - getRandomNumberV3()", async () => {
            const lotteryId = await lottery.lotteryId();
            console.log(`lotteryId: ${lotteryId}`);

            const winner = await lottery.lotteryHistory(lotteryId - 1);
            console.log(`winner: ${winner}`);

            const randomNum = await lottery.getRandomNumberV3();
            console.log(`randomNum: ${randomNum}`);

            const blockNumber = await ethers.provider.getBlockNumber();
            console.log(`block number: ${blockNumber}`);

            const currentBlock = await ethers.provider.getBlock(blockNumber);
            console.log(`current block:`, currentBlock);

            const calculatedRandomNum = ethers.BigNumber.from(ethers.utils.solidityKeccak256(["bytes32", "uint256"], [currentBlock.parentHash, currentBlock.timestamp]));
            console.log(`calculated random number: ${calculatedRandomNum}`);

            const calculatedWinnerIndex = calculatedRandomNum.mod(5);
            console.log(`calculated winner index: ${calculatedWinnerIndex}`);
            expect(winner).to.equal(signers[calculatedWinnerIndex.add(1)].address);
        });
    });
});