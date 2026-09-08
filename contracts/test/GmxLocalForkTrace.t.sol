// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {Vm} from "forge-std/Vm.sol";
import {GmxForkRevertDecoder} from "./GmxForkRevertDecoder.sol";

/// @notice Arbitrum One fork probe — replay TS-generated GMX ExchangeRouter.multicall and decode reverts.
contract GmxLocalForkTraceTest is Test {
    using stdJson for string;
    using GmxForkRevertDecoder for bytes;

    address internal constant ROUTER = 0x7dE39FF2e232A2203196788d37e234cF8F1b83f1;
    address internal constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;

    IERC20 internal usdc;

    function setUp() public {
        string memory rpc = vm.envOr("ARB_MAINNET_RPC_URL", string("https://arb1.arbitrum.io/rpc"));
        vm.createSelectFork(rpc);
        usdc = IERC20(USDC);
    }

    function test_forkTraceMicroFillMulticall() public {
        (address eoa, bytes memory data, uint256 value, bytes[] memory legs) = _loadFixture();
        _logBalances(eoa, value);
        if (eoa.balance < value) vm.deal(eoa, value + 1 ether);

        vm.startPrank(eoa);
        uint256 snap = vm.snapshotState();
        _probeLegs(legs, value);
        vm.revertToState(snap);
        _probeCreateOrderAfterFunding(legs, value);
        vm.revertToState(snap);

        vm.recordLogs();
        (bool ok, bytes memory returndata) = ROUTER.call{value: value}(data);
        vm.stopPrank();

        if (ok) {
            console2.log("[gmx-fork] multicall SUCCESS");
            _printLogs();
            return;
        }
        console2.log("[gmx-fork] multicall REVERT");
        returndata.logReturndata("multicall");
        _printLogs();
        assertFalse(ok, "multicall reverted unexpectedly");
    }

    function _lowLevelRouterCall(uint256 value, bytes memory data, string memory label)
        internal
        returns (bool ok, bytes memory returndata)
    {
        (ok, returndata) = ROUTER.call{value: value}(data);
        console2.log("[gmx-fork]", label, ok ? "OK" : "REVERT");
        if (!ok) returndata.logReturndata(label);
        return (ok, returndata);
    }

    function _lowLevelCreateOrder(bytes memory createOrderCalldata, string memory label)
        internal
        returns (bool ok, bytes memory returndata)
    {
        (ok, returndata) = ROUTER.call{value: 0}(createOrderCalldata);
        console2.log("[gmx-fork]", label, ok ? "OK" : "REVERT");
        if (!ok) returndata.logReturndata(label);
        return (ok, returndata);
    }

    function _probeCreateOrderAfterFunding(bytes[] memory legs, uint256 fee) internal {
        bytes[] memory fund = new bytes[](2);
        fund[0] = legs[0];
        fund[1] = legs[1];
        _lowLevelRouterCall(fee, abi.encodeWithSignature("multicall(bytes[])", fund), "fundMulticall");
        _lowLevelCreateOrder(legs[2], "createOrder after funding");
    }

    function _loadFixture()
        internal
        view
        returns (address eoa, bytes memory data, uint256 value, bytes[] memory legs)
    {
        string memory path = string.concat(vm.projectRoot(), "/contracts/test/fixtures/gmx-micro-fill-multicall.json");
        string memory json = vm.readFile(path);
        eoa = json.readAddress(".eoa");
        data = json.readBytes(".multicallData");
        value = json.readUint(".msgValue");
        string[] memory hexLegs = json.readStringArray(".calls");
        legs = new bytes[](hexLegs.length);
        for (uint256 i = 0; i < hexLegs.length; i++) {
            legs[i] = vm.parseBytes(hexLegs[i]);
        }
    }

    function _logBalances(address eoa, uint256 value) internal view {
        console2.log("[gmx-fork] EOA", eoa);
        console2.log("[gmx-fork] ETH", eoa.balance);
        console2.log("[gmx-fork] USDC", usdc.balanceOf(eoa));
        console2.log("[gmx-fork] allowance(router)", usdc.allowance(eoa, ROUTER));
        console2.log("[gmx-fork] msg.value", value);
    }

    function _probeLegs(bytes[] memory legs, uint256 fee) internal {
        string[3] memory names = ["sendWnt", "sendTokens", "createOrder"];
        for (uint256 i = 0; i < legs.length; i++) {
            if (i == 2) {
                _lowLevelCreateOrder(legs[i], string.concat("leg ", names[i]));
                continue;
            }
            _lowLevelRouterCall(i == 0 ? fee : 0, legs[i], string.concat("leg ", names[i]));
        }
    }

    function _printLogs() internal {
        Vm.Log[] memory entries = vm.getRecordedLogs();
        console2.log("[gmx-fork] recorded logs", entries.length);
        for (uint256 i = 0; i < entries.length; i++) {
            console2.log("[gmx-fork] log.emitter", entries[i].emitter);
            console2.logBytes(entries[i].data);
        }
    }
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}
