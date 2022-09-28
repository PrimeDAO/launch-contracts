/*

██████╗░██████╗░██╗███╗░░░███╗███████╗██████╗░░█████╗░░█████╗░
██╔══██╗██╔══██╗██║████╗░████║██╔════╝██╔══██╗██╔══██╗██╔══██╗
██████╔╝██████╔╝██║██╔████╔██║█████╗░░██║░░██║███████║██║░░██║
██╔═══╝░██╔══██╗██║██║╚██╔╝██║██╔══╝░░██║░░██║██╔══██║██║░░██║
██║░░░░░██║░░██║██║██║░╚═╝░██║███████╗██████╔╝██║░░██║╚█████╔╝
╚═╝░░░░░╚═╝░░╚═╝╚═╝╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═╝░░╚═╝░╚════╝░

*/

// SPDX-License-Identifier: GPL-3.0
// PrimeDAO Seed Factory contract. Enable PrimeDAO governance to create new Seed contracts.
// Copyright (C) 2021 PrimeDao

// solium-disable linebreak-style
/* solhint-disable space-after-comma */

pragma solidity 0.8.9;

import "openzeppelin-contracts-sol8/token/ERC20/IERC20.sol";
import "openzeppelin-contracts-sol8/access/Ownable.sol";
import "./Seed.sol";
import "../utils/CloneFactory.sol";

/**
 * @title PrimeDAO Seed Factory
 * @dev   Enable PrimeDAO governance to create new Seed contracts.
 */
contract SeedFactory is CloneFactory, Ownable {
    Seed public masterCopy;

    event SeedCreated(address indexed newSeed, address indexed admin);

    /**
     * @dev               Set Seed contract which works as a base for clones.
     * @param _masterCopy The address of the new Seed basis.
     */
    function setMasterCopy(Seed _masterCopy) external onlyOwner {
        require(
            address(_masterCopy) != address(0),
            "SeedFactory: new mastercopy cannot be zero address"
        );
        masterCopy = _masterCopy;
    }

    /**
      * @dev                                Deploys Seed contract.
      * @param _beneficiary                 The address that recieves fees.
      * @param _admin                       The address of the admin of this contract. Funds contract
                                            and has permissions to whitelist users, pause and close contract.
      * @param _tokens                      Array containing two params:
                                                - The address of the seed token being distributed.
      *                                         - The address of the funding token being exchanged for seed token.
      * @param _softAndHardCap              Array containing two params:
                                                - The minimum funding token collection threshold in wei denomination.
                                                - The highest possible funding token amount to be raised in wei denomination.
      * @param _price                       price of a SeedToken, expressed in fundingTokens, with precision of 10**18
      * @param _startTimeAndEndTime         Array containing two params:
                                                - Distribution start time in unix timecode.
                                                - Distribution end time in unix timecode.
      * @param _defaultClassParameters     Array containing three params:
												- Individual buying cap for de default class, expressed in precision 10*18
												- Cliff duration, denominated in seconds. Vesting period duration, denominated in seconds
                                                - Vesting period duration, denominated in seconds.
      * @param _permissionedSeed            Set to true if only whitelisted adresses are allowed to participate.
      * @param _whitelist                   Array of addresses to be whitelisted for the default class, at creation time
      * @param _tipping                     Array of containing three parameters:
												- Total amount of tipping percentage, calculated from the total amount of Seed tokens added to the contract, expressed as a % (e.g. 10**18 = 100% fee, 10**16 = 1%)
												- Tipping vesting period duration denominated in seconds.																								
												- Tipping cliff duration denominated in seconds.	
      * @param _metadata                    Seed contract metadata, that is IPFS URI
    */
    function deploySeed(
        address _beneficiary,
        address _admin,
        address[] memory _tokens,
        uint256[] memory _softAndHardCap,
        uint256 _price,
        uint256[] memory _startTimeAndEndTime,
        uint256[] memory _defaultClassParameters,
        bool _permissionedSeed,
        address[] memory _whitelist,
        uint256[] memory _tipping,
        bytes memory _metadata
    ) external onlyOwner returns (address) {
        {
            require(
                address(masterCopy) != address(0),
                "SeedFactory: mastercopy cannot be zero address"
            );
            // ToDo: add requires to check for length
            // require(
            //     _vestingDurationAndCliff.length == 2,
            //     "SeedFactory: Hasn't provided both vesting duration and cliff"
            // );
        }

        // deploy clone
        address _newSeed = createClone(address(masterCopy));

        Seed(_newSeed).updateMetadata(_metadata);

        // initialize
        Seed(_newSeed).initialize(
            _beneficiary,
            _admin,
            _tokens,
            _softAndHardCap,
            _price,
            _startTimeAndEndTime,
            _defaultClassParameters,
            _permissionedSeed,
            _whitelist,
            _tipping
        );

        emit SeedCreated(address(_newSeed), _admin);

        return _newSeed;
    }
}
