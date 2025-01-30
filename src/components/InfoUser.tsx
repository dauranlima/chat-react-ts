
interface InfoUserProps {
  name: string
  email: string
  avatarUrl: string
  onNewChat: () => void
}

const InfoUser = ({ name, email, avatarUrl, onNewChat }: InfoUserProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1 mx-3">
        <h2 className="text-sm font-medium text-gray-900">{name}</h2>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
      <button
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none"
        title="Nova conversa"
        onClick={onNewChat}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}

export default InfoUser 