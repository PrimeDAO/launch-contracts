/*

██████╗░██████╗░██╗███╗░░░███╗███████╗██████╗░░█████╗░░█████╗░
██╔══██╗██╔══██╗██║████╗░████║██╔════╝██╔══██╗██╔══██╗██╔══██╗
██████╔╝██████╔╝██║██╔████╔██║█████╗░░██║░░██║███████║██║░░██║
██╔═══╝░██╔══██╗██║██║╚██╔╝██║██╔══╝░░██║░░██║██╔══██║██║░░██║
██║░░░░░██║░░██║██║██║░╚═╝░██║███████╗██████╔╝██║░░██║╚█████╔╝
╚═╝░░░░░╚═╝░░╚═╝╚═╝╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═╝░░╚═╝░╚════╝░

*/

// SPDX-License-Identifier: GPL-3.0
// PrimeDAO Seed Factory version 2 contract. Enable PrimeDAO governance to create new Seed contracts.
// Copyright (C) 2022 PrimeDao

// solium-disable linebreak-style
/* solhint-disable space-after-comma */

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SeedV2.sol";
import "../utils/CloneFactory.sol";

/**
 * @title PrimeDAO Seed Factory V2
 * @dev   SeedFactory version 2 deployed without the onlyOwner modifer for the function deploySeed(). By 
          removing the access control, everyone can deploy a seed from this contract. This is
 *        a temporarly solution in response to the flaky Celo Safe.
 */
contract SeedFactoryV2NoAccessControl is CloneFactory, Ownable {
    bytes6 public version = "2.1.0";
    SeedV2 public masterCopy; // Seed implementation address, which is used in the cloning pattern
    uint256 internal constant MAX_TIP = (45 / 100) * 10**18; // Max tip expressed as a % (e.g. 45 / 100 * 10**18 = 45% fee)

    // ----------------------------------------
    //      EVENTS
    // ----------------------------------------

    event SeedCreated(
        address indexed newSeed,
        address indexed admin,
        address indexed treasury
    );

    constructor(SeedV2 _masterCopy) {
        require(address(_masterCopy) != address(0), "SeedFactory: Error 100");
        masterCopy = _masterCopy;
    }

    // ----------------------------------------
    //      ONLY OWNER FUNCTIONS
    // ----------------------------------------

    /**
     * @dev               Set Seed contract which works as a base for clones.
     * @param _masterCopy The address of the new Seed basis.
     */
    function setMasterCopy(SeedV2 _masterCopy) external onlyOwner {
        require(
            address(_masterCopy) != address(0) &&
                address(_masterCopy) != address(this),
            "SeedFactory: Error 100"
        );

        masterCopy = _masterCopy;
    }

    /**
      * @dev                                Deploys Seed contract.
      * @param _beneficiary                 The address that recieves fees.
      * @param _projectAddresses            Array containing two params:
                                                - The address of the admin of this contract. Funds contract
                                                    and has permissions to allowlist users, pause and close contract.
                                                - The treasury address which is the receiver of the funding tokens
                                                        raised, as well as the reciever of the retrievable seed tokens.
      * @param _tokens                      Array containing two params:
                                                - The address of the seed token being distributed.
      *                                         - The address of the funding token being exchanged for seed token.
      * @param _softAndHardCap              Array containing two params:
                                                - the minimum funding token collection threshold in wei denomination.
                                                - the highest possible funding token amount to be raised in wei denomination.
      * @param _price                       price of a SeedToken, expressed in fundingTokens, with precision of 10**18
      * @param _startTimeAndEndTime         Array containing two params:
                                                - Distribution start time in unix timecode.
                                                - Distribution end time in unix timecode.
      * @param _defaultClassParameters     Array containing three params:
												- Individual buying cap for de default class, expressed in precision 10*18
												- Cliff duration, denominated in seconds.
                                                - Vesting period duration, denominated in seconds.
      * @param _permissionedSeed            Set to true if only allowlisted adresses are allowed to participate.
      * @param _allowlistAddresses          Array of addresses to be allowlisted for the default class, at creation time
      * @param _tip                     Array of containing three parameters:
												- Total amount of tip percentage, calculated from the total amount of Seed tokens added to the contract, expressed as a % (e.g. 10**18 = 100% fee, 10**16 = 1%)
												- Tip cliff duration denominated in seconds.	
												- Tip vesting period duration denominated in seconds.																								
      * @param _metadata                    Seed contract metadata, that is IPFS URI
    */
    function deploySeed(
        address _beneficiary,
        address[] memory _projectAddresses,
        address[] memory _tokens,
        uint256[] memory _softAndHardCap,
        uint256 _price,
        uint256[] memory _startTimeAndEndTime,
        uint256[] memory _defaultClassParameters,
        bool _permissionedSeed,
        address[] memory _allowlistAddresses,
        uint256[] memory _tip,
        bytes memory _metadata
    ) external returns (address) {
        {
            require(
                _tip.length == 3 &&
                    _tokens.length == 2 &&
                    _softAndHardCap.length == 2 &&
                    _startTimeAndEndTime.length == 2 &&
                    _defaultClassParameters.length == 3 &&
                    _projectAddresses.length == 2,
                "SeedFactory: Error 102"
            );
            require(
                _beneficiary != address(0) &&
                    _projectAddresses[0] != address(0) &&
                    _projectAddresses[1] != address(0) &&
                    _tokens[0] != address(0) &&
                    _tokens[1] != address(0),
                "SeedFactory: Error 100"
            );
            require(
                _tokens[0] != _tokens[1] &&
                    _beneficiary != _projectAddresses[0] &&
                    _beneficiary != _projectAddresses[1],
                "SeedFactory: Error 104"
            );
            require(
                _softAndHardCap[1] >= _softAndHardCap[0],
                "SeedFactory: Error 300"
            );
            require(
                _startTimeAndEndTime[1] > _startTimeAndEndTime[0] &&
                    block.timestamp < _startTimeAndEndTime[0],
                "SeedFactory: Error 106"
            );
            require(_tip[0] <= MAX_TIP, "SeedFactory: Error 301");
        }

        // deploy clone
        address _newSeed = createClone(address(masterCopy));

        SeedV2(_newSeed).updateMetadata(_metadata);

        // initialize
        SeedV2(_newSeed).initialize(
            _beneficiary,
            _projectAddresses,
            _tokens,
            _softAndHardCap,
            _price,
            _startTimeAndEndTime,
            _defaultClassParameters,
            _permissionedSeed,
            _allowlistAddresses,
            _tip
        );

        emit SeedCreated(
            address(_newSeed),
            _projectAddresses[0],
            _projectAddresses[1]
        );

        return _newSeed;
    }
}
