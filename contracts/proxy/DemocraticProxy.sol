pragma solidity ^0.4.21;

import "./Proxy.sol";

contract DemocraticProxy is Proxy {

    bytes32 private constant implementationPosition = keccak256("democratic.proxy.contract.position");

    constructor(address _initialContract) public {
        bytes32 position = implementationPosition;
        assembly {
            sstore(position, _initialContract)
        }
    }
}
