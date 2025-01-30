import { useSwipeable } from 'react-swipeable'
import { useState } from 'react'
interface Contact {
  id: number
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
}

interface ChatListItemProps {
  contact: Contact
  onSelect: (contact: Contact) => void
  onDelete: (contactId: number) => void
}

const ChatListItem = ({ contact, onSelect, onDelete }: ChatListItemProps) => {
  const [offset, setOffset] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const handlers = useSwipeable({
    onSwiping: (data) => {
      if (data.dir === 'Left') {
        const newOffset = Math.min(Math.abs(data.deltaX), 75)
        setOffset(newOffset)
      }
    },
    onSwipedLeft: (data) => {
      if (Math.abs(data.deltaX) >= 75) {
        setIsDeleting(true)
        setTimeout(() => {
          onDelete(contact.id)
        }, 300)
      } else {
        setOffset(0)
      }
    },
    onSwipedRight: () => {
      setOffset(0)
    },
    trackMouse: true
  })

  return (
    <div className="relative overflow-hidden">
      {/* Botão de delete que aparece por trás */}
      <div 
        className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center"
        style={{ width: '75px' }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
          />
        </svg>
      </div>

      {/* Item do chat */}
      <div
        {...handlers}
        className={`bg-white cursor-pointer transition-all duration-200 ${
          isDeleting ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          transform: `translateX(-${offset}px)`,
        }}
        onClick={() => onSelect(contact)}
      >
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="h-12 w-12 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {contact.name}
              </h3>
              <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatListItem 