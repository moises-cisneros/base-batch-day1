# Base Batch Preparation - Day 1: First Smart Contract

This repository contains the Day 1 exercise for the "Base Batch Preparation" program. The goal for Day 1 is to compile, deploy and interact with a simple smart contract on a Base testnet.

## What this project does

- Implements a simple message-board smart contract named `Greeter` that lets addresses store messages, list unique users, and read messages by address.
- Provides a Foundry deploy script to deploy the contract.
- Provides small Node.js scripts (using ethers v6) to interact with the deployed contract: send messages, read messages, and list users.

## Files of interest

- `src/Greeter.sol` - The Greeter smart contract (message board).
- `script/Deploy.s.sol` - Foundry script that deploys `Greeter` (contract: `DeployGreeter`).
- `js/` - Node.js helper scripts and utilities to interact with the deployed contract:
  - `js/sendMessage.js` - send a message via `sendMessage`.
  - `js/readMessages.js` - read messages for a specific address.
  - `js/listUsers.js` - list all users that have sent messages.
  - `js/utils.js` - common utilities (loads .env, RPC_URL, PRIVATE_KEY, loads ABI/artifact).
- `out/` or `artifacts/` - typical Foundry compile output (the JS utils look for `out/Greeter.json` or `artifacts/Greeter.json`).

## Tech stack

- Solidity ^0.8.20
- Foundry
- React
- Base Sepolia testnet

## Prerequisites

- Foundry (for compile & deploy): install from <https://foundry.paradigm.xyz/> and ensure `forge` is on your PATH.
- Node.js 18+ and npm (or pnpm/yarn) to run the JS scripts.
- A JSON-RPC endpoint for the Base testnet (or other network) and a funded private key for deployment/transactions.

## Environment variables

Create a `.env` file at the project root (or in a parent folder). The JS utilities expect the following variables:

- `RPC_URL` — JSON-RPC URL of the network.
- `PRIVATE_KEY` — deployer/sender private key (used by scripts that send transactions).
- `CONTRACT_ADDRESS` — optional; the deployed Greeter contract address (used by the scripts if provided).

Example `.env` (do not commit this file):

```bash
RPC_URL=https://...your-node-url...
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
```

## Quickstart

1. Compile the contracts with Foundry:

```bash
forge build
```

1. Deploy with the provided script (broadcasts transaction):

```bash
forge script script/Deploy.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

Alternatively, if your `foundry.toml` defines a named RPC endpoint (for example `baseSepolia`), you can use:

```bash
forge script script/Deploy.s.sol --rpc-url baseSepolia --private-key "$PRIVATE_KEY" --broadcast
```

After a successful run you'll see the deployed contract address and a `broadcast/` record saved locally.

1. Install Node dependencies for the JS scripts:

```bash
cd js
npm install
```

1. Use the JS scripts to interact with the contract:

- Send a message

```bash
node sendMessage.js <contractAddress> "Hello from the Base Batch"
```

Or using the npm script defined in `js/package.json` (from the `js` folder):

```bash
npm run send -- <contractAddress> "Hello from the Base Batch"
```

- Read messages for a user

```bash
node readMessages.js <contractAddress> <userAddress>
```

- List users

```bash
node listUsers.js <contractAddress>
```

Important: before compiling or deploying, export the environment variables from your `.env` into the shell session so that Foundry and the JS scripts can read them. For example on Linux/WSL/Bash:

```bash
export RPC_URL="https://...your-node-url..."
export PRIVATE_KEY="0x..."
export CONTRACT_ADDRESS="0x..."  # optional
```

This repository is designed to work on Linux and WSL environments (Foundry is required and must be installed beforehand). Foundry-based commands will run in Linux/WSL as long as `forge` is installed and available on your PATH.

## Frontend (React)

There is a small React frontend inside the `web/` directory. It uses Vite and Yarn. To run it locally:

```bash
cd web
yarn install
yarn dev
```

The dev server will start (Vite) and you can open the provided URL in your browser. The frontend can use the same ABI/artifact to interact with the deployed contract (point it to the `CONTRACT_ADDRESS` and `RPC_URL`).

Notes:

- The JS utilities try to locate a compiled artifact in `out/Greeter.json` or `artifacts/Greeter.json`. If your build process emits artifacts elsewhere, copy or provide a minimal ABI as `src/Greeter.abi.json` or edit `js/utils.js`.
- `sendMessage.js` uses a gas limit of 500k by default in the script; adjust if required.

## Tests

If you want to run the existing Solidity tests (requires Foundry):

```bash
forge test
```

## Tips

- Keep your `.env` private. Never commit private keys to version control.
- If you need to interact with a locally deployed contract, set `RPC_URL` to your node and `CONTRACT_ADDRESS` to the local address.

## Next steps / Exercises

- Extend `Greeter` to support message deletion or message editing (exercise).
- Add a front-end page under `web/` that connects to the contract using the same ABI.

---

If you'd like, I can also add a sample `.env.example`, a small script to automatically set the `CONTRACT_ADDRESS` after deployment, or a short guide that walks through a live deployment to the Base testnet.

---

Author: Moises Cisneros

---
