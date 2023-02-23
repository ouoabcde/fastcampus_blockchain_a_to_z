const ResponseHandler = require("../services/ResponseHandler");
const WalletDBInteractor = require("../services/db/WalletDBInteractor");
const errorCodes = require("../constants/errorCodes").errorCodes;
const LotteryV2Interactor = require("../services/contract/LotteryV2Interactor");
const lotteryV2Interactor = new LotteryV2Interactor();
const CipherUtil = require("../services/CipherUtil");

class LotteryV2Controller {

    static async enter(req, res) {
        const funcName = "enter";
        try {
            const accountName = req.body.account_name;
            const enterAmt = req.body.enter_amt;
            console.log(`[${funcName}] req.body: ${JSON.stringify(req.body)}`);

            const wallet = await WalletDBInteractor.getWallet(accountName);
            console.log(`[${funcName}] wallet: ${JSON.stringify(wallet)}`);
            if (wallet.status == errorCodes.client_issue) {
                return ResponseHandler.sendClientError(400, req, res, "this account doesn't exist in DB");
            } else if (wallet.status == errorCodes.server_issue) {
                throw new Error(wallet.err);
            }

            const enterResult = await lotteryV2Interactor.enter(wallet.result.account, CipherUtil.decrypt(wallet.result.private_key), enterAmt);
            if (!enterResult.status) {
                throw new Error(enterResult.errMsg);
            }
            return ResponseHandler.sendSuccess(res, "success", 200)({
                status: "Confirmed",
                tx_hash: enterResult.result,
            });
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }

    static async getBalance(req, res) {
        const funcName = "getBalance";
        try {
            const balanceResult = await lotteryV2Interactor.getBalance();
            if (!balanceResult.status) {
                throw new Error(balanceResult.errMsg);
            }
            return ResponseHandler.sendSuccess(res, "success", 200)({
                status: "Confirmed",
                balance: balanceResult.result,
            });
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }

    static async getPlayers(req, res) {
        const funcName = "getPlayers";
        try {
            const playersResult = await lotteryV2Interactor.getPlayers();
            if (!playersResult.status) {
                throw new Error(playersResult.errMsg);
            }
            return ResponseHandler.sendSuccess(res, "success", 200)({
                status: "Confirmed",
                players: playersResult.result,
            });
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }

    static async lotteryId(req, res) {
        const funcName = "lotteryId";
        try {
            const lotteryIdResult = await lotteryV2Interactor.lotteryId();
            if (!lotteryIdResult.status) {
                throw new Error(lotteryIdResult.errMsg);
            }
            return ResponseHandler.sendSuccess(res, "success", 200)({
                status: "Confirmed",
                lottery_id: lotteryIdResult.result,
            });
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }

    static async lotteryHistory(req, res) {
        const funcName = "lotteryHistory";
        try {
            const lotteryId = req.query.lottery_id;
            console.log(`[${funcName}] req.query: ${JSON.stringify(req.query)}`);

            const winnerResult = await lotteryV2Interactor.lotteryHistory(lotteryId);
            if (!winnerResult.status) {
                throw new Error(winnerResult.errMsg);
            }
            return ResponseHandler.sendSuccess(res, "success", 200)({
                status: "Confirmed",
                winner: winnerResult.result,
            });
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }

    static async getRandomWords(req, res) {
        const funcName = "getRandomWords";
        try {
            const randomWordsResult = await lotteryV2Interactor.s_randomWords(0);
            if (!randomWordsResult.status) {
                throw new Error(randomWordsResult.errMsg);
            }
            return ResponseHandler.sendSuccess(res, "success", 200)({
                status: "Confirmed",
                random_number: randomWordsResult.result,
            });
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }

    static async getPlayerBalance(req, res) {
        const funcName = "getPlayerBalance";
        try {
            const accountName = req.query.account_name;
            console.log(`[${funcName}] req.query: ${JSON.stringify(req.query)}`);

            const wallet = await WalletDBInteractor.getWallet(accountName);
            if (wallet.status == errorCodes.client_issue) {
                return ResponseHandler.sendClientError(400, req, res, "this account doesn't exist in DB");
            } else if (wallet.status == errorCodes.server_issue) {
                throw new Error(wallet.err);
            }

            const balanceResult = await lotteryV2Interactor.getPlayerBalance(wallet.result.account);
            if (!balanceResult.status) {
                throw new Error(balanceResult.errMsg);
            }
            return ResponseHandler.sendSuccess(res, "success", 200)({
                status: "Confirmed",
                balance: balanceResult.result,
            });
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }

    static async pickWinner(req, res) {
        const funcName = "pickWinner";
        try {
            const accountName = req.body.account_name;
            console.log(`[${funcName}] req.body: ${JSON.stringify(req.body)}`);

            const wallet = await WalletDBInteractor.getWallet(accountName);
            console.log(`wallet: ${JSON.stringify(wallet)}`);
            if (wallet.status == errorCodes.client_issue) {
                return ResponseHandler.sendClientError(400, req, res, "this account doesn't exist in DB");
            } else if (wallet.status == errorCodes.server_issue) {
                throw new Error(wallet.err);
            }

            const pickWinnerResult = await lotteryV2Interactor.pickWinner(wallet.result.account, CipherUtil.decrypt(wallet.result.private_key));
            if (!pickWinnerResult.status) {
                throw new Error(pickWinnerResult.errMsg);
            }
            return ResponseHandler.sendSuccess(res, "success", 200)({
                status: "Confirmed",
                tx_hash: pickWinnerResult.result,
            });
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }
}

module.exports = LotteryV2Controller;
