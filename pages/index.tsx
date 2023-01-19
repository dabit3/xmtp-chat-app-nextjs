import { useState, useContext, useEffect } from 'react'
import { client as apolloClient, getDefaultProfile } from '../api'
import { MainContext } from '../context'
import Link from 'next/link'
import { SortDirection, Client, Conversation } from '@xmtp/xmtp-js'

export const buildConversationKey = (peerAddress: string, conversationId: string): string =>
  `${peerAddress.toLowerCase()}/${conversationId}`;

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false)
  const context = useContext(MainContext)
  let [profiles, setProfiles] = useState<any>({})

  let {
    provider,
    client,
    connect,
    setCurrentConversation,
    profilesRef,
  } = context

  useEffect(() => {
    if (!Object.keys(profilesRef.current).length) {
      fetchMessages(client)
    } else {
      setProfiles(profilesRef.current)
    }
  }, [client])

  async function fetchMostRecentMessage(convo) {
    const key = buildConversationKey(convo.peerAddress, convo.context?.conversationId as string)

    const newMessages = await convo.messages({
      limit: 1,
      direction: SortDirection.SORT_DIRECTION_DESCENDING
    })
    if (newMessages.length <= 0) {
      return { key };
    }
    return { key, message: newMessages[0] };
  }

  async function fetchProfile(conversation) {
    const profileData = await apolloClient.query({
      query: getDefaultProfile,
        variables: {
        address: conversation.peerAddress
      }
    })
    return profileData.data.defaultProfile
  }

  async function fetchMessages(xmtp:Client) {
    if (!xmtp) return
    setLoading(true)
    const allConversations: Conversation[] = await xmtp.conversations.list()
    let lensConversations = allConversations.filter((conversation) =>
      conversation.context?.conversationId.startsWith('lens.dev/dm/')
    )

    const previews = await Promise.all(lensConversations.map(fetchMostRecentMessage))
    let profiles = await Promise.all(lensConversations.map(fetchProfile))

    profiles = profiles.map((profile, i) => {
      return {
        ...profile,
        preview: previews[i]
      }
    })
    profiles = profiles.filter(profile => profile.preview.message)

    const profileObj = profiles.reduce((acc, next) => {
      acc[next.preview.message.conversation.topic] = next
      return acc
    }, {})
    profilesRef.current = profileObj
    setLoading(false)
    setProfiles(profilesRef.current)
    previews.map(preview => streamConvos(preview.message?.conversation))
  }

  async function streamConvos(convo) {
    if (!convo) return
    for await (const message of await convo.streamMessages()) {
      profilesRef.current[message.conversation.topic].preview.message = message
      setProfiles({...profilesRef.current})
    }
  }

  profiles = Object.values(profilesRef.current).reverse()

  return (
    <main>
      <div style={containerStyle}>
        <h1>XMTP Chat</h1>
        {
          loading && (
            <p>Loading conversations...</p>
          )
        }
        {
          !provider && (
            <button style={buttonStyle} onClick={connect}>Connect</button>
          )
        }
        {
          Boolean(profiles.length) && profiles.map((profile:any, index) => (
            <Link key={index} href={`/conversation/${profile.handle}`} onClick={() => setCurrentConversation(profile.preview.message.conversation)}>
              <div style={convoContainerStyle}>
                <p>From: {profile.handle}</p>
                 <p>{profile.preview.message.content}</p>
              </div>
            </Link>
          ))
        }
        
      </div>
    </main>
  )
}

const convoContainerStyle = {
  padding: '10px 0px',
  borderBottom: '1px solid #ddd'
}

const containerStyle = {
  width: '800px',
  margin: '0 auto',
  paddingTop: 60
}

const buttonStyle = {
  borderRadius: '12px',
  marginTop: '5px',
  width: '200px',
  height: '50px',
  outline: 'none',
  cursor: 'pointer',
  border: 'none'
}