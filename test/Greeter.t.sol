// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Greeter.sol";

contract GreeterTest is Test {
    Greeter greeter;
    address user1 = address(0xABCD);
    address user2 = address(0xBEEF);

    function setUp() public {
        greeter = new Greeter();
    }

    function testSendAndReadMessages() public {
        vm.prank(user1);
        greeter.sendMessage("Hello from user1");

        vm.prank(user2);
        greeter.sendMessage("Hi from user2");

        string[] memory msgs1 = greeter.getMessages(user1);
        assertEq(msgs1.length, 1);
        assertEq(msgs1[0], "Hello from user1");

        string[] memory msgs2 = greeter.getMessages(user2);
        assertEq(msgs2.length, 1);
        assertEq(msgs2[0], "Hi from user2");
    }

    function testUsersListAndCounts() public {
        vm.prank(user1);
        greeter.sendMessage("u1-msg1");
        vm.prank(user1);
        greeter.sendMessage("u1-msg2");

        vm.prank(user2);
        greeter.sendMessage("u2-msg1");

        address[] memory users = greeter.getAllUsers();
        // users may be in insertion order; just check length and membership
        assertEq(users.length, 2);

        uint256 c1 = greeter.getMessagesCount(user1);
        uint256 c2 = greeter.getMessagesCount(user2);
        assertEq(c1, 2);
        assertEq(c2, 1);
    }

    function testGreetReturnsLastMessage() public {
        vm.startPrank(user1);
        greeter.sendMessage("first");
        greeter.sendMessage("second");
        vm.stopPrank();

        vm.prank(user1);
        string memory last = greeter.greet();
        assertEq(last, "second");
    }
}
