const ContractUtil = require("./ContractUtil");
const contractUtil = new ContractUtil();

class LotteryV2Interactor {

    constructor() {
        this.#intializeContract();
    }

    async #intializeContract() {
        this.web3 = contractUtil.web3;
        this.LotteryV2 = await contractUtil.getContract("LotteryV2");
    }
    
    async enter(signer, pk, enterAmt) {
        const funcName = "enter";
        try {
            const gas = await this.LotteryV2.methods.enter().estimateGas({ from: signer, value: enterAmt })
            .catch(revertReason => { throw new Error(`estimating gas error: ${revertReason}`); });

            const to = this.LotteryV2._address;
            const data = this.LotteryV2.methods.enter().encodeABI();

            const serializedTx = await contractUtil.signTransaction(signer, pk, to, gas, enterAmt, data);

            let txHash;
            await this.web3.eth.sendSignedTransaction(serializedTx)
            .on("transactionHash", async (tx) => {
                console.log(`[${funcName}] transaction created! tx hash: ${tx}`);
                txHash = tx;
            });

            return {
                status: true,
                result: txHash,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }

    async getBalance() {
        const funcName = "getBalance";
        try {
            const balance = await this.LotteryV2.methods.getBalance().call();
            console.log(`[${funcName}] balance of LotteryV2: ${balance}`);

            return {
                status: true,
                result: balance,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }

    async getPlayers() {
        const funcName = "getPlayers";
        try {
            const players = await this.LotteryV2.methods.getPlayers().call();
            console.log(`[${funcName}] players: ${JSON.stringify(players)}`);

            return {
                status: true,
                result: players,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }

    async lotteryId() {
        const funcName = "lotteryId";
        try {
            const lotteryId = await this.LotteryV2.methods.lotteryId().call();
            console.log(`[${funcName}] lotteryId: ${lotteryId}`);

            return {
                status: true,
                result: lotteryId,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }

    async lotteryHistory(lotteryId) {
        const funcName = "lotteryHistory";
        try {
            const winner = await this.LotteryV2.methods.lotteryHistory(lotteryId).call();
            console.log(`[${funcName}] lotteryId ${lotteryId} winner: ${winner}`);

            return {
                status: true,
                result: winner,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }

    async s_randomWords(index) {
        const funcName = "s_randomWords";
        try {
            const randomWords = await this.LotteryV2.methods.s_randomWords(index).call();
            console.log(`[${funcName}] randomWords: ${randomWords}`);

            return {
                status: true,
                result: randomWords,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }

    async getPlayerBalance(account) {
        const funcName = "getPlayerBalance";
        try {
            const balance = await this.web3.eth.getBalance(account);
            console.log(`[${funcName}] account ${account}'s ETH balance: ${balance}`);

            return {
                status: true,
                result: balance,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }

    async pickWinner(signer, pk) {
        const funcName = "pickWinner";
        try {
            const gas = await this.LotteryV2.methods.pickWinner().estimateGas({ from: signer })
            .catch(revertReason => { throw new Error(`estimating gas error: ${revertReason}`); });
            console.log(`[${funcName}] estimated gas: ${gas}`);

            const to = this.LotteryV2._address;
            const data = this.LotteryV2.methods.pickWinner().encodeABI();

            const serializedTx = await contractUtil.signTransaction(signer, pk, to, gas, 0, data);

            let txHash;
            await this.web3.eth.sendSignedTransaction(serializedTx)
            .on("transactionHash", async (tx) => {
                console.log(`[${funcName}] transaction created! tx hash: ${tx}`);
                txHash = tx;
            });

            return {
                status: true,
                result: txHash,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }
}

module.exports = LotteryV2Interactor;
