//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:22001"));
var NODO_ALASTRIA = "http://138.4.143.82:8545";
var GAS = 471238900;
var publicKeys = [
    "0x994319E1B1de09AAC4AA5B225a7D5CAdE79d04Ed",
    "0x66C5A820D0E743fC7030F02Aa873875C84A88f3f",
    "0x34322a678b16cE26fC0e2Bdde1E3c1B666a34a66",
    "0xfc3B00c03b74EE1d94fa10e21AEf4e6e9710E8a8",
    "0xF76c62480A8A6a83451EEef40d331ED179Da7F89",
    "0x7B1B6d29cb425887d1bC4849D0708091bcbaF16B",
    "0x12E3bB9F253Bd233e03bd696b1C558a056179B87",
    "0x59bedAa81eDfd70b8e370a96cf29eE327E84E551",
    "0x9A63729158A93F502935Bc322aF78E4F25a5Cc02",
    "0xAB2C680816421E56BA3274A37C3dF455fba32725"
      ];
var password = "Alumnos_2018_Q4_IKx5srvT";
var web3 = new Web3(new Web3.providers.HttpProvider(NODO_ALASTRIA));
//web3.eth.defaultAccount = publicKeys[0];
//web3.eth.personal.unlockAccount(publicKeys[0], password);

var contractAbi = [{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"mintERC20","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"exchangeId","type":"bytes32"}],"name":"cancelProposal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"itemProposer","type":"uint256"},{"name":"itemExecuter","type":"uint256"},{"name":"proposerChargeLevel","type":"uint256"},{"name":"executerChargeLevel","type":"uint256"},{"name":"executer","type":"address"}],"name":"proposeExchange","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getBattery","outputs":[{"name":"","type":"bool"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"burnBat","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"domain","type":"bool"},{"name":"value","type":"uint256"}],"name":"mintBat","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"itemId","type":"uint256"},{"name":"itemChargeLevel","type":"uint256"}],"name":"getBatValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"globalId","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timeRef","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"batteriesOfOwner","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"},{"name":"id","type":"uint256"}],"name":"changeBatteryOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"exchangeId","type":"bytes32"}],"name":"executeExchange","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"own","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"domain","type":"bool"},{"indexed":false,"name":"time","type":"uint256"}],"name":"MintBat","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"own","type":"address"},{"indexed":false,"name":"id","type":"uint256"}],"name":"BurnBat","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"proposalId","type":"bytes32"},{"indexed":false,"name":"emiter","type":"address"},{"indexed":false,"name":"executer","type":"address"},{"indexed":false,"name":"itemEmiter","type":"uint256"},{"indexed":false,"name":"itemExecuter","type":"uint256"}],"name":"Proposal","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"emiter","type":"address"},{"indexed":false,"name":"executer","type":"address"},{"indexed":false,"name":"itemEmiter","type":"uint256"},{"indexed":false,"name":"itemExecuter","type":"uint256"}],"name":"Execution","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"proposalId","type":"bytes32"}],"name":"Cancellation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"","type":"uint256"},{"indexed":false,"name":"","type":"uint256"},{"indexed":false,"name":"","type":"uint256"}],"name":"Debug","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];
var contractAddress = "0x7d2bad6565a604e88ae0982912e5e0e40d2ebc07";
var contract = new web3.eth.Contract(contractAbi, contractAddress);
//calculadora.options.from = publicKeys[0]; //No usar esto
contract.options.gas = GAS;

async function changeAdd() {
  web3.eth.defaultAccount = publicKeys[0];
  var currentAccount = web3.eth.defaultAccount;
  var temporizador = setInterval(function() {
    var list = document.getElementById("Addresses");
    var selected = list.options[list.selectedIndex].value;
    currentAccount = publicKeys[selected]
    if(currentAccount !== web3.eth.defaultAccount){
      alert("Last: " + web3.eth.defaultAccount + "," + "New: " + currentAccount);
      web3.eth.defaultAccount = currentAccount;
    }
  }, 100);
}
changeAdd();

//******************USUARIO**************************************//

async function batteriesOfOwner() {
  web3.eth.personal.unlockAccount(publicKeys[0], password);
  var response = await contract.methods.batteriesOfOwner(web3.eth.defaultAccount).call({from: web3.eth.defaultAccount});
  var array = [];
  for (values in response) {
    array.push(response[values]);
  }
  alert("IDs de tus baterías: " + array)
}

async function getBattery() {
  web3.eth.personal.unlockAccount(publicKeys[0], password);
  var id = document.getElementById("getBatteryId").value;
  var response = await contract.methods.getBattery(parseInt(id)).call({from: web3.eth.defaultAccount});
  alert("Dominio público: " + response[0] + "\n" +"Fecha Unix de creación: " + response[1] + "\n" +"Valor inicial: " + response[2] + "\n" +"Punto de carga: " + response[3]);
}

async function ownerOf() {
  web3.eth.personal.unlockAccount(publicKeys[0], password);
  var id = document.getElementById("").value;
  var response = await contract.methods.ownerOf(parseInt(id)).call({from: web3.eth.defaultAccount});
  console.log(response)
}

async function getBatValue() {
  web3.eth.personal.unlockAccount(publicKeys[0], password);
  var id = document.getElementById("getBatValueId").value;
  var chargeLevel = document.getElementById("getBatValueLevel").value;
  var response = await contract.methods.getBatValue(parseInt(id), parseInt(chargeLevel)).call({from: web3.eth.defaultAccount});
  alert("El valor de tu batería es de " + response)
}

async function mintERC20() {
  await web3.eth.personal.unlockAccount(web3.eth.defaultAccount, password);
  var amount = document.getElementById("mintAmount").value;
  var response = await contract.methods.mintERC20(parseInt(amount)).send({from: web3.eth.defaultAccount});
  alert("Añadidos tus " + response.events.Transfer.returnValues.value + " tokens")
}

//******************EXCHANGE**************************************//

async function proposeExchange() {
  var proposerElement = document.getElementById("From");
  var proposerIndex = proposerElement.options[proposerElement.selectedIndex].value;
  var proposerAccount = publicKeys[proposerIndex];
  //var response = await contract.methods.batteriesOfOwner(proposerAccount).call({from: web3.eth.defaultAccount, gas: 30000});
  var item1Element = document.getElementById("itemProposer");
  var item1 = item1Element.options[item1Element.selectedIndex].value;
  var executerElement = document.getElementById("To");
  var executerIndex = executerElement.options[executerElement.selectedIndex].value;
  var executerAccount = publicKeys[executerIndex];
  //if(response2.length == 0) { response2.push("0"); }
  var item2Element = document.getElementById("itemExecuter");
  var item2 = item2Element.options[item2Element.selectedIndex].value;
  var chargeLevel1 = document.getElementById("chargeLevel1").value;
  var chargeLevel2 = document.getElementById("chargeLevel2").value;
  var typeElement = document.getElementById("exchangeType");
  var type = typeElement.options[typeElement.selectedIndex].value;
  if (parseInt(type) == 3) {
    var aux = executerAccount;
    executerAccount = proposerAccount;
    proposerAccount = aux;
  }
  if (parseInt(type) == 1 || parseInt(type) == 2 || parseInt(type) == 3) { item2 = 0; }
  web3.eth.personal.unlockAccount(proposerAccount, password);
  var response3 = await contract.methods.proposeExchange(parseInt(item1), parseInt(item2), parseInt(chargeLevel1), parseInt(chargeLevel2), executerAccount).send({from: proposerAccount});
  alert("Intercambio propuesto con ID: " + response3.events.Proposal.returnValues.proposalId);
  addOptions();
}

async function executeExchange() {
  var executerElement = document.getElementById("Executer");
  var executerIndex = executerElement.options[executerElement.selectedIndex].value;
  var executerAccount = publicKeys[executerIndex];
  var exchangeId = document.getElementById("exchangeId").value;
  web3.eth.personal.unlockAccount(executerAccount, password);
  var response = await contract.methods.executeExchange(exchangeId).send({from: executerAccount});
  console.log(response)
  alert("Usuario " +
    response.events.Execution.returnValues.emiter +
    " entrega batería con ID " +
    response.events.Execution.returnValues.itemEmiter +
    "\nUsuario " +
    response.events.Execution.returnValues.executer +
    " entrega batería con ID " +
    response.events.Execution.returnValues.itemExecuter
  );
  addOptions();
}

async function cancelProposal() {
  var proposerElement = document.getElementById("From");
  var proposerIndex = proposerElement.options[proposerElement.selectedIndex].value;
  var proposerAccount = publicKeys[proposerIndex];
  var exchangeId = document.getElementById("exchangeId2").value;
  web3.eth.personal.unlockAccount(proposerAccount, password);
  var response = await contract.methods.cancelProposal(exchangeId).send({from: proposerAccount});
  console.log(response)
  alert("Se ha cancelado el intercambio con ID: " + response.events.Cancellation.returnValues.proposalId);
}

async function addOptions() {
  var proposerElement = document.getElementById("From");
  var proposerIndex = proposerElement.options[proposerElement.selectedIndex].value;
  var proposerAccount = publicKeys[proposerIndex];
  web3.eth.personal.unlockAccount(web3.eth.defaultAccount, password);
  var response = await contract.methods.batteriesOfOwner(proposerAccount).call({from: web3.eth.defaultAccount});
  var select = document.getElementById("itemProposer");
  select.innerHTML = "";
  if (response.length == 0) {
    var option = document.createElement("option");
    option.text = "No tiene baterías...";
    option.value = 0;
    select.add(option);
  }
  for (value in response) {
    var option = document.createElement("option");
    option.text = response[value];
    option.value = response[value];
    select.add(option);
  }

  var executerElement = document.getElementById("To");
  var executerIndex = executerElement.options[executerElement.selectedIndex].value;
  var executerAccount = publicKeys[executerIndex];
  web3.eth.personal.unlockAccount(web3.eth.defaultAccount, password);
  var response2 = await contract.methods.batteriesOfOwner(executerAccount).call({from: web3.eth.defaultAccount});
  var select2 = document.getElementById("itemExecuter");
  select2.innerHTML = "";
  //var array = ["0"];
  //for (i in response2) {
    //array.push(response2[i]);
  //}
  if (response2.length == 0) {
    var option2 = document.createElement("option");
    option2.text = "No tiene baterías...";
    option2.value = 0;
    select2.add(option2);
  }
  var array = response2;
  for (value2 in array) {
    var option2 = document.createElement("option");
    option2.text = array[value2];
    select2.add(option2);
  }
}

async function changeType() {
  var temporizador = setInterval(function() {
    var typeElement = document.getElementById("exchangeType");
    var type = typeElement.options[typeElement.selectedIndex].value;
    if(type == 1 || type == 2 || type == 3){
      document.getElementById("chargeLevel2").value = 0;
      document.getElementById("chargeLevel2").readOnly = true;
      document.getElementById("itemExecuter").selectedIndex = 0;
      document.getElementById("itemExecuter").disabled = true;
    } else if (type == 0) {
      document.getElementById("chargeLevel2").readOnly = false;
      document.getElementById("itemExecuter").disabled = false;
    }
    if(type == 0) {
      exchangeHeader.innerHTML = "De:";
      exchangeHeader2.innerHTML = "Para:";
    } else if (type == 1) {
      exchangeHeader.innerHTML = "Vendedor:";
      exchangeHeader2.innerHTML = "Comprador:";
    } else if (type == 2) {
      exchangeHeader.innerHTML = "Propietario:";
      exchangeHeader2.innerHTML = "Punto de carga:";
    } else if (type == 3) {
      exchangeHeader.innerHTML = "Propietario:";
      exchangeHeader2.innerHTML = "Punto de carga:";
    }
  }, 100);
}
changeType();

async function changeFrom() {
  let accounts = await web3.eth.getAccounts();
  var from = accounts[0];
  var to = accounts[0];
  var currentFrom = from;
  var currentTo = to;
  var temporizador = setInterval(function() {
    var list = document.getElementById("From");
    var list2 = document.getElementById("To");
    var selected = list.options[list.selectedIndex].value;
    var selected2 = list2.options[list2.selectedIndex].value;
    currentFrom = accounts[selected];
    currentTo = accounts[selected2];
    if((currentFrom !== from) || (currentTo !== to)){
      from = currentFrom;
      to = currentTo;
      addOptions();
    }
  }, 100);
}
changeFrom();


//******************FABRICA***************************************//

async function mintBat() {
  var fabricElement = document.getElementById("Fabric");
  var fabricIndex = fabricElement.options[fabricElement.selectedIndex].value;
  var fabricAccount = publicKeys[fabricIndex];
  var domainElement = document.getElementById("publicDomain");
  var domain = domainElement.options[domainElement.selectedIndex].value;
  if(parseInt(domain) == 1){
    var domainBool = true;
  } else {
    var domainBool = false;
  }
  var value = document.getElementById("initValue").value;
  web3.eth.personal.unlockAccount(fabricAccount, password);
  var response = await contract.methods.mintBat(domainBool, parseInt(value)).send({from: fabricAccount});
  alert("Batería creada con ID: " + response.events.MintBat.returnValues.id);
}

async function burnBat() {
  var fabricElement = document.getElementById("Fabric");
  var fabricIndex = fabricElement.options[fabricElement.selectedIndex].value;
  var fabricAccount = publicKeys[fabricIndex];
  var id = document.getElementById("burnId").value;
  web3.eth.personal.unlockAccount(fabricAccount, password);
  var response = await contract.methods.burnBat(parseInt(id)).send({from: fabricAccount});
  alert("Batería retirada con ID: " + response.events.BurnBat.returnValues.id)
}
