// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract WETHToken is ERC20 {


    // ETH address of tss public key
    address public deposit_gateway;

    constructor(
    string memory name, 
    string memory ticker,
    address _deposit_gateway
    ) 
    ERC20(name, ticker) 
    {
        deposit_gateway = _deposit_gateway;
    }

    event Mint(address indexed to, uint256 value);


    function mint( address recipient, uint256 amount) public{
        require (msg.sender == deposit_gateway, "caller must be authorized gateway"); 
        _mint(recipient, amount);
        emit Mint(recipient, amount);

    }

    function change_gateway(address new_gateway) public {
        // uncomment in deployment 
        // require(msg.sender == chainhub_gateway,"only gateway can change it");
        require(new_gateway!= address(0),"invalid gateway address");
        deposit_gateway = new_gateway;
    }
}