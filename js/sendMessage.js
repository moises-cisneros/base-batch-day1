#!/usr/bin/env node
import { getContractWithSigner } from './utils.js';
import process from 'process';

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node sendMessage.js <contractAddress> <message>');
        process.exit(1);
    }
    const [address, ...msgParts] = args;
    const message = msgParts.join(' ');
    const contract = getContractWithSigner(address);

    console.log('Sending message:', message, 'to', address);
    const tx = await contract.sendMessage(message, { gasLimit: 500_000 });
    console.log('Tx sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Tx mined in block', receipt.blockNumber);
    // If events present, show them
    if (receipt.logs && receipt.logs.length) {
        console.log('Logs count:', receipt.logs.length);
    }
    console.log(JSON.stringify(receipt, null, 2));
}

main().catch(err => { console.error(err); process.exitCode = 1; });
