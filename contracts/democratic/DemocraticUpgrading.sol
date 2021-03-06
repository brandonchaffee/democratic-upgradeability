pragma solidity ^0.4.23;

import "./GenericProposal.sol";

contract DemocraticUpgrading is GenericProposal {
    bytes32 private constant implementationPosition = keccak256("democratic.proxy.contract.position");

    function confirmProposal(uint256 _id) public {
        Proposal storage p = proposals[_id];
        require(now >= p.windowEnd);
        require(p.isValid);
        require(!p.hasBeenApproved);
        p.hasBeenApproved = true;
        upgradeImplementation(implementationPosition, p.target);
    }

    event Upgraded(uint256 indexed time, address indexed newImplmentation);

    function upgradeImplementation(bytes32 position, address implementation)
    internal {
        assembly {
            sstore(position, implementation)
        }
        emit Upgraded(now, implementation);
    }
}
