import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Wallet, JsonRpcProvider, Contract, isAddress } from 'ethers';

// Load .env from nearest ancestor that contains it
function findUpEnv(startDir = process.cwd()) {
    let dir = startDir;
    const root = path.parse(startDir).root;
    while (true) {
        const candidate = path.join(dir, '.env');
        if (fs.existsSync(candidate)) return candidate;
        if (dir === root) return null;
        dir = path.dirname(dir);
    }
}

const envPath = findUpEnv(process.cwd());
if (envPath) {
    dotenv.config({ path: envPath });
} else {
    // fallback to default behavior
    dotenv.config();
}

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL) {
    console.warn('Warning: RPC_URL not set in .env');
}

const provider = RPC_URL ? new JsonRpcProvider(RPC_URL) : null;

function getWallet() {
    if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY not set in .env');
    if (!provider) throw new Error('RPC_URL not set in .env');
    return new Wallet(PRIVATE_KEY, provider);
}

function loadAbi() {
    // Try to load artifact from out/ or src/ if present
    const possible = [
        path.resolve(process.cwd(), 'out', 'Greeter.json'),
        path.resolve(process.cwd(), 'artifacts', 'Greeter.json'),
        path.resolve(process.cwd(), 'src', 'Greeter.abi.json')
    ];
    for (const p of possible) {
        if (fs.existsSync(p)) {
            const j = JSON.parse(fs.readFileSync(p, 'utf8'));
            // Accept either full artifact or raw abi
            if (j.abi) return j.abi;
            return j;
        }
    }
    // Fallback: inline minimal ABI
    return [
        'event MessageSent(address indexed sender, uint256 indexed index, string message)',
        'function sendMessage(string)',
        'function getMessages(address) view returns (string[])',
        'function getAllUsers() view returns (address[])',
        'function getMessagesCount(address) view returns (uint256)',
        'function greet() view returns (string)'
    ];
}

function getContract(address = CONTRACT_ADDRESS) {
    if (!address) throw new Error('Contract address not provided and CONTRACT_ADDRESS not set');
    const abi = loadAbi();
    if (!provider) throw new Error('RPC_URL not set in .env');
    // optional validation: ensure address is correct
    if (!isAddress(address)) throw new Error('Invalid contract address: ' + address);
    return new Contract(address, abi, provider);
}

function getContractWithSigner(address = CONTRACT_ADDRESS) {
    const wallet = getWallet();
    const abi = loadAbi();
    if (!isAddress(address)) throw new Error('Invalid contract address: ' + address);
    return new Contract(address, abi, wallet);
}

export { provider, getWallet, getContract, getContractWithSigner, CONTRACT_ADDRESS };
