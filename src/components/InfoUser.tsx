import { useAuth } from '../contexts/AuthContext'

interface InfoUserProps {
  onNewChat: () => void
}

const InfoUser = ({ onNewChat }: InfoUserProps) => {
  const { user } = useAuth()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={`https://ui-avatars.com/api/?name=${user?.full_name || 'User'}`}
          alt={user?.full_name || 'User Avatar'}
          className="h-10 w-10 rounded-full"
        />
        <div>
          <h3 className="text-sm font-medium text-gray-900">{user?.full_name || 'Usuário'}</h3>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={onNewChat}
        className="p-2 text-gray-400 hover:text-gray-600"
        title="Nova conversa"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  )
}

export default InfoUser 