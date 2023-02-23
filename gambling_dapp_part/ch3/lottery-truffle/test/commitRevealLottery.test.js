const truffleAssert = require("truffle-assertions");

const CommitRevealLottery = artifacts.require("CommitRevealLottery");

contract("CommitRevealLottery", accounts => {
    console.log(accounts);

    let commitRevealLottery;

    before(async () => {
        commitRevealLottery = await CommitRevealLottery.deployed();
        console.log(`commitRevealLottery address: ${commitRevealLottery.address}`);
    });

    describe("Constructor", () => {
        it("commitCloses & revealCloses should be set correctly", async () => {
            const commitCloses = await commitRevealLottery.commitCloses();
            const revealCloses = await commitRevealLottery.revealCloses();
            const duration = await commitRevealLottery.DURATION();
            console.log(`commitCloses: ${commitCloses}, revealCloses: ${revealCloses}, duration: ${duration}`);

            const currentBlockNum = await web3.eth.getBlockNumber();
            console.log(`current block number: ${currentBlockNum}`);

            assert.equal(commitCloses.toString(), web3.utils.toBN(currentBlockNum).add(duration).toString());
            assert.equal(revealCloses.toString(), commitCloses.add(duration));
        });
    });

    describe("Enter", () => {
        it("Should revert if a player enters less than 0.01 ether", async () => {
            const enterAmt = web3.utils.toWei("0.009", "ether");

            const secret = 12345;
            const commit = web3.utils.keccak256(web3.utils.encodePacked({value: accounts[1], type: "address"}, {value: secret, type: "uint256"}));
            console.log(`commit: ${commit}`);

            await truffleAssert.reverts(commitRevealLottery.enter(commit, { from: accounts[1], value: enterAmt }), "msg.value should be greater than or equal to 0.01 ether");
        });

        it("Enter 3 players and check values", async () => {
            const enterAmt = web3.utils.toWei("0.01", "ether");

            // player1 enter
            const secret1 = 12345;
            const commit1 = web3.utils.keccak256(web3.utils.encodePacked({value: accounts[1], type: "address"}, {value: secret1, type: "uint256"}));
            console.log(`commit1: ${commit1}`);

            await commitRevealLottery.enter(commit1, { from: accounts[1], value: enterAmt });

            // check values
            assert.equal(await commitRevealLottery.getBalance(), enterAmt, "0.01 ETH not sent correctly by account1");
            assert.equal(await commitRevealLottery.commitments(accounts[1]), commit1);

            // player2 enter
            const secret2 = 12346;
            const commit2 = web3.utils.keccak256(web3.utils.encodePacked({value: accounts[2], type: "address"}, {value: secret2, type: "uint256"}));
            console.log(`commit2: ${commit2}`);

            await commitRevealLottery.enter(commit2, { from: accounts[2], value: enterAmt });
            assert.equal(await commitRevealLottery.getBalance(), web3.utils.toBN(enterAmt).mul(web3.utils.toBN(2)).toString());
            assert.equal(await commitRevealLottery.commitments(accounts[2]), commit2);

            // player3 enter
            const secret3 = 12347;
            const commit3 = web3.utils.keccak256(web3.utils.encodePacked({value: accounts[3], type: "address"}, {value: secret3, type: "uint256"}));
            console.log(`commit3: ${commit3}`);

            await commitRevealLottery.enter(commit3, { from: accounts[3], value: enterAmt });
            assert.equal(await commitRevealLottery.getBalance(), web3.utils.toBN(enterAmt).mul(web3.utils.toBN(3)).toString());
            assert.equal(await commitRevealLottery.commitments(accounts[3]), commit3);

            // player4 enter should revert
            const secret4 = 12348;
            const commit4 = web3.utils.keccak256(web3.utils.encodePacked({value: accounts[4], type: "address"}, {value: secret4, type: "uint256"}));
            console.log(`commit4: ${commit4}`);

            await truffleAssert.reverts(commitRevealLottery.enter(commit4, { from: accounts[4], value: enterAmt }), "commit duration is over");
            // await commitRevealLottery.enter(commit4, { from: accounts[4], value: enterAmt });
        });
    });

    describe("Reveal", () => {
        it("Reveal 3 players", async () => {
            // player1 reveal
            const secret1 = 12345;
            const commit1 = web3.utils.keccak256(web3.utils.encodePacked({value: accounts[1], type: "address"}, {value: secret1, type: "uint256"}));

            let commit = await commitRevealLottery.createCommitment(secret1, { from: accounts[1] });
            assert.equal(commit, commit1);

            let isAlreadyRevealed = await commitRevealLottery.isAlreadyRevealed({ from: accounts[1] });
            assert.equal(isAlreadyRevealed, false);

            await commitRevealLottery.reveal(secret1, { from: accounts[1] });

            isAlreadyRevealed = await commitRevealLottery.isAlreadyRevealed({ from: accounts[1] });
            assert.equal(isAlreadyRevealed, true);

            await truffleAssert.reverts(commitRevealLottery.reveal(secret1, { from: accounts[1] }), "You already revealed");

            const player1 = await commitRevealLottery.players(0);
            assert.equal(player1, accounts[1]);

            // player2 reveal
            const secret2 = 12346;
            const commit2 = web3.utils.keccak256(web3.utils.encodePacked({value: accounts[2], type: "address"}, {value: secret2, type: "uint256"}));

            commit = await commitRevealLottery.createCommitment(secret2, { from: accounts[2] });
            assert.equal(commit, commit2);

            isAlreadyRevealed = await commitRevealLottery.isAlreadyRevealed({ from: accounts[2] });
            assert.equal(isAlreadyRevealed, false);

            await commitRevealLottery.reveal(secret2, { from: accounts[2] });

            isAlreadyRevealed = await commitRevealLottery.isAlreadyRevealed({ from: accounts[2] });
            assert.equal(isAlreadyRevealed, true);

            await truffleAssert.reverts(commitRevealLottery.reveal(secret2, { from: accounts[2] }), "You already revealed");

            const player2 = await commitRevealLottery.players(1);
            assert.equal(player2, accounts[2]);

            // player3 reveal
            const secret3 = 12347;
            const commit3 = web3.utils.keccak256(web3.utils.encodePacked({value: accounts[3], type: "address"}, {value: secret3, type: "uint256"}));

            commit = await commitRevealLottery.createCommitment(secret3, { from: accounts[3] });
            assert.equal(commit, commit3);

            isAlreadyRevealed = await commitRevealLottery.isAlreadyRevealed({ from: accounts[3] });
            assert.equal(isAlreadyRevealed, false);

            await commitRevealLottery.reveal(secret3, { from: accounts[3] });

            isAlreadyRevealed = await commitRevealLottery.isAlreadyRevealed({ from: accounts[3] });
            assert.equal(isAlreadyRevealed, true);

            await truffleAssert.reverts(commitRevealLottery.reveal(secret3, { from: accounts[3] }), "You already revealed");

            const player3 = await commitRevealLottery.players(2);
            assert.equal(player3, accounts[3]);

            // 더미 트랜잭션 생성
            await web3.eth.sendTransaction({ from: accounts[1], to: accounts[2], value: 0 });

            await truffleAssert.reverts(commitRevealLottery.reveal(secret3, { from: accounts[3] }), "reveal duration is already closed");
            // await commitRevealLottery.reveal(secret3, { from: accounts[3] });
        });
    });

    describe("PickWinner", () => {
        it("PickWinner", async () => {
            await commitRevealLottery.pickWinner({ from: accounts[1] });

            const winner = await commitRevealLottery.winner();
            const lotteryId = await commitRevealLottery.lotteryId();

            assert.equal(lotteryId, 1);
            assert.equal(await commitRevealLottery.lotteryHistory(lotteryId - 1), winner);
        });
    });

    describe("WithdrawPrize", () => {
        it("WithdrawPrize", async () => {
            console.log(">>> before withdrawPrize");

            const account1ETHBal_bef = await web3.eth.getBalance(accounts[1]);
            console.log(`account1's ETH balance: ${account1ETHBal_bef}`);
            const account2ETHBal_bef = await web3.eth.getBalance(accounts[2]);
            console.log(`account2's ETH balance: ${account2ETHBal_bef}`);
            const account3ETHBal_bef = await web3.eth.getBalance(accounts[3]);
            console.log(`account3's ETH balance: ${account3ETHBal_bef}`);

            console.log(">>> withdrawPrize");

            await truffleAssert.reverts(commitRevealLottery.withdrawPrize({ from: accounts[0] }), "You're not the winner");

            let winner = await commitRevealLottery.winner();
            await commitRevealLottery.withdrawPrize({ from: winner });

            console.log(">>> after withdrawPrize");

            const account1ETHBal_aft = await web3.eth.getBalance(accounts[1]);
            console.log(`account1's ETH balance: ${account1ETHBal_aft}`);
            const account2ETHBal_aft = await web3.eth.getBalance(accounts[2]);
            console.log(`account2's ETH balance: ${account2ETHBal_aft}`);
            const account3ETHBal_aft = await web3.eth.getBalance(accounts[3]);
            console.log(`account3's ETH balance: ${account3ETHBal_aft}`);

            console.log(`account1 balance difference: ${web3.utils.toBN(account1ETHBal_aft).sub(web3.utils.toBN(account1ETHBal_bef))}`);
            console.log(`account2 balance difference: ${web3.utils.toBN(account2ETHBal_aft).sub(web3.utils.toBN(account2ETHBal_bef))}`);
            console.log(`account3 balance difference: ${web3.utils.toBN(account3ETHBal_aft).sub(web3.utils.toBN(account3ETHBal_bef))}`);

            winner = await commitRevealLottery.winner();
            assert.equal(winner, "0x0000000000000000000000000000000000000000");

            for (let i = 0; i < 3; i++) {
                let commit = await commitRevealLottery.commitments(accounts[i]);
                assert.equal(commit, "0x0000000000000000000000000000000000000000000000000000000000000000");
            }

            await truffleAssert.reverts(commitRevealLottery.players(0));

            const currentBlockNum = await web3.eth.getBlockNumber();
            const commitCloses = await commitRevealLottery.commitCloses();
            const revealCloses = await commitRevealLottery.revealCloses();
            const duration = await commitRevealLottery.DURATION();

            assert.equal(commitCloses.toString(), web3.utils.toBN(currentBlockNum).add(duration));
            assert.equal(revealCloses.toString(), commitCloses.add(duration));
        });
    });
});