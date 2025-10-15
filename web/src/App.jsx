import React, { useState } from 'react'
import './App.css'
import { getContract, getProvider } from './Contract'
import { ethers } from 'ethers'

export default function App() {
  const [account, setAccount] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState([])
  const [queryAddr, setQueryAddr] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [status, setStatus] = useState('')
  const [chainId, setChainId] = useState(null)

  async function connect() {
    try {
      const provider = getProvider()
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      setAccount(addr)
      try {
        const net = await provider.getNetwork()
        setChainId(net.chainId)
      } catch (e) {
        // ignore network read error
      }
    } catch (e) {
      alert('Connect error: ' + e.message)
    }
  }

  async function switchToBaseSepolia() {
    if (!window.ethereum) {
      alert('MetaMask not found')
      return
    }
    try {
      // chainId 84532 => hex 0x14A34
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14A34' }]
      })
    } catch (switchError) {
      // This error code indicates the chain is not added to MetaMask
      if (switchError.code === 4902 || (switchError && switchError.message && switchError.message.includes('Unrecognized chain ID'))) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x14A34',
              chainName: 'Base Sepolia',
              rpcUrls: ['https://sepolia.base.org'],
              nativeCurrency: { name: 'BASE', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://basescan.org']
            }]
          })
        } catch (addErr) {
          alert('Failed to add network: ' + (addErr.message || addErr))
        }
      } else {
        alert('Failed to switch network: ' + (switchError.message || switchError))
      }
    }
  }

  async function send() {
    try {
      setLoading(true)
      setStatus('Sending transaction...')
      setTxHash('')
      const c = await getContract(contractAddress, true)
      const tx = await c.sendMessage(message)
      setTxHash(tx.hash)
      setStatus('Broadcasted (waiting confirmation)')
      await tx.wait()
      setStatus('Transaction confirmed')
      setLoading(false)
    } catch (e) {
      const msg = e && (e.message || JSON.stringify(e))
      const details = e && (e.code ? ` (code=${e.code})` : e.name ? ` (name=${e.name})` : '')
      alert(`Send error: ${msg}${details}`)
      console.error('send error', e)
      setLoading(false)
      setStatus('')
    }
  }

  async function listUsers() {
    try {
      if (!contractAddress || contractAddress.trim() === '') {
        alert('Please provide the contract address first')
        return
      }
      if (!ethers.isAddress(contractAddress)) {
        alert('Contract address is not a valid EVM address')
        return
      }
      const provider = getProvider()
      let code
      try {
        code = await provider.getCode(contractAddress)
      } catch (err) {
        // Some networks do not support ENS or certain RPC methods; handle gracefully
        console.warn('Error calling provider.getCode', err)
        alert('Error checking contract code: ' + (err.message || err))
        return
      }
      if (!code || code === '0x') {
        alert('No contract found at that address on the connected network. Check address and network.')
        return
      }
      setLoading(true)
      setStatus('Loading users...')
      const c = await getContract(contractAddress, false)
      const u = await c.getAllUsers()
      // ensure returned values are addresses
  const filtered = (u || []).filter(a => typeof a === 'string' && ethers.isAddress(a))
      setUsers(filtered)
      setLoading(false)
      setStatus('')
    } catch (e) { alert(e.message) }
  }

  async function readMessages(addrParam) {
    try {
      const addr = (addrParam !== undefined && addrParam !== null) ? String(addrParam).trim() : (queryAddr || '').trim()
      if (!addr) {
        alert('Please provide a user address to query (or click a user from the list)')
        return
      }
      if (!ethers.isAddress(addr)) {
        alert('The provided user address is not a valid EVM address')
        return
      }
      setLoading(true)
      setStatus('Loading messages...')
      if (!contractAddress || contractAddress.trim() === '') {
        alert('Please provide the contract address first')
        setLoading(false)
        setStatus('')
        return
      }
      const provider = getProvider()
      let code
      try {
        code = await provider.getCode(contractAddress)
      } catch (err) {
        console.warn('Error calling provider.getCode', err)
        alert('Error checking contract code: ' + (err.message || err))
        setLoading(false)
        setStatus('')
        return
      }
      if (!code || code === '0x') {
        alert('No contract found at that address on the connected network. Check address and network.')
        setLoading(false)
        setStatus('')
        return
      }
      const c = await getContract(contractAddress, false)
      const msgs = await c.getMessages(addr)
      setMessages(msgs)
      setLoading(false)
      setStatus('')
    } catch (e) {
      const msg = e && (e.message || JSON.stringify(e))
      const details = e && (e.code ? ` (code=${e.code})` : e.name ? ` (name=${e.name})` : '')
      alert(`Error fetching messages: ${msg}${details}`)
      console.error('readMessages error', e)
    }
  }

  function onUserClick(addr) {
    setQueryAddr(addr)
    // auto-fetch messages for convenience using the address directly
    readMessages(addr).catch(err => console.error('readMessages auto error', err))
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Greeter Messages (React)</h1>
      <div className="topbar">
        <div>
          <button onClick={connect} disabled={loading}>Connect Wallet</button>
          <span className="account">{account}</span>
        </div>
        <div className="status">
          <span>{chainId ? `Chain: ${chainId}` : ''}</span>
          <span className="statusText">{status}</span>
          <div>
            <button onClick={switchToBaseSepolia} style={{ marginLeft: 8 }}>Switch to Base Sepolia</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <input placeholder="Contract address" value={contractAddress} onChange={e => setContractAddress(e.target.value)} style={{ width: '400px' }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} style={{ width: '400px', height: 80 }} />
        <br />
        <button onClick={send} disabled={loading || !message}>Send Message</button>
        {txHash && (
          <div className="tx">
            Tx: <code>{txHash}</code>
            <button onClick={() => navigator.clipboard.writeText(txHash)}>Copy</button>
          </div>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={listUsers}>List Users</button>
        <div style={{ marginTop: 8 }}>
          {users && users.length > 0 ? (
            <ul>
              {users.map((u) => (
                <li key={u}>
                  <button onClick={() => onUserClick(u)} style={{ background: 'transparent', border: 'none', color: '#0366d6', cursor: 'pointer' }}>{u}</button>
                </li>
              ))}
            </ul>
          ) : (
            <div>No users yet</div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <input placeholder="Address to query" value={queryAddr} onChange={e => setQueryAddr(e.target.value)} style={{ width: '400px' }} />
        <button onClick={() => readMessages()} disabled={loading || !queryAddr}>Read Messages</button>
        <div className="messages">
          {messages && messages.length > 0 ? (
            <ul>
              {messages.map((m, i) => (<li key={i}>{m}</li>))}
            </ul>
          ) : (
            <div>No messages</div>
          )}
        </div>
      </div>
    </div>
  )
}

