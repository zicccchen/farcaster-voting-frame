// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Voting
 * @notice 简单的链上投票合约，用于 Farcaster Frame
 * @dev 支持创建投票提案和进行投票
 */
contract Voting {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 endTime;
        bool active;
        address creator;
    }

    struct Vote {
        bool hasVoted;
        bool support; // true = yes, false = no
    }

    // 状态变量
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;

    // 事件
    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        address creator,
        uint256 endTime
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 yesVotes,
        uint256 noVotes
    );

    /**
     * @notice 创建新的投票提案
     * @param title 提案标题
     * @param description 提案描述
     * @param durationMinutes 投票持续时间（分钟）
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 durationMinutes
    ) public returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(durationMinutes > 0, "Duration must be positive");

        proposalCount++;
        uint256 proposalId = proposalCount;

        proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            yesVotes: 0,
            noVotes: 0,
            endTime: block.timestamp + (durationMinutes * 1 minutes),
            active: true,
            creator: msg.sender
        });

        emit ProposalCreated(proposalId, title, msg.sender, block.timestamp + durationMinutes * 1 minutes);

        return proposalId;
    }

    /**
     * @notice 对提案进行投票
     * @param proposalId 提案ID
     * @param support true=赞成, false=反对
     */
    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.active, "Proposal is not active");
        require(block.timestamp < proposal.endTime, "Voting has ended");
        require(!votes[proposalId][msg.sender].hasVoted, "Already voted");

        // 记录投票
        votes[proposalId][msg.sender] = Vote({hasVoted: true, support: support});

        // 更新计票
        if (support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

        emit Voted(proposalId, msg.sender, support, proposal.yesVotes, proposal.noVotes);
    }

    /**
     * @notice 结束提案（可选，时间到后自动失效）
     * @param proposalId 提案ID
     */
    function endProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.active, "Proposal already ended");
        require(msg.sender == proposal.creator, "Only creator can end proposal");

        proposal.active = false;
    }

    /**
     * @notice 获取提案详情
     * @param proposalId 提案ID
     */
    function getProposal(uint256 proposalId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 endTime,
        bool active,
        address creator
    ) {
        Proposal memory proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.endTime,
            proposal.active,
            proposal.creator
        );
    }

    /**
     * @notice 检查地址是否已投票
     * @param proposalId 提案ID
     * @param voter 投票者地址
     */
    function hasVoted(uint256 proposalId, address voter) public view returns (bool) {
        return votes[proposalId][voter].hasVoted;
    }

    /**
     * @notice 获取投票剩余时间
     * @param proposalId 提案ID
     */
    function getRemainingTime(uint256 proposalId) public view returns (uint256) {
        Proposal memory proposal = proposals[proposalId];
        if (block.timestamp >= proposal.endTime) {
            return 0;
        }
        return proposal.endTime - block.timestamp;
    }

    /**
     * @notice 获取所有活跃提案ID
     */
    function getActiveProposals() public view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](proposalCount);
        uint256 count = 0;

        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].active && block.timestamp < proposals[i].endTime) {
                activeIds[count] = i;
                count++;
            }
        }

        // 调整数组大小
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeIds[i];
        }

        return result;
    }
}
