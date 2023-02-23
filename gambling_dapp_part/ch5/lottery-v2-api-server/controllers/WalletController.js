const ResponseHandler = require("../services/ResponseHandler");
const CipherUtil = require("../services/CipherUtil");
const WalletDBInteractor = require("../services/db/WalletDBInteractor");
const errorCodes = require("../constants/errorCodes").errorCodes;

class WalletController {

    static async createWallet(req, res) {
        const funcName = "createWallet";
        try {
            const accountName = req.body.account_name;
            const account = req.body.account;
            const privateKey = req.body.private_key;
            console.log(`[${funcName}] req.body: ${JSON.stringify(req.body)}`);

            const walletInfo = {
                account_name: accountName,
                account: account,
                private_key: CipherUtil.encrypt(privateKey),
            };
            console.log(`[${funcName}] walletInfo: ${JSON.stringify(walletInfo)}`);

            const inserted = await WalletDBInteractor.insertWallet(walletInfo);
            if (inserted.status == errorCodes.success) {
                return ResponseHandler.sendSuccess(res, "success", 201)({
                    status: "Confirmed",
                });
            } else if (inserted.status == errorCodes.client_issue) {
                return ResponseHandler.sendClientError(400, req, res, "this account already exists in DB");
            } else {
                throw new Error(inserted.err);
            }
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }
}

module.exports = WalletController;
