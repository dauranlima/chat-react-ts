import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import EmojiPicker from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'
import InfoUser from '../components/InfoUser'
import ChatListItem from '../components/ChatListItem'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'
import { FaMicrophone, FaTrash, FaEdit, FaTimes, FaPlay } from 'react-icons/fa'
import { FaEllipsisVertical } from 'react-icons/fa6'
import Wavesurfer from 'wavesurfer.js'

interface Message {
  id: number
  content: string
  sender: string
  timestamp: string
  attachment?: {
    type: 'image' | 'document' | 'audio'
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
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
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

  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const wavesurferRef = useRef<Wavesurfer | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState<string>('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearchInputVisible, setIsSearchInputVisible] = useState(false)

  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)

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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const currentTime = new Date()
    const formattedTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        content: messageInput,
        sender: 'user',
        timestamp: formattedTime,
      },
    ])
    setMessageInput('')
    setShowEmojiPicker(false)
    scrollToBottom()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileUrl = e.target?.result as string

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          content: file.type.startsWith('image/') ? '' : file.name,
          sender: 'user',
          timestamp: new Date().toLocaleTimeString(),
          attachment: {
            type: file.type.startsWith('image/') ? 'image' : 'document',
            url: fileUrl,
            name: file.name,
          },
        },
      ])
    }

    reader.readAsDataURL(file)
  }

  const handleNewChat = () => {
    console.log('Iniciar nova conversa')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value)
    e.target.style.height = 'inherit'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
  }

  const handleLogout = async () => {
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
        setSelectedContact(null)
        setMessageInput('')
        setShowEmojiPicker(false)

        await signOut()
        
        await Swal.fire({
          title: 'Até logo!',
          text: 'Você foi desconectado com sucesso',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        })

        navigate('/login', { replace: true })
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
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
    if (selectedContact?.id === contactId) {
      setSelectedContact(null)
      setMessages([])
    }
  }

  const loadContactMessages = (contact: Contact) => {
    const mockMessages: Message[] = [
      {
        id: 1,
        content: "Olá! Como vai?",
        sender: "user",
        timestamp: "09:30"
      },
      {
        id: 2,
        content: "Oi! Tudo bem e você?",
        sender: "contact",
        timestamp: "09:31"
      },
      {
        id: 3,
        content: "Estou bem também! Viu aquela foto que te enviei?",
        sender: "user",
        timestamp: "09:32"
      },
      {
        id: 4,
        content: "Sim, ficou ótima!",
        sender: "contact",
        timestamp: "09:33",
        attachment: {
          type: 'image',
          url: 'https://picsum.photos/200/300',
          name: 'foto.jpg'
        }
      }
    ]
    setMessages(mockMessages)
  }

  useEffect(() => {
    if (selectedContact) {
      loadContactMessages(selectedContact)
    } else {
      setMessages([])
    }
  }, [selectedContact])

  const startRecording = async () => {
    setIsRecording(true)
    audioChunksRef.current = []
    setRecordingTime(0)

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new MediaRecorder(stream)

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data)
    }

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      setAudioBlob(audioBlob)
      const audioUrl = URL.createObjectURL(audioBlob)
      setCurrentAudioUrl(audioUrl)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          content: audioUrl,
          sender: 'user',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment: {
            type: 'audio',
            url: audioUrl,
            name: 'audio.wav',
          },
        },
      ])
    }

    mediaRecorderRef.current.start()

    const id = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
    setIntervalId(id)
  }

  const stopRecording = () => {
    setIsRecording(false)
    mediaRecorderRef.current?.stop()
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }

  const cancelRecording = () => {
    setIsRecording(false)
    mediaRecorderRef.current?.stop()
    audioChunksRef.current = []
    setRecordingTime(0)
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }

  const playAudio = (url: string) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.load(url)
      wavesurferRef.current.play()
    }
  }

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setEditingMessageContent(message.content)
  }
  

  const handleUpdateMessage = () => {
    if (editingMessageId !== null) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === editingMessageId ? { ...msg, content: editingMessageContent } : msg
        )
      )
      setEditingMessageId(null)
      setEditingMessageContent('')
    }
  }

  const handleDeleteMessage = (messageId: number) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId))
  }

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  useEffect(() => {
    if (audioBlob) {
      wavesurferRef.current = Wavesurfer.create({
        container: '#waveform',
        waveColor: 'blue',
        progressColor: 'green',
        height: 50,
      })
      wavesurferRef.current.load(URL.createObjectURL(audioBlob))
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
      }
    }
  }, [audioBlob])

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100">
      <div className={`${
        selectedContact ? 'hidden md:flex' : 'flex'
      } w-full md:w-96 border-r border-gray-200 bg-white flex-col`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <InfoUser onNewChat={handleNewChat} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <ChatListItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onClick={() => setSelectedContact(contact)}
                onDelete={() => handleDeleteChat(contact.id)}
              />
            ))}
          </div>

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

      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            <div className="p-4 border-b flex justify-between border-gray-200">
              <div className="flex items-center space-x-4">
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
              <div className="flex items-center p-4">
                  <div className="flex items-center">
                    {isSearchInputVisible && (
                      <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="transition-all duration-300 ease-in-out border border-gray-300 rounded-lg px-2 py-1 mr-2"
                        onBlur={() => setIsSearchInputVisible(false)}
                      />
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setIsSearchInputVisible(!isSearchInputVisible)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setShowDropdown(!showDropdown)}>
                      <FaEllipsisVertical className="text-gray-500" />
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bloquear Contato</a>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            <div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-100px)]">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2 relative`}
                  >
                    {message.sender === 'user' && (
                      <div className="flex gap-2 items-center mr-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => handleEditMessage(message)} title="Editar">
                          <FaEdit className="text-gray-300 hover:text-gray-500" />
                        </button>
                        <button onClick={() => handleDeleteMessage(message.id)} title="Deletar">
                          <FaTrash className="text-gray-300 hover:text-gray-500" />
                        </button>
                      </div>
                    )}
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg flex items-center ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                      style={{ borderRadius: '10px', padding: '10px', position: 'relative' }}
                    >
                      {message.attachment?.type === 'image' ? (
                        <img 
                          src={message.attachment.url} 
                          alt={message.attachment.name} 
                          className="max-w-full rounded-lg cursor-pointer" 
                          onClick={() => openModal(message.attachment?.url || '')}
                        />
                      ) : message.attachment?.type === 'document' ? (
                        <div className="flex items-center">
                          <img src={message.attachment.url} alt="Documento PDF" className="h-8 w-8 mr-2" />
                          <div className="flex flex-col">
                            <span className="font-medium">{message.attachment.name}</span>
                            <span className="text-xs text-gray-500">Documento do WPS PDF • 140 KB</span>
                          </div>
                          <a href={message.attachment.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500">
                            Baixar
                          </a>
                        </div>
                      ) : message.attachment?.type === 'audio' ? (
                        <div className="flex items-center">
                          <audio controls className="w-full">
                            <source src={message.attachment.url} type="audio/wav" />
                            Seu navegador não suporta o elemento de áudio.
                          </audio>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <span className="text-xs opacity-75 mt-1 block">{message.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
                  <p className="text-gray-500">Selecione um contato para iniciar a conversa</p>
                </div>
              )}
              <div ref={messagesEndRef} style={{ marginTop: '120px' }} />
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex items-end space-x-2">
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
                  {isRecording ? (
                    <>
                      <span>Gravando... {recordingTime}s</span>
                      <button onClick={cancelRecording} className="p-2 text-red-500">
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      title="Gravar áudio"
                      onClick={startRecording}
                    >
                      <FaMicrophone className="h-6 w-6" />
                    </button>
                  )}
                  {showEmojiPicker && (
                    <div className="absolute bottom-18 right-[50%] z-10 md:right-[60%]" ref={emojiPickerRef}>
                      <div className="shadow-lg rounded-lg">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                      </div>
                    </div>
                  )}
                </div>
                <textarea
                  value={editingMessageId ? editingMessageContent : messageInput}
                  onChange={(e) => (editingMessageId ? setEditingMessageContent(e.target.value) : setMessageInput(e.target.value))}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[150px] overflow-y-auto"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (editingMessageId) {
                        handleUpdateMessage();
                      } else {
                        handleSendMessage();
                      }
                    }
                  }}
                  rows={1}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 self-end"
                  onClick={editingMessageId ? handleUpdateMessage : handleSendMessage}
                >
                  {editingMessageId ? 'Atualizar' : 'Enviar'}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={closeModal}>
          <img src={selectedImage || ''} alt="Imagem ampliada" className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

    </div>
  )
}

export default Chat 