import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import EmojiPicker from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'
import InfoUser from '../components/InfoUser'
import ChatListItem from '../components/ChatListItem'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'

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
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
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
  const [contacts, setContacts] = useState<Contact[]>([
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
    },
    {
      id: 3,
      name: "Dauran Lima",
      avatar: "https://ui-avatars.com/api/?name=Dauran+Lima",
      lastMessage: "See you tomorrow!",
      lastMessageTime: "09:15"
    },
    {
      id: 4,
      name: "Michelle Lima",
      avatar: "https://ui-avatars.com/api/?name=Michelle+Lima",
      lastMessage: "See you tomorrow!",
      lastMessageTime: "09:15"
    }
  ])

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase()
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.lastMessage.toLowerCase().includes(searchLower)
    )
  })

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value)
    // Ajusta a altura do textarea automaticamente
    e.target.style.height = 'inherit'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
  }

  const handleLogout = async () => {
    // Mostra confirmação antes de fazer logout
    const result = await Swal.fire({
      title: 'Sair do sistema',
      text: 'Tem certeza que deseja sair?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#3B82F6',
      reverseButtons: true
    })

    if (result.isConfirmed) {
      try {
        // Primeiro limpa o estado local
        setSelectedContact(null)
        setSearchTerm('')
        setMessageInput('')
        setShowEmojiPicker(false)

        // Faz o logout usando o contexto de autenticação
        await signOut()
        
        // Mostra mensagem de sucesso
        await Swal.fire({
          title: 'Até logo!',
          text: 'Você foi desconectado com sucesso',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        })

        // Redireciona para o login
        navigate('/login', { replace: true })
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
        // Mostra erro e força o redirecionamento
        await Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao sair do sistema',
          icon: 'error',
          confirmButtonColor: '#3B82F6'
        })
        navigate('/login', { replace: true })
      }
    }
  }

  const handleDeleteChat = (contactId: number) => {
    setContacts(prevContacts => prevContacts.filter(contact => contact.id !== contactId))
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <div className={`${
        selectedContact ? 'hidden md:flex' : 'flex'
      } w-full md:w-1/3 border-r border-gray-200 bg-white flex-col`}>
        {/* Container principal com flex e altura total */}
        <div className="flex flex-col h-full">
          {/* Cabeçalho fixo */}
          <div className="p-4 border-b border-gray-200">
            <InfoUser onNewChat={handleNewChat} />
            {/* Search Input */}
            <div className="relative mt-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar conversas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                  title="Limpar busca"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Lista de contatos com scroll */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <ChatListItem
                key={contact.id}
                contact={contact}
                onSelect={setSelectedContact}
                onDelete={handleDeleteChat}
              />
            ))}
          </div>

          {/* Botão de logout mais discreto */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 px-8 py-2.5 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Área do Chat */}
      <div className={`${
        selectedContact ? 'flex' : 'hidden md:flex'
      } flex-1 flex-col h-full`}>
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
            <div className="p-3 border-t border-gray-200 bg-white">
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
                <textarea
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[150px] overflow-y-auto scrollbar-hide"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  rows={1}
                />
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 self-end"
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