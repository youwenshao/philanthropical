// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ImpactEscrow
 * @dev Multi-sig controlled treasury with milestone-based fund release
 * @notice Implements emergency withdrawal with timelock and yield generation hooks
 */
contract ImpactEscrow is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Milestone status
    enum MilestoneStatus {
        Pending,
        Approved,
        Completed,
        Rejected
    }

    // Milestone structure
    struct Milestone {
        uint256 projectId;
        string description;
        uint256 amount;
        MilestoneStatus status;
        uint256 createdAt;
        uint256 completedAt;
        address approvedBy;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    // Project structure
    struct Project {
        address charity;
        address token; // ERC20 token address (USDC, etc.)
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 createdAt;
        bool active;
    }

    // Emergency withdrawal
    struct EmergencyWithdrawal {
        address to;
        uint256 amount;
        address token;
        uint256 unlockTime;
        bool executed;
        address requestedBy;
    }

    // State variables
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => uint256) public projectMilestoneCount;
    mapping(address => uint256[]) public charityProjects;
    mapping(uint256 => EmergencyWithdrawal) public emergencyWithdrawals;
    uint256 public projectCounter;
    uint256 public emergencyWithdrawalCounter;
    uint256 public timelockDuration; // in seconds
    uint256 public requiredApprovals; // Multi-sig requirement

    // Yield generation (hooks for Aave/Compound integration)
    address public yieldStrategy; // Address of yield generation contract
    mapping(address => uint256) public yieldBalances;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed charity,
        address token,
        uint256 totalAmount,
        uint256 timestamp
    );
    event MilestoneCreated(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        string description,
        uint256 amount,
        uint256 timestamp
    );
    event MilestoneApproved(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address indexed approver,
        uint256 approvalCount,
        uint256 timestamp
    );
    event FundsReleased(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address indexed charity,
        uint256 amount,
        address token,
        uint256 timestamp
    );
    event MilestoneRejected(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address indexed treasurer,
        string reason,
        uint256 timestamp
    );
    event EmergencyWithdrawalRequested(
        uint256 indexed withdrawalId,
        address indexed to,
        uint256 amount,
        address token,
        uint256 unlockTime,
        uint256 timestamp
    );
    event EmergencyWithdrawalExecuted(
        uint256 indexed withdrawalId,
        address indexed to,
        uint256 amount,
        address token,
        uint256 timestamp
    );
    event YieldGenerated(
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );
    event YieldStrategyUpdated(address oldStrategy, address newStrategy);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _timelockDuration Timelock duration in seconds
     * @param _requiredApprovals Number of approvals needed for releases
     */
    function initialize(
        uint256 _timelockDuration,
        uint256 _requiredApprovals
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(TREASURER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        timelockDuration = _timelockDuration;
        require(_requiredApprovals > 0, "ImpactEscrow: invalid approvals");
        requiredApprovals = _requiredApprovals;
    }

    /**
     * @dev Create a new project
     * @param charity Address of the charity
     * @param token ERC20 token address
     * @param totalAmount Total amount to be escrowed
     */
    function createProject(
        address charity,
        address token,
        uint256 totalAmount
    ) external onlyRole(ADMIN_ROLE) whenNotPaused nonReentrant returns (uint256 projectId) {
        require(charity != address(0), "ImpactEscrow: invalid charity");
        require(token != address(0), "ImpactEscrow: invalid token");
        require(totalAmount > 0, "ImpactEscrow: invalid amount");

        projectId = ++projectCounter;

        projects[projectId] = Project({
            charity: charity,
            token: token,
            totalAmount: totalAmount,
            releasedAmount: 0,
            createdAt: block.timestamp,
            active: true
        });

        charityProjects[charity].push(projectId);

        // Transfer tokens to escrow
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        emit ProjectCreated(projectId, charity, token, totalAmount, block.timestamp);
        return projectId;
    }

    /**
     * @dev Create a milestone for a project
     * @param projectId The project ID
     * @param description Milestone description
     * @param amount Amount to release upon completion
     */
    function createMilestone(
        uint256 projectId,
        string memory description,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) whenNotPaused returns (uint256 milestoneId) {
        Project storage project = projects[projectId];
        require(project.charity != address(0), "ImpactEscrow: project not found");
        require(project.active, "ImpactEscrow: project inactive");
        require(
            project.releasedAmount + amount <= project.totalAmount,
            "ImpactEscrow: amount exceeds total"
        );
        require(bytes(description).length > 0, "ImpactEscrow: empty description");

        milestoneId = projectMilestoneCount[projectId]++;
        Milestone storage milestone = milestones[projectId][milestoneId];

        milestone.projectId = projectId;
        milestone.description = description;
        milestone.amount = amount;
        milestone.status = MilestoneStatus.Pending;
        milestone.createdAt = block.timestamp;

        emit MilestoneCreated(projectId, milestoneId, description, amount, block.timestamp);
        return milestoneId;
    }

    /**
     * @dev Approve a milestone (multi-sig)
     * @param projectId The project ID
     * @param milestoneId The milestone ID
     */
    function approveMilestone(
        uint256 projectId,
        uint256 milestoneId
    ) external onlyRole(TREASURER_ROLE) whenNotPaused nonReentrant {
        Milestone storage milestone = milestones[projectId][milestoneId];
        require(
            milestone.status == MilestoneStatus.Pending,
            "ImpactEscrow: invalid status"
        );
        require(
            !milestone.approvals[msg.sender],
            "ImpactEscrow: already approved"
        );

        // Effects
        milestone.approvals[msg.sender] = true;
        milestone.approvalCount++;

        emit MilestoneApproved(
            projectId,
            milestoneId,
            msg.sender,
            milestone.approvalCount,
            block.timestamp
        );

        // Check if we have enough approvals
        if (milestone.approvalCount >= requiredApprovals) {
            milestone.status = MilestoneStatus.Approved;
            _releaseFunds(projectId, milestoneId);
        }
    }

    /**
     * @dev Reject a milestone
     * @param projectId The project ID
     * @param milestoneId The milestone ID
     * @param reason Reason for rejection
     */
    function rejectMilestone(
        uint256 projectId,
        uint256 milestoneId,
        string memory reason
    ) external onlyRole(TREASURER_ROLE) {
        Milestone storage milestone = milestones[projectId][milestoneId];
        require(
            milestone.status == MilestoneStatus.Pending,
            "ImpactEscrow: invalid status"
        );

        milestone.status = MilestoneStatus.Rejected;

        emit MilestoneRejected(projectId, milestoneId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Internal function to release funds
     */
    function _releaseFunds(
        uint256 projectId,
        uint256 milestoneId
    ) internal {
        Project storage project = projects[projectId];
        Milestone storage milestone = milestones[projectId][milestoneId];

        require(
            milestone.status == MilestoneStatus.Approved,
            "ImpactEscrow: not approved"
        );
        require(
            project.releasedAmount + milestone.amount <= project.totalAmount,
            "ImpactEscrow: insufficient funds"
        );

        // Effects
        milestone.status = MilestoneStatus.Completed;
        milestone.completedAt = block.timestamp;
        project.releasedAmount += milestone.amount;

        // Interactions
        IERC20(project.token).safeTransfer(project.charity, milestone.amount);

        emit FundsReleased(
            projectId,
            milestoneId,
            project.charity,
            milestone.amount,
            project.token,
            block.timestamp
        );
    }

    /**
     * @dev Request emergency withdrawal
     * @param to Recipient address
     * @param amount Amount to withdraw
     * @param token Token address
     */
    function requestEmergencyWithdrawal(
        address to,
        uint256 amount,
        address token
    ) external onlyRole(ADMIN_ROLE) whenNotPaused returns (uint256 withdrawalId) {
        require(to != address(0), "ImpactEscrow: invalid recipient");
        require(amount > 0, "ImpactEscrow: invalid amount");
        require(
            IERC20(token).balanceOf(address(this)) >= amount,
            "ImpactEscrow: insufficient balance"
        );

        withdrawalId = ++emergencyWithdrawalCounter;

        emergencyWithdrawals[withdrawalId] = EmergencyWithdrawal({
            to: to,
            amount: amount,
            token: token,
            unlockTime: block.timestamp + timelockDuration,
            executed: false,
            requestedBy: msg.sender
        });

        emit EmergencyWithdrawalRequested(
            withdrawalId,
            to,
            amount,
            token,
            emergencyWithdrawals[withdrawalId].unlockTime,
            block.timestamp
        );

        return withdrawalId;
    }

    /**
     * @dev Execute emergency withdrawal after timelock
     * @param withdrawalId The withdrawal ID
     */
    function executeEmergencyWithdrawal(
        uint256 withdrawalId
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        EmergencyWithdrawal storage withdrawal = emergencyWithdrawals[withdrawalId];
        require(!withdrawal.executed, "ImpactEscrow: already executed");
        require(
            block.timestamp >= withdrawal.unlockTime,
            "ImpactEscrow: timelock not expired"
        );

        withdrawal.executed = true;

        IERC20(withdrawal.token).safeTransfer(withdrawal.to, withdrawal.amount);

        emit EmergencyWithdrawalExecuted(
            withdrawalId,
            withdrawal.to,
            withdrawal.amount,
            withdrawal.token,
            block.timestamp
        );
    }

    /**
     * @dev Set yield generation strategy
     * @param _yieldStrategy Address of yield strategy contract
     */
    function setYieldStrategy(
        address _yieldStrategy
    ) external onlyRole(ADMIN_ROLE) {
        address oldStrategy = yieldStrategy;
        yieldStrategy = _yieldStrategy;
        emit YieldStrategyUpdated(oldStrategy, _yieldStrategy);
    }

    /**
     * @dev Generate yield (called by yield strategy contract)
     * @param token Token address
     * @param amount Yield amount
     */
    function recordYield(
        address token,
        uint256 amount
    ) external {
        require(msg.sender == yieldStrategy, "ImpactEscrow: unauthorized");
        yieldBalances[token] += amount;
        emit YieldGenerated(token, amount, block.timestamp);
    }

    /**
     * @dev Get project information
     */
    function getProject(
        uint256 projectId
    ) external view returns (Project memory) {
        return projects[projectId];
    }

    /**
     * @dev Get milestone information
     */
    function getMilestone(
        uint256 projectId,
        uint256 milestoneId
    ) external view returns (
        uint256 projectId_,
        string memory description,
        uint256 amount,
        MilestoneStatus status,
        uint256 createdAt,
        uint256 completedAt,
        address approvedBy,
        uint256 approvalCount
    ) {
        Milestone storage m = milestones[projectId][milestoneId];
        return (
            m.projectId,
            m.description,
            m.amount,
            m.status,
            m.createdAt,
            m.completedAt,
            m.approvedBy,
            m.approvalCount
        );
    }

    /**
     * @dev Check if milestone is approved by a specific address
     */
    function isMilestoneApprovedBy(
        uint256 projectId,
        uint256 milestoneId,
        address approver
    ) external view returns (bool) {
        return milestones[projectId][milestoneId].approvals[approver];
    }

    // Pausable functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // UUPS Upgradeable
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    // AccessControl
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlUpgradeable) returns (bool) {
        return AccessControlUpgradeable.supportsInterface(interfaceId);
    }
}

