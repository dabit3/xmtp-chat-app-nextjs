import {
  useContext, useEffect, useState, useRef
} from 'react'
import { useRouter } from 'next/router'
import { MainContext } from '../../context'
import { SortDirection, Message } from '@xmtp/xmtp-js';

export default function Conversation() {
  const {
    currentConversation, address
  } = useContext(MainContext)
  const router = useRouter()
  const { id } = router.query

  const [message, setMessage] = useState<string>('')
  let [messages, setMessages] = useState<Record<string,Message>>({})
  const messagesRef = useRef<Record<string,Message>>({})

  useEffect(() => {
    if (!currentConversation) {
      router.push('/')
    } else {
      fetchMessages()
      listen()
    }
  }, [])

  async function listen() {
    const stream = await currentConversation.streamMessages()
    for await (const newMessage of stream) {
      messagesRef.current[newMessage.id] = newMessage
      setMessages({...messagesRef.current})
    }
  }

  async function fetchMessages() {
   try {
    const newMessages = await currentConversation.messages({
      limit: 100,
      direction: SortDirection.SORT_DIRECTION_ASCENDING
    })

    newMessages.map(message => messagesRef.current[message.id] = message)
    setMessages(messagesRef.current)
   } catch (err) {
    console.log('error fetching messages...', err)
   }
  }

  async function createMessage() {
    await currentConversation.send(message)
    console.log('message sent...')
    setMessage('')
  }

  if (!Object.values(messages).length) return
  const messagesAsArray = Object.values(messages).reverse()
  return (
    <main>
        <h1 style={headerStyle}>{id}</h1>
        <div style={formContainerStyle}>
          <input
            style={inputStyle}
            placeholder="Message..."
            onChange={e => setMessage(e.target.value)}
            value={message}
          />
          <button style={buttonStyle} onClick={createMessage}>
            <p>Send</p>
          </button>
        </div>
        {
          messagesAsArray.map((message: any) => (
            <div key={message.id} style={checkIfSenderContainer(address, message.senderAddress)}>
              <p style={checkIfSenderMessage(address, message.senderAddress)}>{message.content}</p>
            </div>
          ))
        }
    </main>
  )
}

const headerStyle = {
  marginTop: '20px'
}

const formContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as 'column',
  justifyContent: 'flex-start',
  marginTop: '20px',

}

const inputStyle = {
  width: '300px',
  border: '1px solid #ddd',
  borderRadius: '20px',
  padding: '8px 17px'
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

const messageContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'flex-start'
}

const messageStyle = {
  marginTop: '7px',
  padding: '8px 14px',
  backgroundColor: '#ededed',
  borderRadius: '20px',
}

function checkIfSenderContainer(owner, sender) {
  if (owner.toLowerCase() !== sender.toLowerCase()) {
    return {
      ...messageContainerStyle,
      alignItems: 'flex-end',
    }
  } else {
    return messageContainerStyle
  }
}

function checkIfSenderMessage(owner, sender) {
  if (owner.toLowerCase() !== sender.toLowerCase()) {
    return messageStyle
  } else {
    return {
      ...messageStyle,
      color: 'white',
      backgroundColor: '#1b9cee'
    }
  }
}
