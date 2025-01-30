import { useState, useEffect, useRef } from 'react'
import EmojiPicker from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'
import InfoUser from '../components/InfoUser'

interface Message {
  id: number
  content: string
  sender: string
  timestamp: string
  attachment?: {
    type: 'image' | 'document'
    url: string
    name: string
  }
}

interface Contact {
  id: number
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
}

const Chat = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages] = useState<Message[]>([
    {
      id: 1,
      content: "Hey! How are you?",
      sender: "user",
      timestamp: "09:30"
    },
    {
      id: 2,
      content: "I'm good, thanks! How about you?",
      sender: "contact",
      timestamp: "09:31"
    },
    {
      id: 3,
      content: "Check this image!",
      sender: "user",
      timestamp: "09:32",
      attachment: {
        type: 'image',
        url: 'https://picsum.photos/200/300',
        name: 'sample-image.jpg'
      }
    }
  ])
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contacts: Contact[] = [
    {
      id: 1,
      name: "John Doe",
      avatar: "https://ui-avatars.com/api/?name=John+Doe",
      lastMessage: "Hey! How are you?",
      lastMessageTime: "09:30"
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "https://ui-avatars.com/api/?name=Jane+Smith",
      lastMessage: "See you tomorrow!",
      lastMessageTime: "09:15"
    }
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji)
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    
    // Aqui você implementará a lógica para enviar a mensagem
    console.log('Mensagem para enviar:', messageInput)
    setMessageInput('')
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Aqui você implementará a lógica para upload do arquivo
    console.log('Arquivo selecionado:', file)
    
    // Exemplo de preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('Preview da imagem:', e.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNewChat = () => {
    // Implementar lógica para iniciar nova conversa
    console.log('Iniciar nova conversa')
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row">
      {/* Contacts Sidebar */}
      <div className={`${
        selectedContact ? 'hidden md:block' : 'block'
      } w-full md:w-1/3 border-r border-gray-200 bg-white`}>
        <div className="p-4 border-b border-gray-200">
          <InfoUser
            name="Matt Smith"
            email="matt-smith@gmail.com"
            avatarUrl="https://ui-avatars.com/api/?name=Matt+Smith"
            onNewChat={handleNewChat}
          />
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedContact?.id === contact.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.lastMessage}</p>
                </div>
                <span className="text-xs text-gray-400">{contact.lastMessageTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${
        selectedContact ? 'flex' : 'hidden md:flex'
      } flex-1 flex-col`}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <button 
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setSelectedContact(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-10 h-10 rounded-full"
                />
                <h2 className="text-lg font-medium text-gray-900">{selectedContact.name}</h2>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.attachment && (
                      <div className="mt-2">
                        {message.attachment.type === 'image' ? (
                          <img 
                            src={message.attachment.url} 
                            alt={message.attachment.name}
                            className="rounded-lg max-w-full h-auto"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{message.attachment.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-xs opacity-75 mt-1 block">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-4">
                <div className="flex space-x-2">
                  <button 
                    className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    title="Adicionar emoji"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,.pdf,.doc,.docx,.txt"
                  />
                  <button 
                    className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    title="Anexar arquivo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 left-0 z-10" ref={emojiPickerRef}>
                      <div className="shadow-lg rounded-lg">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                />
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleSendMessage}
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Selecione um contato para iniciar a conversa</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat 