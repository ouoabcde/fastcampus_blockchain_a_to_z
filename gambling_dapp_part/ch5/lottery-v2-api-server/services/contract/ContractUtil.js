const Web3 = require("web3");
const path = require("path");
const envType = process.env.NODE_ENV || "development";
require("dotenv").config({ path: path.join(__dirname, `../../config/${envType}.env`)});
const config = require("../../config/appConfig");
const fs = require("fs");
const { FeeMarketEIP1559Transaction } = require("@ethereumjs/tx");
const Common = require("@ethereumjs/common").default;
const { Chain, Hardfork } = require("@ethereumjs/common");

class ContractUtil {

    constructor() {
        this.#initializeWeb3();
    }

    #initializeWeb3() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.blockchain[envType]));
    }

    async getContract(contractName) {
        const funcName = "getContract";
        try {
            if (!(await this.web3.eth.net.isListening())) {
                this.#initializeWeb3();
            }
            const abi = this.#getContractAbi(contractName);
            const ca = process.env[contractName];
            const contract = new this.web3.eth.Contract(abi, ca);
            return contract;
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
        }
    }

    #getContractAbi(contractName) {
        const funcName = "#getContractAbi";
        try {
            const dir = path.resolve(__dirname, "../../contractAbis");
            const json = fs.readFileSync(`${dir}/${contractName}.json`);
            const instance = JSON.parse(json);
            return instance.abi;
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
        }
    }

    async signTransaction(signer, pk, to, gas, value, data) {
        const funcName = "signTransaction";
        try {
            const nonce = await this.web3.eth.getTransactionCount(signer);
            const priorityFee = this.web3.utils.toWei("1", "Gwei");
            const pendingBlock = await this.web3.eth.getBlock("pending");
            const baseFeePerGas = pendingBlock.baseFeePerGas;
            const chainId = await this.web3.eth.net.getId();

            const rawTx = {
                nonce: this.web3.utils.toHex(nonce),
                to: to,
                maxPriorityFeePerGas: this.web3.utils.toHex(priorityFee),
                maxFeePerGas: this.web3.utils.toHex(Math.floor(baseFeePerGas * 1.01) + Number(priorityFee)),
                gas: this.web3.utils.toHex(gas),
                gasLimit: this.web3.utils.toHex(Math.floor(gas * 1.01)),
                value: this.web3.utils.toHex(value),
                data: data,
                chainId: this.web3.utils.toHex(chainId),
            };
            console.log(`[${funcName}] rawTx: ${JSON.stringify(rawTx)}`);

            const common = new Common({ chain: Chain.Goerli, hardfork: Hardfork.London });
            const tx = FeeMarketEIP1559Transaction.fromTxData(rawTx, { common });
            const signedTx = tx.sign(Buffer.from(pk, "hex"));
            const serializedTx = "0x" + signedTx.serialize().toString("hex");
            console.log(`[${funcName}] signedTx: ${JSON.stringify(signedTx)}, serializedTx: ${serializedTx}`);

            return serializedTx;
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
        }
    }
}

module.exports = ContractUtil;
