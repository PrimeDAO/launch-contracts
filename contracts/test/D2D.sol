// SPDX-License-Identifier: GPL-3.0-or-later
// solium-disable linebreak-style
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract D2D is ERC20Capped {
    uint256 public constant supply = 100000000000000000000000000;

    constructor() ERC20("Prime", "D2D") ERC20Capped(supply) {
        ERC20._mint(msg.sender, supply);
    }
}
