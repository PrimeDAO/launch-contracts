/*

██████╗░██████╗░██╗███╗░░░███╗███████╗██████╗░░█████╗░░█████╗░
██╔══██╗██╔══██╗██║████╗░████║██╔════╝██╔══██╗██╔══██╗██╔══██╗
██████╔╝██████╔╝██║██╔████╔██║█████╗░░██║░░██║███████║██║░░██║
██╔═══╝░██╔══██╗██║██║╚██╔╝██║██╔══╝░░██║░░██║██╔══██║██║░░██║
██║░░░░░██║░░██║██║██║░╚═╝░██║███████╗██████╔╝██║░░██║╚█████╔╝
╚═╝░░░░░╚═╝░░╚═╝╚═╝╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═╝░░╚═╝░╚════╝░

*/

// SPDX-License-Identifier: GPL-3.0
// PrimeDAO Seed contract. Smart contract for seed phases of liquid launch.
// Copyright (C) 2021 PrimeDao

// solium-disable operator-whitespace
/* solhint-disable space-after-comma */
/* solhint-disable max-states-count */
// solium-disable linebreak-style
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PrimeDAO Seed contract
 * @dev   Smart contract for seed phases of liquid launch.
 */
contract Seed {
    using SafeERC20 for IERC20;
    // Locked parameters
    address public beneficiary;
    address public admin;
    uint256 public softCap;
    uint256 public hardCap;
    uint256 public seedAmountRequired; // Amount of seed required for distribution (buyable + tip)
    uint256 public totalBuyableSeed; // Amount of buyable seed tokens
    uint256 public startTime;
    uint256 public endTime; // set by project admin, this is the last resort endTime to be applied when
    //     maximumReached has not been reached by then
    uint256 public vestingStartTime; // timestamp for when vesting starts, by default == endTime,
    //     otherwise when maximumReached is reached
    bool public permissionedSeed;
    IERC20 public seedToken;
    IERC20 public fundingToken;
    bytes public metadata; // IPFS Hash

    uint256 internal constant PRECISION = 10**18; // used for precision e.g. 1 ETH = 10**18 wei; toWei("1") = 10**18

    // Contract logic
    bool public closed; // is the distribution closed
    bool public paused; // is the distribution paused
    bool public isFunded; // distribution can only start when required seed tokens have been funded
    bool public initialized; // is this contract initialized [not necessary that it is funded]
    bool public minimumReached; // if the softCap[minimum limit of funding token] is reached
    bool public maximumReached; // if the hardCap[maximum limit of funding token] is reached

    uint256 public totalFunderCount; // Total funders that have contributed.
    uint256 public seedRemainder; // Amount of seed tokens remaining to be distributed
    uint256 public seedClaimed; // Amount of seed token claimed by the user.
    uint256 public fundingCollected; // Amount of funding tokens collected by the seed contract.
    uint256 public fundingWithdrawn; // Amount of funding token withdrawn from the seed contract.

    uint256 public price;
    Tip public tip;

    ContributorClass[] public classes; // Array of contributor classes

    mapping(address => FunderPortfolio) public funders; // funder address to funder portfolio

    event SeedsPurchased(
        address indexed recipient,
        uint256 indexed amountPurchased,
        uint256 indexed seedRemainder
    );
    event TokensClaimed(address indexed recipient, uint256 indexed amount);
    event FundingReclaimed(
        address indexed recipient,
        uint256 indexed amountReclaimed
    );
    event MetadataUpdated(bytes indexed metadata);
    event TipClaimed(uint256 indexed amountClaimed);

    struct FunderPortfolio {
        uint8 class; // Contibutor class id
        uint256 totalClaimed; // Total amount of seed tokens claimed
        uint256 fundingAmount; // Total amount of funding tokens contributed
        bool allowlist; // If permissioned Seed, funder needs to be allowlisted
    }
    // ToDo: add comments
    struct ContributorClass {
        bytes32 className;
        uint256 classCap; // Amount of tokens that can be donated for class
        uint256 individualCap; // Amount of tokens that can be donated by specific contributor
        uint256 vestingCliff;
        uint256 vestingDuration; // Vesting duration for class
        uint256 classFundingCollected; // Total amount of staked tokens
    }

    // ToDo: add comment
    struct Tip {
        uint256 tipPercentage;
        uint256 vestingCliff;
        uint256 vestingDuration;
        uint256 tipAmount;
        uint256 totalClaimed;
    }

    modifier claimable() {
        require(
            endTime < block.timestamp || maximumReached || closed,
            "Seed: the distribution has not yet finished"
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Seed: caller should be admin");
        _;
    }

    modifier isActive() {
        require(!closed, "Seed: should not be closed");
        require(!paused, "Seed: should not be paused");
        _;
    }

    modifier isLive() {
        require(
            !closed && block.timestamp < vestingStartTime,
            "Seed: sale not live"
        );
        _;
    }

    modifier classRestriction(uint256 _classCap, uint256 _individualCap) {
        require(
            _individualCap <= _classCap && _classCap <= hardCap,
            "Seed: caps are invalid"
        );
        require(_classCap > 0, "Seed: class Cap should be bigger then 0");
        _;
    }

    modifier classBatchRestrictions(
        bytes32[] memory _classNames,
        uint256[] memory _classCaps,
        uint256[] memory _individualCaps,
        uint256[] memory _vestingCliffs,
        uint256[] memory _vestingDurations,
        address[][] memory _allowlist
    ) {
        uint256 arrayLength = _classNames.length;
        require(
            arrayLength == _classCaps.length &&
                arrayLength == _individualCaps.length &&
                arrayLength == _vestingCliffs.length &&
                arrayLength == _vestingDurations.length &&
                arrayLength == _allowlist.length,
            "Seed: All provided arrays should be same size"
        );
        require(
            arrayLength <= 100,
            "Seed: Can't add batch with more then 100 classes"
        );
        require(
            classes.length + arrayLength <= 256,
            "Seed: can't add more then 256 classes"
        );
        _;
    }

    function _addClass(
        bytes32 _className,
        uint256 _classCap,
        uint256 _individualCap,
        uint256 _vestingCliff,
        uint256 _vestingDuration
    ) internal classRestriction(_classCap, _individualCap) {
        classes.push(
            ContributorClass(
                _className,
                _classCap,
                _individualCap,
                _vestingCliff,
                _vestingDuration,
                0
            )
        );
    }

    /**
      * @dev                            Initialize Seed.
      * @param _beneficiary             The address that recieves fees.
      * @param _admin                   The address of the admin of this contract. Funds contract
                                            and has permissions to allowlist users, pause and close contract.
      * @param _tokens                  Array containing two params:
                                            - The address of the seed token being distributed.
      *                                     - The address of the funding token being exchanged for seed token.
      * @param _softAndHardCap          Array containing two params:
                                            - the minimum funding token collection threshold in wei denomination.
                                            - the highest possible funding token amount to be raised in wei denomination.
      * @param _price                   Price of a SeedToken, expressed in fundingTokens, with precision of 10**18
      * @param _startTimeAndEndTime     Array containing two params:
                                            - Distribution start time in unix timecode.
                                            - Distribution end time in unix timecode.
      * @param _defaultClassParameters  Array containing three params:
											- Individual buying cap for de default class, expressed in precision 10*18
											- Cliff duration, denominated in seconds.
                                            - Vesting period duration, denominated in seconds.
      * @param _permissionedSeed        Set to true if only allowlisted adresses are allowed to participate.
      * @param _allowlistAddresses      Array of addresses to be allowlisted for the default class, at creation time
      * @param _tip                     Array of containing three parameters:
											- Total amount of tip percentage expressed as a % (e.g. 45 / 100 * 10**18 = 45% fee, 10**16 = 1%)
											- Tip vesting period duration denominated in seconds.																								
											- Tipcliff duration denominated in seconds.	
    */
    function initialize(
        address _beneficiary,
        address _admin,
        address[] memory _tokens,
        uint256[] memory _softAndHardCap,
        uint256 _price,
        uint256[] memory _startTimeAndEndTime,
        uint256[] memory _defaultClassParameters,
        bool _permissionedSeed,
        address[] memory _allowlistAddresses,
        uint256[] memory _tip
    ) external {
        require(!initialized, "Seed: contract already initialized");
        initialized = true;

        beneficiary = _beneficiary;
        admin = _admin;
        softCap = _softAndHardCap[0];
        hardCap = _softAndHardCap[1];
        startTime = _startTimeAndEndTime[0];
        endTime = _startTimeAndEndTime[1];
        vestingStartTime = endTime + 1;
        permissionedSeed = _permissionedSeed;
        seedToken = IERC20(_tokens[0]);
        fundingToken = IERC20(_tokens[1]);
        price = _price;

        totalBuyableSeed = (hardCap * PRECISION) / _price;
        // Calculate tip
        uint256 tipAmount = (totalBuyableSeed * _tip[0]) / PRECISION;
        tip = Tip(_tip[0], _tip[1], _tip[2], tipAmount, 0);
        // Add default class
        _addClass(
            bytes32(""),
            hardCap,
            _defaultClassParameters[0],
            _defaultClassParameters[1],
            _defaultClassParameters[2]
        );

        // Add allowlist to the default class
        if (permissionedSeed == true && _allowlistAddresses.length > 0) {
            uint256 arrayLength = _allowlistAddresses.length;
            for (uint256 i; i < arrayLength; ++i) {
                _addToClass(0, _allowlistAddresses[i]); // Value 0 for the default class
            }
            _addAddressesToAllowlist(_allowlistAddresses);
        }

        seedRemainder = totalBuyableSeed;
        seedAmountRequired = tipAmount + seedRemainder;
    }

    /**
     * @dev                     Change parameters in the class.
     * @param _class            Class for changing.
     * @param _className        The name of the class
     * @param _classCap         The total cap of the contributor class, denominated in Wei.
     * @param _individualCap    The personal cap of each contributor in this class, denominated in Wei.
     * @param _vestingCliff     The cliff duration, denominated in seconds.
     * @param _vestingDuration  The vesting duration for this contributors class.
     */
    function changeClass(
        uint8 _class,
        bytes32 _className,
        uint256 _classCap,
        uint256 _individualCap,
        uint256 _vestingCliff,
        uint256 _vestingDuration
    ) external classRestriction(_classCap, _individualCap) onlyAdmin isLive {
        require(_class < classes.length, "Seed: incorrect class chosen");

        classes[_class].className = _className;
        classes[_class].classCap = _classCap;
        classes[_class].individualCap = _individualCap;
        classes[_class].vestingCliff = _vestingCliff;
        classes[_class].vestingDuration = _vestingDuration;
    }

    /**
     * @dev                     Buy seed tokens.
     * @param _fundingAmount    The amount of funding tokens to contribute.
     */
    function buy(uint256 _fundingAmount) external isActive returns (uint256) {
        FunderPortfolio storage funder = funders[msg.sender];
        require(
            !permissionedSeed || funder.allowlist,
            "Seed: sender has no rights"
        );

        ContributorClass memory userClass = classes[funder.class];
        require(!maximumReached, "Seed: maximum funding reached");
        require(_fundingAmount > 0, "Seed: cannot buy 0 tokens");
        // Checks if contributor has exceeded his personal or class cap.
        require(
            (userClass.classFundingCollected + _fundingAmount) <=
                userClass.classCap,
            "Seed: maximum class funding reached"
        );

        require(
            (funder.fundingAmount + _fundingAmount) <= userClass.individualCap,
            "Seed: maximum personal funding reached"
        );

        require(
            endTime >= block.timestamp && startTime <= block.timestamp,
            "Seed: only allowed during distribution period"
        );

        if (!isFunded) {
            require(
                seedToken.balanceOf(address(this)) >= seedAmountRequired,
                "Seed: sufficient seeds not provided"
            );
            isFunded = true;
        }

        if ((fundingCollected + _fundingAmount) > hardCap) {
            _fundingAmount = hardCap - fundingCollected;
        }

        uint256 seedAmount = (_fundingAmount * PRECISION) / price;
        // total fundingAmount should not be greater than the hardCap

        fundingCollected += _fundingAmount;
        classes[funder.class].classFundingCollected += _fundingAmount;
        // the amount of seed tokens still to be distributed
        seedRemainder = seedRemainder - seedAmount;
        if (fundingCollected >= softCap) {
            minimumReached = true;
        }

        if (fundingCollected >= hardCap) {
            maximumReached = true;
            vestingStartTime = block.timestamp;
        }

        //functionality of addFunder
        if (funder.fundingAmount == 0) {
            totalFunderCount++;
        }
        funder.fundingAmount += _fundingAmount;

        // Here we are sending amount of tokens to pay for seed tokens to purchase

        fundingToken.safeTransferFrom(
            msg.sender,
            address(this),
            _fundingAmount
        );

        emit SeedsPurchased(msg.sender, seedAmount, seedRemainder);

        return (seedAmount);
    }

    /**
     * @dev                     Claim vested seed tokens.
     * @param _claimAmount      The amount of seed token a users wants to claim.
     */
    function claim(uint256 _claimAmount) external claimable {
        require(minimumReached, "Seed: minimum funding amount not met");

        uint256 amountClaimable;

        amountClaimable = calculateClaimFunder(msg.sender);
        require(amountClaimable > 0, "Seed: amount claimable is 0");

        require(
            amountClaimable >= _claimAmount,
            "Seed: request is greater than claimable amount"
        );

        funders[msg.sender].totalClaimed += _claimAmount;

        seedClaimed += _claimAmount;

        seedToken.safeTransfer(msg.sender, _claimAmount);

        emit TokensClaimed(msg.sender, _claimAmount);
    }

    function claimTip() external claimable returns (uint256) {
        uint256 amountClaimable;

        amountClaimable = calculateClaimBeneficiary();
        require(amountClaimable > 0, "Seed: amount claimable is 0");

        tip.totalClaimed += amountClaimable;

        seedToken.safeTransfer(beneficiary, amountClaimable);

        emit TipClaimed(amountClaimable);

        return amountClaimable;
    }

    /**
     * @dev         Returns funding tokens to user.
     */
    function retrieveFundingTokens() external returns (uint256) {
        require(
            startTime <= block.timestamp,
            "Seed: distribution haven't started"
        );
        require(!minimumReached, "Seed: minimum funding amount met");
        FunderPortfolio storage tokenFunder = funders[msg.sender];
        uint256 fundingAmount = tokenFunder.fundingAmount;
        require(fundingAmount > 0, "Seed: zero funding amount");
        seedRemainder += seedAmountForFunder(msg.sender);
        totalFunderCount--;
        tokenFunder.fundingAmount = 0;
        fundingCollected -= fundingAmount;
        classes[tokenFunder.class].classFundingCollected -= fundingAmount;

        fundingToken.safeTransfer(msg.sender, fundingAmount);

        emit FundingReclaimed(msg.sender, fundingAmount);

        return fundingAmount;
    }

    // ADMIN ACTIONS

    /**
     * @dev                     Pause distribution.
     */
    function pause() external onlyAdmin isActive {
        paused = true;
    }

    /**
     * @dev                     Unpause distribution.
     */
    function unpause() external onlyAdmin {
        require(closed != true, "Seed: should not be closed");
        require(paused == true, "Seed: should be paused");

        paused = false;
    }

    /**
      * @dev                Shut down contributions (buying).
                            Supersedes the normal logic that eventually shuts down buying anyway.
                            Also shuts down the admin's ability to alter the allowlist.
    */
    function close() external onlyAdmin {
        // close seed token distribution
        require(!closed, "Seed: should not be closed");

        if (block.timestamp < vestingStartTime) {
            vestingStartTime = block.timestamp;
        }

        closed = true;
        paused = false;
    }

    /**
     * @dev                     retrieve remaining seed tokens back to project.
     * @param _refundReceiver   refund receiver address
     */
    function retrieveSeedTokens(address _refundReceiver) external onlyAdmin {
        // transfer seed tokens back to admin
        /*
            Can't withdraw seed tokens until buying has ended and
            therefore the number of distributable seed tokens can no longer change.
        */
        require(
            closed || maximumReached || block.timestamp >= endTime,
            "Seed: The ability to buy seed tokens must have ended before remaining seed tokens can be withdrawn"
        );
        uint256 seedTokenBalans = seedToken.balanceOf(address(this));
        if (!minimumReached) {
            require(
                seedTokenBalans > 0,
                "Seed: Failed to transfer Seed Token" // ToDo: better error message
            );
            // subtract tip from Seed tokens
            uint256 retrievableSeedAmount = seedTokenBalans -
                (tip.tipAmount - tip.totalClaimed);
            seedToken.safeTransfer(_refundReceiver, retrievableSeedAmount);
        } else {
            // seed tokens to transfer = buyable seed tokens - totalSeedDistributed
            uint256 totalSeedDistributed = totalBuyableSeed - seedRemainder;
            uint256 amountToTransfer = seedTokenBalans -
                (totalSeedDistributed - seedClaimed) -
                (tip.tipAmount - tip.totalClaimed);
            seedToken.safeTransfer(_refundReceiver, amountToTransfer);
        }
    }

    //ToDo: add comment
    function addClassesAndAllowlists(
        bytes32[] memory _classNames,
        uint256[] memory _classCaps,
        uint256[] memory _individualCaps,
        uint256[] memory _vestingCliffs,
        uint256[] memory _vestingDurations,
        address[][] memory _allowlist
    )
        external
        onlyAdmin
        isLive
        classBatchRestrictions(
            _classNames,
            _classCaps,
            _individualCaps,
            _vestingCliffs,
            _vestingDurations,
            _allowlist
        )
    {
        uint256 currentClassId = uint256(classes.length);
        for (uint8 i; i < _classNames.length; ++i) {
            _addClass(
                _classNames[i],
                _classCaps[i],
                _individualCaps[i],
                _vestingCliffs[i],
                _vestingDurations[i]
            );
        }
        uint256 arrayLength = _allowlist.length;
        if (permissionedSeed) {
            for (uint256 i; i < arrayLength; ++i) {
                _addAddressesToAllowlist(_allowlist[i]);
            }
        }
        for (uint256 i; i < arrayLength; ++i) {
            uint256 numberOfAddresses = _allowlist[i].length;
            for (uint256 j; j < numberOfAddresses; ++j) {
                _addToClass(uint8(currentClassId), _allowlist[i][j]);
            }
            ++currentClassId;
        }
    }

    /**
     * @dev                     Add multiple addresses to contributor classes, and if applicable
                                    allowlist them.
     * @param _buyers           Array of addresses to be allowlisted
     * @param _classes          Array of classes assigned in batch
     */
    function allowlist(address[] memory _buyers, uint8[] memory _classes)
        external
        onlyAdmin
        isLive
    {
        if (permissionedSeed) {
            _addAddressesToAllowlist(_buyers);
        }
        _addMultipleAdressesToClass(_buyers, _classes);
    }

    /**
     * @dev                       Set contributor class.
     * @param _classId              Class of the contributor.
     * @param _buyer            Address of the contributor.
     */
    function _addToClass(uint8 _classId, address _buyer) internal {
        require(_classId < classes.length, "Seed: incorrect class chosen");
        funders[_buyer].class = _classId;
    }

    /**
     * @dev                       Set contributor class.
     * @param _buyers          Address of the contributor.
     * @param _classes            Class of the contributor.
     */
    function _addMultipleAdressesToClass(
        address[] memory _buyers,
        uint8[] memory _classes
    ) internal {
        uint256 arrayLength = _buyers.length;
        require(
            _classes.length == arrayLength,
            "Seed: mismatch in array length"
        );

        for (uint256 i; i < arrayLength; ++i) {
            _addToClass(_classes[i], _buyers[i]);
        }
    }

    /**
     * @dev                     Add address to allowlist.
     * @param _buyers        Address which needs to be allowlisted
     */
    function _addAddressesToAllowlist(address[] memory _buyers) internal {
        uint256 arrayLength = _buyers.length;
        for (uint256 i; i < arrayLength; ++i) {
            funders[_buyers[i]].allowlist = true;
        }
    }

    /**
     * @dev                     Remove address from allowlist.
     * @param _buyer             Address which needs to be un-allowlisted
     */
    function unAllowlist(address _buyer) external onlyAdmin isLive {
        require(permissionedSeed == true, "Seed: seed is not permissioned");

        funders[_buyer].allowlist = false;
    }

    /**
     * @dev                     Withdraw funds from the contract
     */
    function withdraw() external onlyAdmin {
        /*
            Admin can't withdraw funding tokens until buying has ended and
            therefore contributors can no longer withdraw their funding tokens.
        */
        require(
            minimumReached,
            "Seed: cannot withdraw while funding tokens can still be withdrawn by contributors"
        );
        fundingWithdrawn = fundingCollected;
        // Send the entire seed contract balance of the funding token to the sale’s admin
        fundingToken.safeTransfer(
            msg.sender,
            fundingToken.balanceOf(address(this))
        );
    }

    /**
     * @dev                     Updates metadata.
     * @param _metadata         Seed contract metadata, that is IPFS Hash
     */
    function updateMetadata(bytes memory _metadata) external {
        require(
            initialized != true || msg.sender == admin,
            "Seed: contract should not be initialized or caller should be admin"
        );
        metadata = _metadata;
        emit MetadataUpdated(_metadata);
    }

    // GETTER FUNCTIONS
    /**
     * @dev                     Calculates the maximum claim
     * @param _funder           Address of funder to find the maximum claim
     */
    function calculateClaimFunder(address _funder)
        public
        view
        returns (uint256)
    {
        FunderPortfolio memory tokenFunder = funders[_funder];
        uint8 currentId = tokenFunder.class;
        ContributorClass memory claimed = classes[currentId];

        return
            _calculateClaim(
                seedAmountForFunder(_funder),
                claimed.vestingCliff,
                claimed.vestingDuration,
                tokenFunder.totalClaimed
            );
    }

    function calculateClaimBeneficiary() public view returns (uint256) {
        return
            _calculateClaim(
                tip.tipAmount,
                tip.vestingCliff,
                tip.vestingDuration,
                tip.totalClaimed
            );
    }

    function _calculateClaim(
        uint256 seedAmount,
        uint256 vestingCliff,
        uint256 vestingDuration,
        uint256 totalClaimed
    ) internal view returns (uint256) {
        if (block.timestamp < vestingStartTime) {
            return 0;
        }

        // Check cliff was reached
        uint256 elapsedSeconds = block.timestamp - vestingStartTime;
        if (elapsedSeconds < vestingCliff) {
            return 0;
        }

        // If over vesting duration, all tokens vested
        if (elapsedSeconds >= vestingDuration) {
            return seedAmount - totalClaimed;
        } else {
            uint256 amountVested = (elapsedSeconds * seedAmount) /
                vestingDuration;
            return amountVested - totalClaimed;
        }
    }

    function getAllClasses()
        external
        view
        returns (
            bytes32[] memory classNames,
            uint256[] memory classCaps,
            uint256[] memory individualCaps,
            uint256[] memory vestingCliffs,
            uint256[] memory vestingDurations,
            uint256[] memory classFundingsCollected
        )
    {
        uint256 numberOfClasses = classes.length;
        classNames = new bytes32[](numberOfClasses);
        classCaps = new uint256[](numberOfClasses);
        individualCaps = new uint256[](numberOfClasses);
        vestingCliffs = new uint256[](numberOfClasses);
        vestingDurations = new uint256[](numberOfClasses);
        classFundingsCollected = new uint256[](numberOfClasses);
        for (uint256 i; i < numberOfClasses; ++i) {
            ContributorClass storage class = classes[i];
            classNames[i] = class.className;
            classCaps[i] = class.classCap;
            individualCaps[i] = class.individualCap;
            vestingCliffs[i] = class.vestingCliff;
            vestingDurations[i] = class.vestingDuration;
            classFundingsCollected[i] = class.classFundingCollected;
        }
    }

    /**
     * @dev                     get seed amount for funder
     * @param _funder           address of funder to seed amount
     */
    function seedAmountForFunder(address _funder)
        public
        view
        returns (uint256)
    {
        return (funders[_funder].fundingAmount * PRECISION) / price;
    }
}
