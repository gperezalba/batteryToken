const expect = require("chai").expect;
const truffleAssert = require('truffle-assertions');
const BatteryToken = artifacts.require("BatteryToken");
const delay = ms => new Promise(res => setTimeout(res, ms));

contract("BatteryToken", async (accounts) => {

  //var instance;

  beforeEach(async () => {
    //web3.personal.truff(web3.eth.accounts[0], 'Passw0rd');

    //quitar el async y poner una function () {}
    //return BatteryToken.new().then(function(contract) {
      //instance = contract;
    //})
  });

  it("should mint ERC20", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[0];
    let amount = 1000;
    let response = await instance.mintERC20(amount, { from: account1 });
    let balance = await instance.balanceOf.call(account1, { from: account1 });
    let balanceAcc1 = balance.toNumber();
    expect(balanceAcc1).to.equal(amount);
    truffleAssert.eventEmitted(response, 'Transfer', (ev) => {
      return ev.to == account1 && ev.value == amount;
    })
  })

  it("should mint a battery", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[0];
    let domain = true;
    let value = 777;
    let response = await instance.mintBat(domain, value, { from: account1 });
    let owner = await instance.ownerOf.call(1, { from: account1 });
    expect(owner.valueOf()).to.equal(account1);
    truffleAssert.eventEmitted(response, 'MintBat', (ev) => {
      return ev.own == account1 && ev.id == 1 && ev.domain == domain;
    })
  });

  it("should burn a battery", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[0];
    await instance.mintBat(false, 0, { from: account1 });
    let response = await instance.burnBat(2, { from: account1 });
    truffleAssert.eventEmitted(response, 'BurnBat', (ev) => {
      return ev.own == account1 && ev.id == 2;
    })
  });

  it("should return the owner of a battery", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[0];
    var owner = await instance.ownerOf.call(1, { from: account1 });
    expect(account1).to.equal(owner);
  });

  it("should return battery details", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[0];
    let domain = true;
    let value = 777;
    let response = await instance.getBattery.call(1, { from: account1 });
    expect(response[0]).to.equal(domain) &&
    expect(response[2].toNumber()).to.equal(value);
  });

  it("should return batteries of an account", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[0];
    await instance.mintBat(false, 0, { from: account1 });
    let response = await instance.batteriesOfOwner.call(account1, { from: account1 });
    expect(response[0].c[0].valueOf()).to.equal(1) &&
    expect(response[1].c[0].valueOf()).to.equal(3);
  });

  it("should return value of a batteryId", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    var mint1 = await instance.mintBat(true, 120, { from: account1 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    let response = await instance.getBatValue.call(item1, 99, { from: account1 });
    let value1 = response.toNumber();
    await delay(5000);
    let response2 = await instance.getBatValue.call(item1, 99, { from: account1 });
    let value2 = response2.toNumber();
    let response3 = await instance.getBatValue.call(item1, 1, { from: account1 });
    let value3 = response3.toNumber();
    expect(value1).to.be.above(value2) &&
    expect(value2).to.be.above(value3);
  });

  it("should return value 0 of batteryId 0", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    let response = await instance.getBatValue.call(0, 0, { from: account1 });
    let value1 = response.toNumber();
    expect(value1).to.equal(0);
  })

  it("should propose a public exchange", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    await instance.mintERC20(1000, { from: account1 });
    await instance.mintERC20(1000, { from: account2 });
    var mint1 = await instance.mintBat(true, 120, { from: account1 });
    var mint2 = await instance.mintBat(true, 100, { from: account2 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    let item2 = parseInt(mint2.logs[0].args.id.c);
    let response = await instance.proposeExchange(
      item1,
      item2,
      98,
      7,
      account2,
      { from: account1 }
    );
    let exchangeId = response.logs[0].args.proposalId;
    truffleAssert.eventEmitted(response, 'Proposal', (ev) => {
      return ev.emiter == account1 &&
        ev.executer == account2 &&
        ev.itemEmiter == item1 &&
        ev.proposalId == exchangeId &&
        ev.itemExecuter == item2;
    });
  });

  it("should propose a public exchange and cancell it", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    await instance.mintERC20(1000, { from: account1 });
    await instance.mintERC20(1000, { from: account2 });
    var mint1 = await instance.mintBat(true, 120, { from: account1 });
    var mint2 = await instance.mintBat(true, 100, { from: account2 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    let item2 = parseInt(mint2.logs[0].args.id.c);
    let response = await instance.proposeExchange(
      item1,
      item2,
      98,
      7,
      account2,
      { from: account1 }
    );
    let exchangeId = response.logs[0].args.proposalId;
    let response2 = await instance.cancelProposal(exchangeId, { from: account1 });
    truffleAssert.eventEmitted(response2, 'Cancellation', (ev) => {
      return ev.proposalId == exchangeId;
    });
  });

  it("should propose a public exchange with approve", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    await instance.mintERC20(1000, { from: account1 });
    await instance.mintERC20(1000, { from: account2 });
    var mint1 = await instance.mintBat(true, 120, { from: account1 });
    var mint2 = await instance.mintBat(true, 300, { from: account2 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    let item2 = parseInt(mint2.logs[0].args.id.c);
    let response = await instance.proposeExchange(
      item1,
      item2,
      98,
      7,
      account2,
      { from: account1 }
    );
    let exchangeId = response.logs[1].args.proposalId;
    truffleAssert.eventEmitted(response, 'Proposal', (ev) => {
      return ev.emiter == account1 &&
        ev.executer == account2 &&
        ev.itemEmiter == item1 &&
        ev.proposalId == exchangeId &&
        ev.itemExecuter == item2;
    });
  });

  it("should execute a public exchange", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    var mint1 = await instance.mintBat(true, 120, { from: account1 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    var mint2 = await instance.mintBat(true, 70, { from: account2 });
    let item2 = parseInt(mint2.logs[0].args.id.c);
    let response = await instance.proposeExchange(item1, item2, 98, 7, account2, { from: account1 });
    let exchangeId = response.logs[0].args.proposalId;
    let response2 = await instance.executeExchange(exchangeId, { from: account2 });
    truffleAssert.eventEmitted(response2, 'Execution', (ev) => {
      return ev.emiter == account1 &&
        ev.executer == account2 &&
        ev.itemEmiter == item1 &&
        ev.itemExecuter == item2;
    });
    let owner1 = await instance.ownerOf.call(item1, { from: account1 });
    let owner2 = await instance.ownerOf.call(item2, { from: account1 });
    expect(owner1).to.equal(account2) &&
    expect(owner2).to.equal(account1);
  });

  it("should execute a public exchange with transferFrom", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    var mint1 = await instance.mintBat(true, 120, { from: account1 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    var mint2 = await instance.mintBat(true, 370, { from: account2 });
    let item2 = parseInt(mint2.logs[0].args.id.c);
    let response = await instance.proposeExchange(item1, item2, 98, 7, account2, { from: account1 });
    let exchangeId = response.logs[1].args.proposalId;
    let response2 = await instance.executeExchange(exchangeId, { from: account2 });
    truffleAssert.eventEmitted(response2, 'Execution', (ev) => {
      return ev.emiter == account1 &&
        ev.executer == account2 &&
        ev.itemEmiter == item1 &&
        ev.itemExecuter == item2;
    });
    let owner1 = await instance.ownerOf.call(item1, { from: account1 });
    let owner2 = await instance.ownerOf.call(item2, { from: account1 });
    expect(owner1).to.equal(account2) &&
    expect(owner2).to.equal(account1);
  });

  it("should cancell a proposal with TransferFrom", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    var mint1 = await instance.mintBat(true, 120, { from: account1 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    var mint2 = await instance.mintBat(true, 370, { from: account2 });
    let item2 = parseInt(mint2.logs[0].args.id.c);
    let response = await instance.proposeExchange(item1, item2, 98, 7, account2, { from: account1 });
    let exchangeId = response.logs[1].args.proposalId;
    let response2 = await instance.cancelProposal(exchangeId, { from: account1 });
    truffleAssert.eventEmitted(response2, 'Approval', (ev) => {
      return ev.owner == account1 &&
        ev.spender == account2;
    });
    truffleAssert.eventEmitted(response2, 'Cancellation', (ev) => {
      return ev.proposalId == exchangeId;
    });
  })

  it("should propose a private exchange (Delivery)", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    var mint = await instance.mintBat(false, 150, { from: account2 });
    let item = parseInt(mint.logs[0].args.id.c);
    let chargeLevel = 15;
    let response = await instance.proposeExchange(
      item,
      0,
      chargeLevel,
      0,
      account1,
      { from: account2 }
    );
    truffleAssert.eventEmitted(response, 'Proposal', (ev) => {
      return ev.emiter == account2 &&
        ev.executer == account1 &&
        ev.itemEmiter == item;
    });
  });

  it("should execute a private exchange (Delivery)", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    var mint1 = await instance.mintBat(false, 333, { from: account2 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    let response = await instance.proposeExchange(item1, 0, 15, 0, account1, { from: account2 });
    let exchangeId = response.logs[0].args.proposalId;
    let response2 = await instance.executeExchange(exchangeId, { from: account1 });
    truffleAssert.eventEmitted(response2, 'Execution', (ev) => {
      return ev.emiter == account2 &&
        ev.executer == account1 &&
        ev.itemEmiter == item1 &&
        ev.itemExecuter == 0;
    });
    let response3 = await instance.getBattery.call(item1, { from: account1 });
    expect(response3[3]).to.equal(account1);
  });

  it("should propose a private exchange (Collection)", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    var mint1 = await instance.mintBat(false, 333, { from: account2 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    let response = await instance.proposeExchange(item1, 0, 15, 0, account1, { from: account2 });
    let exchangeId = response.logs[0].args.proposalId;
    let response2 = await instance.executeExchange(exchangeId, { from: account1 });
    let response3 = await instance.proposeExchange(item1, 0, 99, 0, account2, { from: account1 });
    truffleAssert.eventEmitted(response3, 'Proposal', (ev) => {
      return ev.emiter == account1 &&
        ev.executer == account2 &&
        ev.itemEmiter == item1;
    });
  });

  it("should execute a private exchange (Collection)", async () => {
    let instance = await BatteryToken.deployed();
    const account1 = accounts[1];
    const account2 = accounts[2];
    var mint1 = await instance.mintBat(false, 333, { from: account2 });
    let item1 = parseInt(mint1.logs[0].args.id.c);
    let response = await instance.proposeExchange(item1, 0, 15, 0, account1, { from: account2 });
    let exchangeId = response.logs[0].args.proposalId;
    let response2 = await instance.executeExchange(exchangeId, { from: account1 });
    let response3 = await instance.proposeExchange(item1, 0, 99, 0, account2, { from: account1 });
    let exchangeId2 = response3.logs[0].args.proposalId;
    let response4 = await instance.executeExchange(exchangeId2, { from: account2 });
    truffleAssert.eventEmitted(response4, 'Execution', (ev) => {
      return ev.emiter == account1 &&
        ev.executer == account2 &&
        ev.itemEmiter == item1 &&
        ev.itemExecuter == 0;
    });
    let response5 = await instance.getBattery.call(item1, { from: account1 });
    expect(response5[3]).to.equal("0x0000000000000000000000000000000000000000");
  });

});
