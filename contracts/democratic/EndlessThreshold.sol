pragma solidity ^0.4.23;

import "./GenericProposal.sol";

contract EndlessThreshold is GenericProposal {
    uint256 approvalThreshold;

    function voteOnProposal(uint256 _id, bool _approve)
    public {
        Proposal storage p = proposals[_id];
        accountVotes(_id, _approve);
        p.isValid = p.yesTotal >= approvalThreshold;
        inVote[msg.sender].push(_id);
    }
}
