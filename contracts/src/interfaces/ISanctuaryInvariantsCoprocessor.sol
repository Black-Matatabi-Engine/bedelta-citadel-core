// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

interface ICitadelInvariantsCoprocessor {
    function evaluatePacked(bytes calldata input) external view returns (bytes32 result);
}
