var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//var NODO_ALASTRIA = "http://138.4.143.82:8545";
//var GAS = 4712389;
/*var publicKeys = [
        "0x994319e1b1de09aac4aa5b225a7d5cade79d04ed",
        "0x66c5a820d0e743fc7030f02aa873875c84a88f3f",
        "0x34322a678b16ce26fc0e2bdde1e3c1b666a34a66",
        "0xfc3b00c03b74ee1d94fa10e21aef4e6e9710e8a8",
        "0xf76c62480a8a6a83451eeef40d331ed179da7f89",
        "0x7b1b6d29cb425887d1bc4849d0708091bcbaf16b",
        "0x12e3bb9f253bd233e03bd696b1c558a056179b87",
        "0x59bedaa81edfd70b8e370a96cf29ee327e84e551",
        "0x9a63729158a93f502935bc322af78e4f25a5cc02",
        "0xab2c680816421e56ba3274a37c3df455fba32725"
      ];*/
//var password = prompt("Account: " + publicKeys[0], "Password"); //Alumnos_2018_Q4_IKx5srvT
//var web3 = new Web3(new Web3.providers.HttpProvider(NODO_ALASTRIA));
//web3.eth.personal.unlockAccount(publicKeys[0], password); //habra que hacer el unlock del account antes de cada tx
//web3.eth.defaultAccount = publicKeys[0];


var contractAbi = [{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"mintERC20","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"exchangeId","type":"bytes32"}],"name":"cancelProposal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"itemProposer","type":"uint256"},{"name":"itemExecuter","type":"uint256"},{"name":"proposerChargeLevel","type":"uint256"},{"name":"executerChargeLevel","type":"uint256"},{"name":"executer","type":"address"}],"name":"proposeExchange","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getBattery","outputs":[{"name":"","type":"bool"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"burnBat","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"domain","type":"bool"},{"name":"value","type":"uint256"}],"name":"mintBat","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"itemId","type":"uint256"},{"name":"itemChargeLevel","type":"uint256"}],"name":"getBatValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"globalId","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timeRef","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"batteriesOfOwner","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"exchangeId","type":"bytes32"}],"name":"executeExchange","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"own","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"domain","type":"bool"},{"indexed":false,"name":"time","type":"uint256"}],"name":"MintBat","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"own","type":"address"},{"indexed":false,"name":"id","type":"uint256"}],"name":"BurnBat","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"proposalId","type":"bytes32"},{"indexed":false,"name":"emiter","type":"address"},{"indexed":false,"name":"executer","type":"address"},{"indexed":false,"name":"itemEmiter","type":"uint256"},{"indexed":false,"name":"itemExecuter","type":"uint256"}],"name":"Proposal","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"emiter","type":"address"},{"indexed":false,"name":"executer","type":"address"},{"indexed":false,"name":"itemEmiter","type":"uint256"},{"indexed":false,"name":"itemExecuter","type":"uint256"}],"name":"Execution","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"proposalId","type":"bytes32"}],"name":"Cancellation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];
var contractAddress = "0x9cca28d98ec895c50c266b7f138dd6316aadb52a";
var contract = new web3.eth.Contract(contractAbi, contractAddress);
//calculadora.options.from = publicKeys[0]; //No usar esto
//calculadora.options.gas = GAS;

var publicKeys = ["0xe092b1fa25df5786d151246e492eed3d15ea4daa","0xc0d8f541ab8b71f20c10261818f2f401e8194049","0xf1f8ef6b4d4ba31079e2263ec85c03fd5a0802bf","0xc91579bb7972f76d595f8665bffaf92874c8084c","0x6f03947036cba3279b07cd6ea5ca674ca51e52ba","0x889735777f51c84272a7feb0d763280179a529a9","0x2c46bcb6da3ae85da881edeed4ec2fe92670f90f","0x6a71e87487c0ec01ecffd09a2042cb5ed507393e","0x3e014e5c311a7d6f652ca4f8bb016f4338a44118","0x75c4fb2e81a6d3420125f5145182f528d1699146"]

var privateKeys = ["0x0cc0c2de7e8c30525b4ca3b9e0b9703fb29569060d403261055481df7014f7fa","0xb97de1848f97378ee439b37e776ffe11a2fff415b2f93dc240b2d16e9c184ba9","0x42f3b9b31fcaaa03ca71cab7d194979d0d1bedf16f8f4e9414f0ed4df699dd10","0x41219e3efe938f4b1b5bd68389705be763821460b940d5e2bd221f66f40028d3","0x64530eda5f401cc2e9bba4e7b2e0ba9b1bb9d95c344bf8643776b57bb6eb9845","0x76db32cb46895cdb4473c86b4468dbd45f46c1b3d7972002c72bea74efff18ef","0x3b747127e9ea07790d0fe9b8e5b6508953740d6cf0269d3145cdf1b69c22f2bb","0xc01836866febf10022ec9ae632677937f3070d4ed4819e5c6e03d3e8ec02dc2e","0xdf207d299d941818bb4f7822cf003662370a7d685016dfc3f1e2cac03d47fc1d","0x2d9d98ee99c8f7c664125ff2b3b91f356e880917b2d9fc508ffe1b647bd7a9fd"];

async function changeAdd() {
  let accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  var currentAccount = web3.eth.defaultAccount;
  var temporizador = setInterval(function() {
    var list = document.getElementById("Addresses");
    var selected = list.options[list.selectedIndex].value;
    currentAccount = accounts[selected]
    if(currentAccount !== web3.eth.defaultAccount){
      alert("Last: " + web3.eth.defaultAccount + "," + "New: " + currentAccount);
      web3.eth.defaultAccount = currentAccount;
    }
  }, 100);
}
changeAdd();

//******************USUARIO**************************************//

async function batteriesOfOwner() {
  var response = await contract.methods.batteriesOfOwner(web3.eth.defaultAccount).call({from: web3.eth.defaultAccount, gas: 30000});
  var array = [];
  for (values in response) {
    array.push(response[values]);
  }
  alert("IDs de tus baterías: " + array)
}

async function getBattery() {
  var id = document.getElementById("getBatteryId").value;
  var response = await contract.methods.getBattery(parseInt(id)).call({from: web3.eth.defaultAccount, gas: 30000});
  alert("Dominio público: " + response[0] + "\n" +"Fecha Unix de creación: " + response[1] + "\n" +"Valor inicial: " + response[2] + "\n" +"Punto de carga: " + response[3]);
}

async function ownerOf() {
  var id = document.getElementById("").value;
  var response = await contract.methods.ownerOf(parseInt(id)).call({from: web3.eth.defaultAccount, gas: 30000});
  console.log(response)
}

async function getBatValue() {
  var id = document.getElementById("getBatValueId").value;
  var chargeLevel = document.getElementById("getBatValueLevel").value;
  var response = await contract.methods.getBatValue(parseInt(id), parseInt(chargeLevel)).call({from: web3.eth.defaultAccount, gas: 30000});
  alert("El valor de tu batería es de " + response)
}

async function mintERC20() {
  var amount = document.getElementById("mintAmount").value;
  var response = await contract.methods.mintERC20(parseInt(amount)).send({from: web3.eth.defaultAccount, gas: 300000});
  alert("Añadidos tus " + response.events.Transfer.returnValues.value + " tokens")
}

//******************EXCHANGE**************************************//

async function proposeExchange() {
  var proposerElement = document.getElementById("From");
  var proposerIndex = proposerElement.options[proposerElement.selectedIndex].value;
  var proposerAccount = publicKeys[proposerIndex];
  var response = await contract.methods.batteriesOfOwner(proposerAccount).call({from: web3.eth.defaultAccount, gas: 30000});
  var item1Element = document.getElementById("itemProposer");
  var item1 = response[item1Element.selectedIndex];
  var executerElement = document.getElementById("To");
  var executerIndex = executerElement.options[executerElement.selectedIndex].value;
  var executerAccount = publicKeys[executerIndex];
  var response2 = await contract.methods.batteriesOfOwner(executerAccount).call({from: web3.eth.defaultAccount, gas: 30000});
  if(response2.length == 0) response2.push("0");
  var item2Element = document.getElementById("itemProposer");
  var item2 = response2[item2Element.selectedIndex];
  var chargeLevel1 = document.getElementById("chargeLevel1").value;
  var chargeLevel2 = document.getElementById("chargeLevel2").value;
  var typeElement = document.getElementById("exchangeType");
  var type = typeElement.options[typeElement.selectedIndex].value;
  if (parseInt(type) == 3) {
    var aux = executerAccount;
    executerAccount = proposerAccount;
    proposerAccount = aux;
  }
  var response3 = await contract.methods.proposeExchange(parseInt(item1), parseInt(item2), parseInt(chargeLevel1), parseInt(chargeLevel2), executerAccount).send({from: proposerAccount, gas: 3000000});
  alert("Intercambio propuesto con ID: " + response3.events.Proposal.returnValues.proposalId);
  addOptions();
}

async function executeExchange() {
  var executerElement = document.getElementById("Executer");
  var executerIndex = executerElement.options[executerElement.selectedIndex].value;
  var executerAccount = publicKeys[executerIndex];
  var exchangeId = document.getElementById("exchangeId").value;
  var response = await contract.methods.executeExchange(exchangeId).send({from: executerAccount, gas: 3000000});
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
  var response = await contract.methods.cancelProposal(exchangeId).send({from: proposerAccount, gas: 300000});
  alert("Se ha cancelado el intercambio con ID: " + response.events.Cancellation.returnValues.proposalId);
}

async function addOptions() {
  var proposerElement = document.getElementById("From");
  var proposerIndex = proposerElement.options[proposerElement.selectedIndex].value;
  var proposerAccount = publicKeys[proposerIndex];
  var response = await contract.methods.batteriesOfOwner(proposerAccount).call({from: web3.eth.defaultAccount, gas: 30000});
  var select = document.getElementById("itemProposer");
  select.innerHTML = "";
  if (response.length == 0) {
    var option = document.createElement("option");
    option.text = "No tiene baterías...";
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
  var response2 = await contract.methods.batteriesOfOwner(executerAccount).call({from: web3.eth.defaultAccount, gas: 30000});
  var select2 = document.getElementById("itemExecuter");
  select2.innerHTML = "";
  var array = ["0"];
  for (i in response2) {
    array.push(response2[i]);
  }
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
  var response = await contract.methods.mintBat(domainBool, parseInt(value)).send({from: fabricAccount, gas: 300000});
  alert("Batería creada con ID: " + response.events.MintBat.returnValues.id);
}

async function burnBat() {
  var fabricElement = document.getElementById("Fabric");
  var fabricIndex = fabricElement.options[fabricElement.selectedIndex].value;
  var fabricAccount = publicKeys[fabricIndex];
  var id = document.getElementById("burnId").value;
  var response = await contract.methods.burnBat(parseInt(id)).send({from: fabricAccount, gas: 300000});
  alert("Batería retirada con ID: " + response.events.BurnBat.returnValues.id)
}
