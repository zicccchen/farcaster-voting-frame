// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

/**
 * @title VotingMulti
 * @notice 多选项链上投票合约
 * @dev 支持创建有多个选项的投票提案
 */
contract VotingMulti {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        string[] options;           // 投票选项
        uint256[] voteCounts;       // 每个选项的票数
        uint256 endTime;
        bool active;
        address creator;
        uint256 totalVotes;
    }

    // 状态变量
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // 事件
    event ProposalCreated(
        uint256 indexed id,
        string title,
        address creator,
        uint256 endTime
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 optionIndex
    );

    /**
     * @notice 创建新的多选项投票提案
     * @param _title 提案标题
     * @param _description 提案描述
     * @param _options 投票选项数组
     * @param _durationInHours 投票持续时间（小时）
     */
    function createProposal(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _durationInHours
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_options.length >= 2, "At least 2 options required");
        require(_durationInHours > 0, "Duration must be positive");
        require(_durationInHours <= 720, "Duration too long"); // 最长 30 天

        proposalCount++;
        uint256 proposalId = proposalCount;

        // 初始化票数数组
        uint256[] memory initialCounts = new uint256[](_options.length);
        for (uint256 i = 0; i < _options.length; i++) {
            initialCounts[i] = 0;
        }

        proposals[proposalId] = Proposal({
            id: proposalId,
            title: _title,
            description: _description,
            options: _options,
            voteCounts: initialCounts,
            endTime: block.timestamp + (_durationInHours * 1 hours),
            active: true,
            creator: msg.sender,
            totalVotes: 0
        });

        emit ProposalCreated(proposalId, _title, msg.sender, block.timestamp + _durationInHours * 1 hours);

        return proposalId;
    }

    /**
     * @notice 对提案进行投票
     * @param _proposalId 提案ID
     * @param _optionIndex 选项索引
     */
    function vote(uint256 _proposalId, uint256 _optionIndex) public {
        Proposal storage proposal = proposals[_proposalId];

        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.active, "Proposal is not active");
        require(block.timestamp < proposal.endTime, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(_optionIndex < proposal.options.length, "Invalid option");

        // 记录投票
        hasVoted[_proposalId][msg.sender] = true;

        // 更新计票
        proposal.voteCounts[_optionIndex]++;
        proposal.totalVotes++;

        emit Voted(_proposalId, msg.sender, _optionIndex);
    }

    /**
     * @notice 获取提案详情
     * @param _proposalId 提案ID
     */
    function getProposal(uint256 _proposalId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        string[] memory options,
        uint256[] memory voteCounts,
        uint256 endTime,
        address creator,
        bool active,
        uint256 totalVotes
    ) {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.options,
            proposal.voteCounts,
            proposal.endTime,
            proposal.creator,
            proposal.active,
            proposal.totalVotes
        );
    }

    /**
     * @notice 获取所有活跃提案ID
     */
    function getActiveProposals() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].active && block.timestamp < proposals[i].endTime) {
                activeCount++;
            }
        }

        uint256[] memory activeIds = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].active && block.timestamp < proposals[i].endTime) {
                activeIds[index] = i;
                index++;
            }
        }

        return activeIds;
    }

    /**
     * @notice 获取所有提案ID
     */
    function getAllProposals() public view returns (uint256[] memory) {
        uint256[] memory allIds = new uint256[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) {
            allIds[i] = i + 1;
        }
        return allIds;
    }

    /**
     * @notice 检查地址是否已投票
     * @param _proposalId 提案ID
     * @param _voter 投票者地址
     */
    function hasVotedFor(uint256 _proposalId, address _voter) public view returns (bool) {
        return hasVoted[_proposalId][_voter];
    }
}
