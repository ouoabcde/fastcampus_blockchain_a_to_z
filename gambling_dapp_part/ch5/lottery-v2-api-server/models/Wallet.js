const _ = require("lodash");
const path = require("path");
const envType = process.env.NODE_ENV || "development";
require("dotenv").config({ path: path.join(__dirname, `../config/${envType}.env`)});
const CipherUtil = require("../services/CipherUtil");

module.exports = (sequelize, DataTypes) => {
    const Wallet = sequelize.define("Wallet", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        account_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        account: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        private_key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        is_master: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            field: "created_at",
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: "updated_at",
        },
    }, {
        freezeTableName: true,
    });

    Wallet.sync().then(async () => {
        const masterWallet = await Wallet.findOne({ where: { account: process.env.MASTER_WALLET_ADDRESS }});
        if (_.isEmpty(masterWallet)) {
            await Wallet.create({
                account_name: "master",
                account: process.env.MASTER_WALLET_ADDRESS,
                private_key: CipherUtil.encrypt(process.env.MASTER_WALLET_PRIVATE_KEY),
                is_master: true,
            });
        }
    });

    return Wallet;
};
