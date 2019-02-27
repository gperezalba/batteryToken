var BatteryToken = artifacts.require("./BatteryToken.sol");

module.exports = function(deployer) {
  deployer.deploy(BatteryToken, {gas: 30000000});
};
