// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {console2} from "forge-std/console2.sol";

/// @notice Low-level revert returndata parser — Error(string), Panic(uint256), GMX v2 custom errors.
library GmxForkRevertDecoder {
    bytes4 internal constant ERROR_STRING = 0x08c379a0;
    bytes4 internal constant PANIC = 0x4e487b71;

    error InsufficientExecutionFee(uint256 minExecutionFee, uint256 executionFee);
    error InsufficientWntAmountForExecutionFee(uint256 wntAmount, uint256 executionFee);
    error InsufficientCollateralUsd(int256 remainingCollateralUsd);
    error MinPositionSize(uint256 positionSizeInUsd, uint256 minPositionSizeUsd);
    error EmptyOrder();
    error MarketNotFound(address key);
    error InvalidOrderPrices(uint256 primaryPriceMin, uint256 primaryPriceMax, uint256 triggerPrice, uint256 orderType);
    error OrderNotFulfillableAtAcceptablePrice(uint256 price, uint256 acceptablePrice);
    error DisabledMarket(address market);
    error InvalidPositionMarket(address market);
    error OrderTypeCannotBeCreated(uint256 orderType);
    error MaxPriceAgeExceeded(uint256 oracleTimestamp, uint256 currentTimestamp);
    error OraclePriceOutdated();

    function logReturndata(bytes memory returndata, string memory label) internal pure {
        console2.log(string.concat("[gmx-fork] ", label, " returndata.len"), returndata.length);
        if (returndata.length == 0) {
            console2.log(string.concat("[gmx-fork] ", label, " returndata EMPTY (silent 0x)"));
            return;
        }
        console2.log(string.concat("[gmx-fork] ", label, " returndata.hex"));
        console2.logBytes(returndata);
        console2.log(string.concat("[gmx-fork] ", label, " decoded"), decode(returndata));
    }

    function decode(bytes memory returndata) internal pure returns (string memory) {
        if (returndata.length < 4) return "silent";
        bytes4 sel;
        assembly {
            sel := mload(add(returndata, 32))
        }
        bytes memory args = _slice(returndata, 4);
        if (sel == ERROR_STRING && args.length > 0) {
            return string.concat("Error(", abi.decode(args, (string)), ")");
        }
        if (sel == PANIC && args.length >= 32) {
            return string.concat("Panic(0x", _uhex(abi.decode(args, (uint256))), ")");
        }
        return _decodeGmx(sel, args);
    }

    function _decodeGmx(bytes4 sel, bytes memory args) private pure returns (string memory) {
        if (sel == InsufficientExecutionFee.selector) {
            (uint256 a, uint256 b) = abi.decode(args, (uint256, uint256));
            return string.concat("InsufficientExecutionFee(", _uhex(a), ", ", _uhex(b), ")");
        }
        if (sel == InsufficientWntAmountForExecutionFee.selector) {
            (uint256 a, uint256 b) = abi.decode(args, (uint256, uint256));
            return string.concat("InsufficientWntAmountForExecutionFee(", _uhex(a), ", ", _uhex(b), ")");
        }
        if (sel == InsufficientCollateralUsd.selector) {
            return string.concat("InsufficientCollateralUsd(", _ihex(abi.decode(args, (int256))), ")");
        }
        if (sel == MinPositionSize.selector) {
            (uint256 a, uint256 b) = abi.decode(args, (uint256, uint256));
            return string.concat("MinPositionSize(", _uhex(a), ", ", _uhex(b), ")");
        }
        if (sel == EmptyOrder.selector) return "EmptyOrder()";
        if (sel == OraclePriceOutdated.selector) return "OraclePriceOutdated()";
        if (sel == MarketNotFound.selector) {
            return string.concat("MarketNotFound(", _addr(abi.decode(args, (address))), ")");
        }
        if (sel == DisabledMarket.selector) {
            return string.concat("DisabledMarket(", _addr(abi.decode(args, (address))), ")");
        }
        if (sel == InvalidPositionMarket.selector) {
            return string.concat("InvalidPositionMarket(", _addr(abi.decode(args, (address))), ")");
        }
        if (sel == OrderTypeCannotBeCreated.selector) {
            return string.concat("OrderTypeCannotBeCreated(", _uhex(abi.decode(args, (uint256))), ")");
        }
        if (sel == OrderNotFulfillableAtAcceptablePrice.selector) {
            (uint256 a, uint256 b) = abi.decode(args, (uint256, uint256));
            return string.concat("OrderNotFulfillableAtAcceptablePrice(", _uhex(a), ", ", _uhex(b), ")");
        }
        if (sel == InvalidOrderPrices.selector) {
            (uint256 a, uint256 b, uint256 c, uint256 d) = abi.decode(args, (uint256, uint256, uint256, uint256));
            return string.concat("InvalidOrderPrices(", _uhex(a), ", ", _uhex(b), ", ", _uhex(c), ", ", _uhex(d), ")");
        }
        if (sel == MaxPriceAgeExceeded.selector) {
            (uint256 a, uint256 b) = abi.decode(args, (uint256, uint256));
            return string.concat("MaxPriceAgeExceeded(", _uhex(a), ", ", _uhex(b), ")");
        }
        return string.concat("CustomError(0x", _b4hex(sel), ")");
    }

    function _slice(bytes memory data, uint256 skip) private pure returns (bytes memory) {
        if (data.length <= skip) return "";
        bytes memory out = new bytes(data.length - skip);
        for (uint256 i = 0; i < out.length; i++) out[i] = data[i + skip];
        return out;
    }

    function _b4hex(bytes4 value) private pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory out = new bytes(8);
        bytes memory raw = abi.encodePacked(value);
        for (uint256 i = 0; i < 4; i++) {
            out[i * 2] = alphabet[uint8(raw[i]) >> 4];
            out[i * 2 + 1] = alphabet[uint8(raw[i]) & 0x0f];
        }
        return string(out);
    }

    function _uhex(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        bytes memory alphabet = "0123456789abcdef";
        uint256 len;
        for (uint256 v = value; v > 0; v >>= 4) len++;
        bytes memory out = new bytes(len);
        for (uint256 i = len; i > 0; i--) {
            out[i - 1] = alphabet[value & 0xf];
            value >>= 4;
        }
        return string(out);
    }

    function _ihex(int256 value) private pure returns (string memory) {
        if (value < 0) return string.concat("-", _uhex(uint256(-value)));
        return _uhex(uint256(value));
    }

    function _addr(address value) private pure returns (string memory) {
        return _uhex(uint256(uint160(value)));
    }
}
