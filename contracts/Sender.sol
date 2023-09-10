// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.9;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { AxelarExecutable } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import { IAxelarGateway } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import { IAxelarGasService } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';

contract Sender is AxelarExecutable, ReentrancyGuard {
    uint256 public immutable denomination;
    IAxelarGasService gasService;

    mapping(bytes32 => bool) public nullifierHashes;

    event Deposit(
        bytes32 indexed commitment,
        uint32 leafIndex,
        uint256 timestamp
    );
   
    /**
    @param gateway_ the address of Axelar GateWay Contract
    @param gasReceiver_ the address of Axelar GasService Contract
    */
     constructor(address gateway_, address gasReceiver_, uint256 _denomination ) AxelarExecutable(gateway_) {
        gasService = IAxelarGasService(gasReceiver_);
        denomination = _denomination;
    }

    /**
    @dev Deposit funds into the contract. The caller must send (for ETH) or approve (for ERC20) value equal to or `denomination` of this instance.
    @param _commitment the note commitment, which is PedersenHash(nullifier + secret)
  */
    function deposit(bytes32 _commitment, string calldata destinationChain,
        string calldata destinationAddress) external payable nonReentrant {
        _processDeposit();
        // call gateway contract to send commitment
        // uint32 insertedIndex = _insert(_commitment);
       require(msg.value > 0, 'Gas payment is required');

        bytes memory payload = abi.encode(_commitment);
        gasService.payNativeGasForContractCall{ value: msg.value }(
            address(this),
            destinationChain,
            destinationAddress,
            payload,
            msg.sender
        );
        gateway.callContract(destinationChain, destinationAddress, payload);
    }

    function _processDeposit() internal {
        require(
            msg.value == denomination,
            "Please send `mixDenomination` ETH along with transaction"
        );
    }

}
