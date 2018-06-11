pragma solidity ^0.4.23;

import "./GenericProposal.sol";

contract WindowedThreshold is GenericProposal {
    uint256 approvalThreshold;

    modifier inVoteWindow(uint256 _id) {
        require(now < proposals[_id].windowEnd);
        _;
    }

    function voteOnProposal(uint256 _id, bool _approve)
        inVoteWindow(_id)
    public {
        Proposal storage p = proposals[_id];
        accountVotes(_id, _approve);
        p.isValid = p.yesTotal >= approvalThreshold;
        inVote[msg.sender].push(_id);
    }
}
