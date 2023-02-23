const CommitRevealLottery = artifacts.require("CommitRevealLottery");

module.exports = function (deployer) {
  deployer.deploy(CommitRevealLottery);
};
