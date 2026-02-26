// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingOptimized
 * @notice 优化版链上投票合约 - 降低 Gas 费用
 * @dev 通过优化存储布局和移除不必要功能降低部署成本
 */
contract VotingOptimized {
    // 优化后的结构体 - 紧凑打包
    struct Proposal {
        address creator;      // 20 bytes
        uint64 endTime;       // 8 bytes
        uint256 yesVotes;     // 32 bytes
        uint256 noVotes;      // 32 bytes
        bool active;          // 1 byte
        // 总计: 93 bytes + padding
    }

    // 状态变量 - 优化存储
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted; // 简化为布尔值

    // 字符串数据存储在单独的 mapping 中以优化打包
    mapping(uint256 => string) public titles;
    mapping(uint256 => string) public descriptions;

    // 事件
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 yesVotes, uint256 noVotes);

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
        require(durationMinutes <= 43200, "Duration too long"); // 最长 30 天

        proposalCount++;
        uint256 proposalId = proposalCount;

        // 存储标题和描述到单独的 mapping
        titles[proposalId] = title;
        descriptions[proposalId] = description;

        // 存储提案数据（紧凑打包）
        proposals[proposalId] = Proposal({
            creator: msg.sender,
            endTime: uint64(block.timestamp + (durationMinutes * 1 minutes)),
            yesVotes: 0,
            noVotes: 0,
            active: true
        });

        emit ProposalCreated(proposalId, msg.sender, block.timestamp + durationMinutes * 1 minutes);

        return proposalId;
    }

    /**
     * @notice 对提案进行投票
     * @param proposalId 提案ID
     * @param support true=赞成, false=反对
     */
    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.active, "Proposal not active");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        // 记录投票
        hasVoted[proposalId][msg.sender] = true;

        // 更新计票
        if (support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

        emit Voted(proposalId, msg.sender, support, proposal.yesVotes, proposal.noVotes);
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
            proposalId,
            titles[proposalId],
            descriptions[proposalId],
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
    function hasVotedFor(uint256 proposalId, address voter) public view returns (bool) {
        return hasVoted[proposalId][voter];
    }

    /**
     * @notice 获取投票剩余时间
     * @param proposalId 提案ID
     */
    function getRemainingTime(uint256 proposalId) public view returns (uint256) {
        Proposal memory proposal = proposals[proposalId];
        if (block.timestamp >= proposal.endTime || !proposal.active) {
            return 0;
        }
        return proposal.endTime - block.timestamp;
    }
}
