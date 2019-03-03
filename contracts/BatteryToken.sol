pragma solidity 0.4.25;

import "./SafeMath.sol";
import "./ERC20.sol";
import "./Owned.sol";
import "./Mortal.sol";

/// @author Guillermo Perez Alba
/// @title A token designed to exchange motocycle's batteries
contract BatteryToken is ERC20, Owned, Mortal {
    using SafeMath for uint256;

    address public owner;
    uint256 public timeRef;
    uint256 public globalId;
    uint256 constant CHARGEPRICE = 7;
    uint256 constant PROPOSALTIME = 10 * 1 minutes;

    struct Battery {
        uint256 initialValue;
        bool publicDomain; //True for public. False for private
        address privateCharger;
        uint256 startTime;
    }

    struct Exchange {
        uint256 itemProposer;
        uint256 itemExecuter;
        address proposer;
        address executer;
        uint256 valueProposer;
        uint256 valueExecuter;
        uint256 proposedTime;
        bool proposed;
        bool executed;
        bool cancelled;
    }

    mapping(uint256 => address) batteryOwner;
    mapping(uint256 => Battery) battery;
    mapping(address => uint256[]) batteriesByOwner;
    mapping(uint256 => uint256) indexOfId; //starting since 1, use index-1
    mapping(bytes32 => Exchange) exchanges;
    mapping(address => uint256) lockedBalances;
    mapping(uint256 => address) lockedBatteries;

    event MintBat(address own, uint256 id, bool domain, uint time);
    event BurnBat(address own, uint256 id);
    event Proposal(bytes32 proposalId, address emiter, address executer, uint256 itemEmiter, uint256 itemExecuter);
    event Execution(address emiter, address executer, uint256 itemEmiter, uint256 itemExecuter);
    event Cancellation(bytes32 proposalId);
    event Debug(uint256, uint256, uint256);

    constructor() public {
        owner = msg.sender;
        timeRef = block.timestamp;
        batteryOwner[globalId] = address(0);
        battery[globalId].publicDomain = false;
        battery[globalId].startTime = block.timestamp;
        battery[globalId].initialValue = 0;
        indexOfId[globalId] = batteriesByOwner[address(0)].push(globalId);
    }

    /// @dev Return the IDs of the batteries owned by an owner
    /// @param who the address of the owner
    /// @return an array with the IDs of the batteries
    function batteriesOfOwner(address who) public view returns (uint256[]) {
        return batteriesByOwner[who];
    }

    /// @dev Return the owner of a certain battery ID
    /// @param id the ID of the battery
    /// @return the address of the owner. When address(0) battery doesn't exist
    function ownerOf(uint256 id) public view returns (address) {
        return batteryOwner[id];
    }

    /// @dev Return the details of a certain battery ID
    /// @param id the ID of the battery
    function getBattery(uint256 id) public view returns (bool, uint256, uint256, address) {
        return (battery[id].publicDomain, battery[id].startTime, battery[id].initialValue, battery[id].privateCharger);
    }

    /// @dev Mints a new battery with the next Global ID
    /// @param domain True when battery is public, False when private
    /// @param value Initial value of the battery
    /// @return the ID of the new battery
    function mintBat(bool domain, uint256 value) public returns (uint256) {
        //todos pueden anhadir baterias? hacer un require para solo algunas address autorizadas?
        globalId = globalId.add(1);
        batteryOwner[globalId] = msg.sender;
        battery[globalId].publicDomain = domain;
        battery[globalId].startTime = block.timestamp;
        battery[globalId].initialValue = value;
        indexOfId[globalId] = batteriesByOwner[msg.sender].push(globalId);
        emit MintBat(batteryOwner[globalId], globalId, battery[globalId].publicDomain, battery[globalId].startTime);
        return globalId;
    }

    /// @dev The battery stops existing in the contract
    /// @param id the ID of the battery
    function burnBat(uint256 id) public {
        //Si el mint lo hacen las fabricas los puntos de carga se las compran y cuando estas tengan un valor
        //muuy bajo se las vuelven a vender y las fabricas hacen el burn. Si alguien hace burn antes pierde ese dinero
        require(msg.sender == batteryOwner[id], "Only the owner can burn");
        batteryOwner[id] = address(0);
        removeFromArray(id, msg.sender);
        //Devolver valor en ether a su cuenta real en Ethers????
        emit BurnBat(msg.sender, id);
    }

    /// @dev Propose an exchange of batteries (or token) to another address
    /// @param itemProposer ID of the battery the proposer exchanges
    /// @param itemExecuter ID of the battery the executer exchanges. Is 0 when Sell or Private Exchange
    /// @param proposerChargeLevel Current level of the battery owned by the proposer (between 0-100)
    /// @param executerChargeLevel Current level of the battery owned by the executer (between 0-100). Is 0 when Sell or Private Exchange
    /// @param executer the address of the executer
    /// @return a bytes32 with the ID of the exchange
    function proposeExchange(
        uint256 itemProposer,
        uint256 itemExecuter,
        uint256 proposerChargeLevel,
        uint256 executerChargeLevel,
        address executer
    )
        public
        returns (bytes32)
    {
        require((msg.sender == batteryOwner[itemProposer] || msg.sender == battery[itemProposer].privateCharger), "Wrong msg.sender");
        bytes32 exchangeId = bytes32(keccak256(abi.encodePacked(block.timestamp, itemProposer, itemExecuter, msg.sender, executer)));
        exchanges[exchangeId].itemProposer = itemProposer;
        exchanges[exchangeId].proposer = msg.sender;
        exchanges[exchangeId].executer = executer;
        if (battery[itemProposer].publicDomain) {
            exchanges[exchangeId].itemExecuter = itemExecuter;
            exchanges[exchangeId].valueProposer = getBatValue(itemProposer, proposerChargeLevel);
            exchanges[exchangeId].valueExecuter = getBatValue(itemExecuter, executerChargeLevel);
        } else {
            exchanges[exchangeId].valueProposer = CHARGEPRICE.mul(proposerChargeLevel).div(100).mul(getBatValue(itemProposer, 100)).div(battery[itemProposer].initialValue);
        }
        if (exchanges[exchangeId].valueProposer < exchanges[exchangeId].valueExecuter){
            lockBalance(exchanges[exchangeId].valueExecuter.sub(exchanges[exchangeId].valueProposer));
        }
        if (battery[itemProposer].publicDomain) { lockBattery(itemProposer); }
        exchanges[exchangeId].proposedTime = block.timestamp;
        exchanges[exchangeId].proposed = true;
        emit Proposal(exchangeId, msg.sender, executer, itemProposer, itemExecuter);
        return exchangeId;
    }

    /// @dev Execute an exchange previously proposed
    /// @param exchangeId the ID of the exchange to execute
    function executeExchange(bytes32 exchangeId) public {
        require(exchanges[exchangeId].proposed, "This exchange id does not exist");
        require(!exchanges[exchangeId].executed, "Already executed");
        require(!exchanges[exchangeId].cancelled, "Execution cancelled");
        require(msg.sender == exchanges[exchangeId].executer, "msg.sender must be the executer");
        require(block.timestamp.sub(exchanges[exchangeId].proposedTime) < PROPOSALTIME, "Proposal time expired");
        if (exchanges[exchangeId].valueProposer > exchanges[exchangeId].valueExecuter){
            lockBalance(exchanges[exchangeId].valueProposer.sub(exchanges[exchangeId].valueExecuter));
        }
        if (exchanges[exchangeId].itemExecuter != 0) { lockBattery(exchanges[exchangeId].itemExecuter); }
        finishExchange(exchangeId);
    }

    // @dev cancell a Proposal in case proposer did an approve
    // @param exchangeIdthe ID of the exchange to cancell
    function cancelProposal(bytes32 exchangeId) public {
        require(exchanges[exchangeId].proposed, "This exchange id does not exist");
        require(!exchanges[exchangeId].executed, "Already executed");
        require(msg.sender == exchanges[exchangeId].proposer, "Wrong msg.sender");
        unlockBalance();
        unlockBattery(exchanges[exchangeId].itemProposer);
        exchanges[exchangeId].cancelled = true;
        emit Cancellation(exchangeId);
    }

    /// @dev Return the value of a certain battery ID with a certain level of charge.
    /// @param itemId the ID of the battery
    /// @param itemChargeLevel the current level of charge of the battery (between 0-100)
    /// @return the current value of the battery
    function getBatValue(uint256 itemId, uint256 itemChargeLevel) public view returns(uint256){
        require((itemChargeLevel >= 0) || (itemChargeLevel <= 100), "Bad charge level");
        if (itemId == 0) {
            return 0;
        } else {
            uint256 value = battery[itemId].initialValue
            .sub(block.timestamp.sub(battery[itemId].startTime))
            .add(
              CHARGEPRICE
                .mul(itemChargeLevel)
                .div(100)
                .mul(battery[itemId].initialValue.sub(block.timestamp.sub(battery[itemId].startTime)))
                .div(battery[itemId].initialValue)
            );
            assert(value >= 0 || value <= battery[itemId].initialValue.add(CHARGEPRICE));
            return value;
        }

    }

    /// @dev Mints a certain amount of ERC20 token to the msg.sender
    /// @param amount the amount of tokens to mint
    function mintERC20(uint256 amount) public returns(bool){
        super._mint(msg.sender, amount);
        return true;
    }

    /// @dev Locks an amount of ERC20 in the contract account
    /// @param amount the amount of tokens to lock
    function lockBalance(uint256 amount) private {
        require(amount >= 0, "Negative amount");
        require(balanceOf(msg.sender) >= amount, "Not enough balance");
        transfer(address(this), amount);
        lockedBalances[msg.sender] = lockedBalances[msg.sender].add(amount);
    }

    /// @dev Unlocks the amount of ERC20 locked in the contract account for the msg.sender
    function unlockBalance() private {
        if(lockedBalances[msg.sender] != 0) {
            if (!address(this).call(abi.encodeWithSignature("transfer(address,uint256)", msg.sender, lockedBalances[msg.sender]))) {
                revert("Error when transfer from contract to msgsender");
            }
        }
    }

    /// @dev Locks a battery in the contract account
    /// @param id the ID of the battery to lock
    function lockBattery(uint256 id) private {
        require(msg.sender == batteryOwner[id], "Not the owner to lock");
        changeBatteryOwner(address(this), id);
        lockedBatteries[id] = msg.sender;
    }

    /// @dev Unlocks a battery and returns it to the original owner
    /// @param id the ID of the battery to unlock
    function unlockBattery(uint256 id) private {
        require(msg.sender == lockedBatteries[id], "Not the owner to unlock");
        if (!address(this).call(abi.encodeWithSignature("changeBatteryOwner(address,uint256)", lockedBatteries[id], id))) {
            revert("Error when changeBatteryOwner from contract to msg.sender");
        }
    }

    /// @dev Changes the owner of a certain battery
    /// @param newOwner the address of the new owner
    /// @param id the ID of the battery to change the owner
    function changeBatteryOwner(address newOwner, uint256 id) public {
        require(msg.sender == batteryOwner[id], "Not the owner to change");
        removeFromArray(id, msg.sender);
        batteryOwner[id] = newOwner;
        indexOfId[id] = batteriesByOwner[newOwner].push(id);
    }

    /// @dev Checks the conditions to finish the exchange and does the exchange
    /// @param exchangeId ID of the exchange 
    function finishExchange(bytes32 exchangeId) private {
        if (battery[exchanges[exchangeId].itemProposer].publicDomain) {
            require(address(this) == batteryOwner[exchanges[exchangeId].itemProposer], "Proposer's battery not locked");
        }
        if (battery[exchanges[exchangeId].itemExecuter].publicDomain) {
            require(address(this) == batteryOwner[exchanges[exchangeId].itemExecuter], "Executor's battery not locked");
        }
        if (exchanges[exchangeId].valueProposer > exchanges[exchangeId].valueExecuter){
            require(lockedBalances[exchanges[exchangeId].executer] >= exchanges[exchangeId].valueProposer.sub(exchanges[exchangeId].valueExecuter), "Exec balance not locked");
            lockedBalances[exchanges[exchangeId].executer] = lockedBalances[exchanges[exchangeId].executer].sub(exchanges[exchangeId].valueProposer.sub(exchanges[exchangeId].valueExecuter));
            if (!address(this).call(abi.encodeWithSignature("transfer(address,uint256)", exchanges[exchangeId].proposer, exchanges[exchangeId].valueProposer.sub(exchanges[exchangeId].valueExecuter)))) {
                revert("Error when transfer from contract to proposer");
            }
        } else {
            require(lockedBalances[exchanges[exchangeId].proposer] >= exchanges[exchangeId].valueExecuter.sub(exchanges[exchangeId].valueProposer), "Prop balance not locked");
            lockedBalances[exchanges[exchangeId].proposer] = lockedBalances[exchanges[exchangeId].proposer].sub(exchanges[exchangeId].valueExecuter.sub(exchanges[exchangeId].valueProposer));
            if (!address(this).call(abi.encodeWithSignature("transfer(address,uint256)", exchanges[exchangeId].executer, exchanges[exchangeId].valueExecuter.sub(exchanges[exchangeId].valueProposer)))) {
                revert("Error when transfer from contract to executer");
            }
        }
        if (battery[exchanges[exchangeId].itemProposer].publicDomain) {
            if (exchanges[exchangeId].itemProposer != 0) {
                if (!address(this).call(abi.encodeWithSignature("changeBatteryOwner(address,uint256)", exchanges[exchangeId].executer, exchanges[exchangeId].itemProposer))) {
                    revert("Error when changeBatteryOwner from contract to executer");
                }
            }
            if (exchanges[exchangeId].itemExecuter != 0) {
                if (!address(this).call(abi.encodeWithSignature("changeBatteryOwner(address,uint256)", exchanges[exchangeId].proposer, exchanges[exchangeId].itemExecuter))) {
                    revert("Error when changeBatteryOwner from contract to proposer");
                }
            }
        } else if (msg.sender == batteryOwner[exchanges[exchangeId].itemProposer]) {
            battery[exchanges[exchangeId].itemProposer].privateCharger = address(0);
        } else {
            battery[exchanges[exchangeId].itemProposer].privateCharger = msg.sender;
        }
        exchanges[exchangeId].executed = true;
        emit Execution(exchanges[exchangeId].proposer, msg.sender, exchanges[exchangeId].itemProposer, exchanges[exchangeId].itemExecuter);
    }

    /// @dev Remove a battery of the array of batteries for an owner
    /// @param id the ID of the battery
    /// @param who the address of the current owner
    function removeFromArray (uint256 id, address who) private {
        uint256 index = indexOfId[id];
        if (index == 0) return;
        if (batteriesByOwner[who].length != 0){
            if (batteriesByOwner[who].length > 1) {
                batteriesByOwner[who][index.sub(1)] = batteriesByOwner[who][batteriesByOwner[who].length.sub(1)];
                indexOfId[batteriesByOwner[who][index.sub(1)]] = index;
            }
            batteriesByOwner[who].length --;
        }
    }

}
