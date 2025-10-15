// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {Greeter} from "../src/Greeter.sol";

contract DeployGreeter is Script {
    function run() external {
    vm.startBroadcast();
    new Greeter();
    vm.stopBroadcast();
    }
}
