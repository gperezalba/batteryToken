pragma solidity >=0.4.21 <0.6.0;

import "./SafeMath.sol";
import "./ERC20.sol";

/// @author Guillermo Pérez Alba
/// @title A token designed to exchange motocycle's batteries
contract BatteryToken is ERC20 {
    using SafeMath for uint256;

    //Añadir el cambio de ownership y revisar visibilidad de todo

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

    mapping(uint256 => address) _batteryOwner;
    mapping(uint256 => Battery) _battery;
    mapping(address => uint256[]) _batteriesByOwner;
    mapping(uint256 => uint256) _indexOfId; //starting since 1, use index-1
    mapping(bytes32 => Exchange) _exchanges;

    event MintBat(address own, uint256 id, bool domain, uint time);
    event BurnBat(address own, uint256 id);
    event Proposal(bytes32 proposalId, address emiter, address executer, uint256 itemEmiter, uint256 itemExecuter);
    event Execution(address emiter, address executer, uint256 itemEmiter, uint256 itemExecuter);

    constructor() public {
        owner = msg.sender;
        timeRef = block.timestamp;
        _batteryOwner[globalId] = address(0);
        _battery[globalId].publicDomain = false;
        _battery[globalId].startTime = block.timestamp;
        _battery[globalId].initialValue = 0;
        _indexOfId[globalId] = _batteriesByOwner[address(0)].push(globalId);
    }

    /// @dev Return the IDs of the batteries owned by an owner
    /// @param _owner the address of the owner
    /// @return an array with the IDs of the batteries
    function batteriesOfOwner(address _owner) public view returns (uint256[]) {
        return _batteriesByOwner[_owner];
    }

    /// @dev Return the owner of a certain battery ID
    /// @param id the ID of the battery
    /// @return the address of the owner. When address(0) battery doesn't exist
    function ownerOf(uint256 id) public view returns (address) {
        return _batteryOwner[id];
    }

    /// @dev Return the details of a certain battery ID
    /// @param id the ID of the battery
    function getBattery(uint256 id) public view returns (bool, uint256, uint256, address) {
        return (_battery[id].publicDomain, _battery[id].startTime, _battery[id].initialValue, _battery[id].privateCharger);
    }

    /// @dev Mints a new battery with the next Global ID
    /// @param _publicDomain True when battery is public, False when private
    /// @param _value Initial value of the battery
    /// @return the ID of the new battery
    function mintBat(bool _publicDomain, uint256 _value) public returns (uint256) {
        //todos pueden añadir baterias? hacer un require para solo algunas address autorizadas?
        globalId = globalId.add(1);
        _batteryOwner[globalId] = msg.sender;
        _battery[globalId].publicDomain = _publicDomain;
        _battery[globalId].startTime = block.timestamp;
        _battery[globalId].initialValue = _value;
        _indexOfId[globalId] = _batteriesByOwner[msg.sender].push(globalId);
        emit MintBat(_batteryOwner[globalId], globalId, _battery[globalId].publicDomain, _battery[globalId].startTime);
        return globalId;
    }

    /// @dev The battery stops existing in the contract
    /// @param id the ID of the battery
    function burnBat(uint256 id) public returns (bool) {
        //Si el mint lo hacen las fabricas los puntos de carga se las compran y cuando estas tengan un valor
        //muuy bajo se las vuelven a vender y las fabricas hacen el burn. Si alguien hace burn antes pierde ese dinero
        require(msg.sender == _batteryOwner[id], "Only the owner can burn");
        _batteryOwner[id] = address(0);
        removeFromArray(id, msg.sender);
        //Devolver valor en ether a su cuenta real en Ethers????
        emit BurnBat(msg.sender, id);
        return true;
    }

    /// @dev Remove a battery of the array of batteries for an owner
    /// @param _id the ID of the battery
    /// @param _owner the address of the current owner
    function removeFromArray (uint256 _id, address _owner) private returns (bool) {
        uint256 index = _indexOfId[_id];
        if (index == 0) return;

        if(_batteriesByOwner[_owner].length > 1) {
            _batteriesByOwner[_owner][index.sub(1)] = _batteriesByOwner[_owner][_batteriesByOwner[_owner].length.sub(1)];
        }
        _batteriesByOwner[_owner].length --;
        return true;
    }

    /// @dev Propose an exchange of batteries (or token) to another address
    /// @param _itemProposer ID of the battery the proposer exchanges
    /// @param _itemExecuter ID of the battery the executer exchanges. Is 0 when Sell or Private Exchange
    /// @param proposerChargeLevel Current level of the battery owned by the proposer (between 0-100)
    /// @param executerChargeLevel Current level of the battery owned by the executer (between 0-100). Is 0 when Sell or Private Exchange
    /// @param _executer the address of the executer
    /// @return a bytes32 with the ID of the exchange
    function proposeExchange(
        uint256 _itemProposer,
        uint256 _itemExecuter,
        uint256 proposerChargeLevel,
        uint256 executerChargeLevel,
        address _executer
    )
        public
        returns (bytes32)
    {
        require((msg.sender == _batteryOwner[_itemProposer] || msg.sender == _battery[_itemProposer].privateCharger), "Wrong msg.sender");
        bytes32 _exchangeId = bytes32(keccak256(abi.encodePacked(block.timestamp, _itemProposer, _itemExecuter, msg.sender, _executer)));
        _exchanges[_exchangeId].itemProposer = _itemProposer;
        _exchanges[_exchangeId].proposer = msg.sender;
        _exchanges[_exchangeId].executer = _executer;
        if (_battery[_itemProposer].publicDomain) {
            _exchanges[_exchangeId].itemExecuter = _itemExecuter;
            _exchanges[_exchangeId].valueProposer = getBatValue(_itemProposer, proposerChargeLevel);
            _exchanges[_exchangeId].valueExecuter = getBatValue(_itemExecuter, executerChargeLevel);
        } else {
            _exchanges[_exchangeId].valueProposer = CHARGEPRICE.mul(proposerChargeLevel).div(100).mul(getBatValue(_itemProposer, 100)).div(_battery[_itemProposer].initialValue);
        }

        if (_exchanges[_exchangeId].valueProposer <= _exchanges[_exchangeId].valueExecuter){
            super.approve(_executer, _exchanges[_exchangeId].valueExecuter.sub(_exchanges[_exchangeId].valueProposer));
            //redefinir aqui la funcion approve para que si expira el tiempo pierda lo aprobado
            //o para no jugarsela con esto hacer que el más caro proponga y el mas barato execute
        }
        _exchanges[_exchangeId].proposedTime = block.timestamp;
        _exchanges[_exchangeId].proposed = true;
        emit Proposal(_exchangeId, msg.sender, _executer, _itemProposer, _itemExecuter);
        return _exchangeId;
    }

    /// @dev Execute an exchange previously proposed
    /// @param _exchangeId the ID of the exchange to execute
    function executeExchange(bytes32 _exchangeId) public returns (bool) {
        require(_exchanges[_exchangeId].proposed, "This exchange id does not exist");
        //meter un !executed
        require(msg.sender == _exchanges[_exchangeId].executer, "msg.sender must be the executer");
        require(block.timestamp.sub(_exchanges[_exchangeId].proposedTime) < PROPOSALTIME, "Proposal time expired");
        if (_exchanges[_exchangeId].valueProposer >= _exchanges[_exchangeId].valueExecuter){
            super.transfer(_exchanges[_exchangeId].proposer, _exchanges[_exchangeId].valueProposer.sub(_exchanges[_exchangeId].valueExecuter));
        } else {
            super.transferFrom(_exchanges[_exchangeId].proposer, msg.sender, _exchanges[_exchangeId].valueExecuter.sub(_exchanges[_exchangeId].valueProposer));
        }
        if (_battery[_exchanges[_exchangeId].itemProposer].publicDomain) {
            if (_exchanges[_exchangeId].itemProposer != 0) {
                removeFromArray(_exchanges[_exchangeId].itemProposer, _exchanges[_exchangeId].proposer);
                _batteryOwner[_exchanges[_exchangeId].itemProposer] = msg.sender;
                _indexOfId[_exchanges[_exchangeId].itemProposer] = _batteriesByOwner[msg.sender].push(_exchanges[_exchangeId].itemProposer);
            }
            if (_exchanges[_exchangeId].itemExecuter != 0) {
                removeFromArray(_exchanges[_exchangeId].itemExecuter, msg.sender);
                _batteryOwner[_exchanges[_exchangeId].itemExecuter] = _exchanges[_exchangeId].proposer;
                _indexOfId[_exchanges[_exchangeId].itemExecuter] = _batteriesByOwner[_exchanges[_exchangeId].proposer].push(_exchanges[_exchangeId].itemExecuter);
            }
        } else if (msg.sender == _batteryOwner[_exchanges[_exchangeId].itemProposer]) {
            //retirada
            _battery[_exchanges[_exchangeId].itemProposer].privateCharger = address(0);
        } else {
            //entrega al pto carga
            _battery[_exchanges[_exchangeId].itemProposer].privateCharger = msg.sender;
        }
        _exchanges[_exchangeId].executed = true;
        emit Execution(_exchanges[_exchangeId].proposer, msg.sender, _exchanges[_exchangeId].itemProposer, _exchanges[_exchangeId].itemExecuter);
    }

    /// @dev Return the value of a certain battery ID with a certain level of charge.
    /// @param _itemId the ID of the battery
    /// @param _itemChargeLevel the current level of charge of the battery (between 0-100)
    /// @return the current value of the battery
    function getBatValue(uint256 _itemId, uint256 _itemChargeLevel) public view returns(uint256){
        if (_itemId == 0) {
            return 0;
        } else {
            uint256 value = _battery[_itemId].initialValue
            .sub(block.timestamp.sub(_battery[_itemId].startTime))
            .add(
              CHARGEPRICE
                .mul(_itemChargeLevel)
                .div(100)
                .mul(_battery[_itemId].initialValue.sub(block.timestamp.sub(_battery[_itemId].startTime)))
                .div(_battery[_itemId].initialValue)
            );
            require((value >= 0 || value <= _battery[_itemId].initialValue.add(CHARGEPRICE)), "Bad value");
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
