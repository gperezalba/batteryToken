pragma solidity >=0.4.21 <0.6.0;

import "./SafeMath.sol";
import "./ERC20.sol";

contract BatteryToken is ERC20 {
    using SafeMath for uint256;

    //Añadir el cambio de ownership y revisar visibilidad de todo

    //Variables
    address public owner; //Owner of the contract
    uint256 public timeRef; //Time reference for the hole contract
    uint256 public globalId; //Unique identifier for batteries
    uint256 constant CHARGEPRICE = 7; //Final value depends on the lifeTime of the battery
    uint256 constant PROPOSALTIME = 10 * 1 minutes; //Max time since proposal until execution

    //struct
    struct Battery {
        uint256 initialValue; //Value of the battery the 0 day
        bool publicDomain; //True si la bateria es publica False privada//cambiar por enum?
        address privateCharger; //If private the battery can be assigned temporary to a charger
        uint256 startTime; //0 day of the battery
    }

    struct Exchange {
        uint256 itemProposer; //Id of the battery that owns the proposer
        uint256 itemExecuter; //Id of the battery that owns the executer (if 0 is a Sell)
        address proposer;
        address executer;
        uint256 valueProposer; //Vale of the battery that owns the proposer
        uint256 valueExecuter; //Value of the battery that owns the executer (if 0 is a Sell)
        uint256 proposedTime; //Time of proposal
        bool proposed; //True when the exchange is proposed
        bool executed; //True when the exchange is executed
    }

    //mapping
    mapping(uint256 => address) _batteryOwner;
    mapping(uint256 => Battery) _battery;
    mapping(bytes32 => Exchange) _exchanges;

    //event
    event MintBat(address own, uint256 id, bool domain, uint time);
    event BurnBat(address own, uint256 id);
    event Proposal(bytes32 proposalId, address emiter, address executer, uint256 itemEmiter, uint256 itemExecuter);
    event Execution(address emiter, address executer, uint256 itemEmiter, uint256 itemExecuter);

    //modifier
    modifier onlyPublic(uint256 _batId){
        require(_battery[_batId].publicDomain, 'Required public item');
        _;
    }

    modifier onlyPrivate(uint256 _batId){
        require(!_battery[_batId].publicDomain, 'Required private item');
        _;
    }

    //Functions
    constructor() public {
        owner = msg.sender;
        timeRef = now;
        _batteryOwner[globalId] = address(0);
        _battery[globalId].publicDomain = false;
        _battery[globalId].startTime = now;
        _battery[globalId].initialValue = 0;
    }

    //Returns the owner of a battery. If address(0) battery doesn't exist
    function ownerOf(uint256 id) public view returns (address) {
        return _batteryOwner[id];
    }

    function getBattery(uint256 id) public view returns (bool, uint256, uint256, address) {
        return (_battery[id].publicDomain, _battery[id].startTime, _battery[id].initialValue, _battery[id].privateCharger);
    }

    function mintBat(bool _publicDomain, uint256 _value) public returns (uint256) {
        //todos pueden añadir baterias? hacer un require para solo algunas address autorizadas?
        globalId = globalId.add(1);
        _batteryOwner[globalId] = msg.sender;
        _battery[globalId].publicDomain = _publicDomain;
        _battery[globalId].startTime = now;
        _battery[globalId].initialValue = _value; //no puede ser fijo, ver cómo hacer!!!!!!!!!!!!!!!!!!!
        emit MintBat(_batteryOwner[globalId], globalId, _battery[globalId].publicDomain, _battery[globalId].startTime);
        return globalId;
    }

    function burnBat(uint256 id) public returns(bool){
        //Si el mint lo hacen las fabricas los puntos de carga se las compran y cuando estas tengan un valor
        //muuy bajo se las vuelven a vender y las fabricas hacen el burn. Si alguien hace burn antes pierde ese dinero
        require(msg.sender == _batteryOwner[id], 'Only the owner can burn');
        _batteryOwner[id] = address(0);
        //Devolver valor en ether a su cuenta real en Ethers????
        emit BurnBat(msg.sender, id);
        return true;
    }

    function proposeExchange(uint256 _itemProposer, uint256 _itemExecuter, uint256 proposerChargeLevel, uint256 executerChargeLevel, address _executer) public returns (bytes32) {
        require((msg.sender == _batteryOwner[_itemProposer] || msg.sender == _battery[_itemProposer].privateCharger), 'Msg.sender must be the owner of the 1st item');
        bytes32 _exchangeId = bytes32(keccak256(abi.encodePacked(now, _itemProposer, _itemExecuter, msg.sender, _executer)));
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
            super.approve(_executer, _exchanges[_exchangeId].valueProposer.sub(_exchanges[_exchangeId].valueExecuter));
            //redefinir aqui la funcion approve para que si expira el tiempo pierda lo aprobado
            //o para no jugarsela con esto hacer que el más caro proponga y el mas barato execute
        }
        _exchanges[_exchangeId].proposedTime = now;
        _exchanges[_exchangeId].proposed = true;
        emit Proposal(_exchangeId, msg.sender, _executer, _itemProposer, _itemExecuter);
        return _exchangeId;
    }

    function executeExchange(bytes32 _exchangeId) public returns (bool) {
        require(_exchanges[_exchangeId].proposed, 'This exchange id does not exist');
        //meter un !executed
        require(msg.sender == _exchanges[_exchangeId].executer, 'msg.sender must be the executer');
        require(now.sub(_exchanges[_exchangeId].proposedTime) < PROPOSALTIME, 'Proposal time expired');
        if (_exchanges[_exchangeId].valueProposer >= _exchanges[_exchangeId].valueExecuter){
            super.transfer(_exchanges[_exchangeId].proposer, _exchanges[_exchangeId].valueProposer.sub(_exchanges[_exchangeId].valueExecuter));
        } else {
            super.transferFrom(_exchanges[_exchangeId].proposer, msg.sender, _exchanges[_exchangeId].valueProposer.sub(_exchanges[_exchangeId].valueExecuter));
        }
        if (_battery[_exchanges[_exchangeId].itemProposer].publicDomain) {
            _batteryOwner[_exchanges[_exchangeId].itemProposer] = msg.sender;
            _batteryOwner[_exchanges[_exchangeId].itemExecuter] = _exchanges[_exchangeId].proposer;
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

    function getBatValue(uint256 _itemId, uint256 _itemChargeLevel) public view returns(uint256){
        if (_itemId == 0) {
            return 0;
        } else {
            uint256 value = _battery[_itemId].initialValue
            .sub(now.sub(_battery[_itemId].startTime))
            .add(
              CHARGEPRICE
                .mul(_itemChargeLevel)
                .div(100)
                .mul(_battery[_itemId].initialValue.sub(now.sub(_battery[_itemId].startTime)))
                .div(_battery[_itemId].initialValue)
            );
            require((value >= 0 || value <= _battery[_itemId].initialValue.add(CHARGEPRICE)), "Bad value");
            return value;
        }

    }

    function mintERC20(uint256 amount) public returns(bool){
        super._mint(msg.sender, amount);
        return true;
    }

}
