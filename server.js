const express = require("express");
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Contract ABI
const VOTING_ABI = [
    "function createProposal(string memory _title, string memory _description, string[] memory _options, uint256 _durationInHours) public returns (uint256)",
    "function vote(uint256 _proposalId, uint256 _optionIndex) public",
    "function getProposal(uint256 _proposalId) public view returns (uint256 id, string memory title, string memory description, string[] memory options, uint256[] memory voteCounts, uint256 endTime, address creator, bool active, uint256 totalVotes)",
    "function getActiveProposals() public view returns (uint256[] memory)",
    "function getAllProposals() public view returns (uint256[] memory)",
    "function hasVoted(uint256, address) public view returns (bool)",
    "function proposalCount() public view returns (uint256)",
    "event ProposalCreated(uint256 indexed id, string title, address creator, uint256 endTime)",
    "event Voted(uint256 indexed proposalId, address indexed voter, uint256 optionIndex)"
];

// Provider setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://mainnet.base.org");

function getContract() {
    if (!process.env.VOTING_CONTRACT_ADDRESS) {
        throw new Error("VOTING_CONTRACT_ADDRESS not set");
    }
    return new ethers.Contract(process.env.VOTING_CONTRACT_ADDRESS, VOTING_ABI, provider);
}

app.use(express.json());
app.use(express.static("public"));

// Serve farcaster.json
app.get("/.well-known/farcaster.json", (req, res) => {
    res.sendFile(path.join(__dirname, "public", ".well-known", "farcaster.json"));
});

// Image routes
app.get("/icon.png", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "icon.png"));
});

app.get("/hero.png", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "hero.png"));
});

app.get("/splash.png", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "splash.png"));
});

app.get("/screenshot.png", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "screenshot.png"));
});

// Main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API: Get contract info
app.get("/api/contract", (req, res) => {
    res.json({
        address: process.env.VOTING_CONTRACT_ADDRESS || "",
        chainId: 8453,
        abi: VOTING_ABI
    });
});

// API: Get all proposals
app.get("/api/proposals", async (req, res) => {
    try {
        const contract = getContract();
        const count = await contract.proposalCount();
        const proposals = [];

        for (let i = 1; i <= Number(count); i++) {
            try {
                const p = await contract.getProposal(i);
                proposals.push({
                    id: Number(p.id),
                    title: p.title,
                    description: p.description,
                    options: p.options,
                    voteCounts: p.voteCounts.map(v => Number(v)),
                    endTime: Number(p.endTime),
                    creator: p.creator,
                    active: p.active,
                    totalVotes: Number(p.totalVotes)
                });
            } catch (e) {
                console.error(`Error fetching proposal ${i}:`, e.message);
            }
        }

        res.json(proposals);
    } catch (error) {
        console.error("Error:", error.message);
        res.json([]);
    }
});

// API: Get single proposal
app.get("/api/proposals/:id", async (req, res) => {
    try {
        const contract = getContract();
        const p = await contract.getProposal(req.params.id);
        res.json({
            id: Number(p.id),
            title: p.title,
            description: p.description,
            options: p.options,
            voteCounts: p.voteCounts.map(v => Number(v)),
            endTime: Number(p.endTime),
            creator: p.creator,
            active: p.active,
            totalVotes: Number(p.totalVotes)
        });
    } catch (error) {
        res.status(404).json({ error: "Proposal not found" });
    }
});

// API: Check if user has voted
app.get("/api/hasVoted/:proposalId/:address", async (req, res) => {
    try {
        const contract = getContract();
        const voted = await contract.hasVoted(req.params.proposalId, req.params.address);
        res.json({ hasVoted: voted });
    } catch (error) {
        res.json({ hasVoted: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});