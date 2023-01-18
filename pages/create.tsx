import {
  useContext, useState
} from 'react'
import {
  client as apolloClient, getDefaultProfile, getProfile
} from '../api'
import { useRouter } from 'next/router'
import { MainContext } from '../context'

const PREFIX = 'lens.dev/dm'
const buildConversationId = (profileIdA: string, profileIdB: string) => {
  const profileIdAParsed = parseInt(profileIdA, 16)
  const profileIdBParsed = parseInt(profileIdB, 16)
  return profileIdAParsed < profileIdBParsed
    ? `${PREFIX}/${profileIdA}-${profileIdB}`
    : `${PREFIX}/${profileIdB}-${profileIdA}`
}

export default function Create() {
  let [handle, setHandle] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const {
    client, address
  } = useContext(MainContext)
  const router = useRouter()

  async function createMessage() {
    if (!handle || !message) return
    if (!handle.includes('.lens')) {
      handle = handle + '.lens'
    }

    // my profile
    const { data: { defaultProfile }} = await apolloClient.query({
      query: getDefaultProfile,
      variables: {
        address
      }
    })

     // other user's profile
     const { data: { profile }} = await apolloClient.query({
      query: getProfile,
      variables: {
        handle
      }
    })

    const conversation = await client.conversations.newConversation(
      profile.ownedBy,
      {
        conversationId: buildConversationId(defaultProfile.id, profile.id),
        metadata: {},
      }
    )

    await conversation.send(message)
    router.push('/')
  }

  return (
    <main>
        <h1>Create message</h1>
        <button onClick={createMessage}>createMessage</button>
        <input
          onChange={e => setHandle(e.target.value)}
          placeholder="Handle"
        />
        <input
          onChange={e => setMessage(e.target.value)}
          placeholder="Message"
        />
    </main>
  )
}


