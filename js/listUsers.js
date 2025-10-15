#!/usr/bin/env node
import { getContract } from './utils.js';
import process from 'process';

async function main() {
    const args = process.argv.slice(2);
    const address = args[0];
    const contract = getContract(address);

    const users = await contract.getAllUsers();
    console.log('Users:', users);
}

main().catch(err => { console.error(err); process.exitCode = 1; });
