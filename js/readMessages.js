#!/usr/bin/env node
import { getContract } from './utils.js';
import process from 'process';

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node readMessages.js <contractAddress> <userAddress>');
        process.exit(1);
    }
    const [address, user] = args;
    const contract = getContract(address);
    const messages = await contract.getMessages(user);
    console.log('Messages for', user, ':');
    messages.forEach((m, i) => {
        console.log(i, m);
    });
}

main().catch(err => { console.error(err); process.exitCode = 1; });
