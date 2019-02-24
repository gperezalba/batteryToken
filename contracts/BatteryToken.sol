pragma solidity 0.4.25;

import "./SafeMath.sol";
import "./ERC20.sol";
import "./Owned.sol";
import "./Mortal.sol";

/// @author Guillermo Perez Alba
/// @title A token designed to exchange motocycle's batteries
contract BatteryToken is ERC20, Owned, Mortal {
    using SafeMath for uint256;

    //Anhadir el cambio de ownership y revisar visibilidad de todo

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
    }

    mapping(uint256 => address) batteryOwner;
    mapping(uint256 => Battery) battery;
    mapping(address => uint256[]) batteriesByOwner;
    mapping(uint256 => uint256) indexOfId; //starting since 1, use index-1
    mapping(bytes32 => Exchange) exchanges;

    event MintBat(address own, uint256 id, bool domain, uint time);
    event BurnBat(address own, uint256 id);
    event Proposal(bytes32 proposalId, address emiter, address executer, uint256 itemEmiter, uint256 itemExecuter);
    event Execution(address emiter, address executer, uint256 itemEmiter, uint256 itemExecuter);

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

    /// @dev Remove a battery of the array of batteries for an owner
    /// @param id the ID of the battery
    /// @param who the address of the current owner
    function removeFromArray (uint256 id, address who) private {
        uint256 index = indexOfId[id];
        if (index == 0) return;

        if(batteriesByOwner[who].length > 1) {
            batteriesByOwner[who][index.sub(1)] = batteriesByOwner[who][batteriesByOwner[who].length.sub(1)];
        }
        batteriesByOwner[who].length --;
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

        if (exchanges[exchangeId].valueProposer <= exchanges[exchangeId].valueExecuter){
            super.approve(executer, exchanges[exchangeId].valueExecuter.sub(exchanges[exchangeId].valueProposer));
            //redefinir aqui la funcion approve para que si expira el tiempo pierda lo aprobado
            //o para no jugarsela con esto hacer que el mas caro proponga y el mas barato execute
        }
        exchanges[exchangeId].proposedTime = block.timestamp;
        exchanges[exchangeId].proposed = true;
        emit Proposal(exchangeId, msg.sender, executer, itemProposer, itemExecuter);
        return exchangeId;
    }

    /// @dev Execute an exchange previously proposed
    /// @param exchangeId the ID of the exchange to execute
    function executeExchange(bytes32 exchangeId) public {
        require(exchanges[exchangeId].proposed, "This exchange id does not exist");
        //meter un !executed
        require(msg.sender == exchanges[exchangeId].executer, "msg.sender must be the executer");
        require(block.timestamp.sub(exchanges[exchangeId].proposedTime) < PROPOSALTIME, "Proposal time expired");
        if (exchanges[exchangeId].valueProposer >= exchanges[exchangeId].valueExecuter){
            super.transfer(exchanges[exchangeId].proposer, exchanges[exchangeId].valueProposer.sub(exchanges[exchangeId].valueExecuter));
        } else {
            super.transferFrom(exchanges[exchangeId].proposer, msg.sender, exchanges[exchangeId].valueExecuter.sub(exchanges[exchangeId].valueProposer));
        }
        if (battery[exchanges[exchangeId].itemProposer].publicDomain) {
            if (exchanges[exchangeId].itemProposer != 0) {
                removeFromArray(exchanges[exchangeId].itemProposer, exchanges[exchangeId].proposer);
                batteryOwner[exchanges[exchangeId].itemProposer] = msg.sender;
                indexOfId[exchanges[exchangeId].itemProposer] = batteriesByOwner[msg.sender].push(exchanges[exchangeId].itemProposer);
            }
            if (exchanges[exchangeId].itemExecuter != 0) {
                removeFromArray(exchanges[exchangeId].itemExecuter, msg.sender);
                batteryOwner[exchanges[exchangeId].itemExecuter] = exchanges[exchangeId].proposer;
                indexOfId[exchanges[exchangeId].itemExecuter] = batteriesByOwner[exchanges[exchangeId].proposer].push(exchanges[exchangeId].itemExecuter);
            }
        } else if (msg.sender == batteryOwner[exchanges[exchangeId].itemProposer]) {
            //retirada
            battery[exchanges[exchangeId].itemProposer].privateCharger = address(0);
        } else {
            //entrega al pto carga
            battery[exchanges[exchangeId].itemProposer].privateCharger = msg.sender;
        }
        exchanges[exchangeId].executed = true;
        emit Execution(exchanges[exchangeId].proposer, msg.sender, exchanges[exchangeId].itemProposer, exchanges[exchangeId].itemExecuter);
    }

    /// @dev Return the value of a certain battery ID with a certain level of charge.
    /// @param itemId the ID of the battery
    /// @param itemChargeLevel the current level of charge of the battery (between 0-100)
    /// @return the current value of the battery
    function getBatValue(uint256 itemId, uint256 itemChargeLevel) public view returns(uint256){
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
            require((value >= 0 || value <= battery[itemId].initialValue.add(CHARGEPRICE)), "Bad value");
            return value;
        }

    }

    /// @dev Mints a certain amount of ERC20 token to the msg.sender
    /// @param amount the amount of tokens to mint
    function mintERC20(uint256 amount) public returns(bool){
        super._mint(msg.sender, amount);
        return true;
    }

}
