import { ethers } from 'ethers'

const abi = [
    'function sendMessage(string)',
    'function getMessages(address) view returns (string[])',
    'function getAllUsers() view returns (address[])',
    'function getMessagesCount(address) view returns (uint256)',
    'function greet() view returns (string)'
]

export function getProvider() {
    if (window.ethereum) return new ethers.BrowserProvider(window.ethereum)
    return new ethers.JsonRpcProvider('http://localhost:8545')
}

export async function getContract(address, withSigner = false) {
    const provider = getProvider()
    if (withSigner) {
        const signer = await provider.getSigner()
        return new ethers.Contract(address, abi, signer)
    }
    return new ethers.Contract(address, abi, provider)
}
