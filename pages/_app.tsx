import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { MainContext } from '../context'
import { Client } from '@xmtp/xmtp-js'
import { ethers } from 'ethers'
import { useState, useRef } from 'react'
import { Inter } from '@next/font/google'

const inter = Inter({ subsets: ['latin'] })

declare global {
  interface Window{
    ethereum?:any
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const [client, setClient] = useState<Client>()
  const [provider, setProvider] = useState<any>(null)
  const [address, setAddress] = useState('')
  const [currentConversation, setCurrentConversation] = useState<any>(null)
  const profilesRef = useRef({})

  async function connect() {
    const addresses = await window.ethereum.send('eth_requestAccounts')
    setAddress(addresses.result[0])
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    initClient(provider)
  }

  async function initClient(wallet: any) {
    if (wallet && !client) {
      try {
        const signer = wallet.getSigner()
        const xmtp = await Client.create(signer, {
          env: 'production'
        })
        setClient(xmtp)
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <div style={containerStyle}>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <nav>
        <Link href={'/'} style={linkStyle}>
          Home
        </Link>
        <Link href={'/create'} style={linkStyle}>
          Create
        </Link>
      </nav>
      <MainContext.Provider value={{
        provider,
        client,
        connect,
        address,
        currentConversation,
        setCurrentConversation,
        profilesRef,
      }}>
        <Component {...pageProps} />
      </MainContext.Provider>
    </div>
  )
}

const linkStyle = {
  marginRight: '20px'
}

const containerStyle = {
  width: '800px',
  margin: '0 auto',
  paddingTop: 60
}