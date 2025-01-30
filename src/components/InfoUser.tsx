import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'

interface InfoUserProps {
  onNewChat: () => void
}

const InfoUser = ({ onNewChat }: InfoUserProps) => {
  const { user, updateUserProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleAvatarClick = async () => {
    const result = await Swal.fire({
      title: 'Alterar foto do perfil',
      text: 'Deseja alterar sua foto de perfil?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, alterar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#EF4444',
      reverseButtons: true
    })

    if (result.isConfirmed) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validações
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      await Swal.fire({
        title: 'Formato inválido',
        text: 'Apenas imagens JPG e PNG são permitidas',
        icon: 'error',
        confirmButtonColor: '#3B82F6'
      })
      return
    }

    if (file.size > 1024 * 1024) {
      await Swal.fire({
        title: 'Arquivo muito grande',
        text: 'A imagem deve ter no máximo 1MB',
        icon: 'error',
        confirmButtonColor: '#3B82F6'
      })
      return
    }

    // Mostra preview da imagem antes de fazer upload
    const reader = new FileReader()
    reader.onload = async (e) => {
      const result = await Swal.fire({
        title: 'Preview da imagem',
        text: 'Deseja usar esta imagem como seu avatar?',
        imageUrl: e.target?.result as string,
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: 'Preview do avatar',
        showCancelButton: true,
        confirmButtonText: 'Sim, usar esta imagem',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#EF4444',
        reverseButtons: true
      })

      if (result.isConfirmed) {
        try {
          setUploading(true)

          // Remove avatar antigo se existir
          if (user?.avatar_url) {
            const oldAvatarPath = user.avatar_url.split('/').pop()
            if (oldAvatarPath) {
              await supabase.storage
                .from('avatars')
                .remove([oldAvatarPath])
            }
          }

          // Gera um nome único para o arquivo
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

          // Upload para o Storage do Supabase
          const { error: uploadError, data } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            })

          if (uploadError) throw uploadError

          // Gera URL pública do arquivo
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

          // Atualiza o perfil do usuário com a nova URL do avatar
          if (user) {
            await updateUserProfile({
              ...user,
              avatar_url: publicUrl
            })
            
            await Swal.fire({
              title: 'Sucesso!',
              text: 'Avatar atualizado com sucesso!',
              icon: 'success',
              confirmButtonColor: '#3B82F6',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            })
          }
        } catch (error: any) {
          console.error('Erro ao atualizar avatar:', error)
          await Swal.fire({
            title: 'Erro!',
            text: error.message || 'Erro ao atualizar avatar. Tente novamente.',
            icon: 'error',
            confirmButtonColor: '#3B82F6'
          })
        } finally {
          setUploading(false)
        }
      }
    }
    reader.readAsDataURL(file)

    // Limpa o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}`}
            alt={user?.full_name || 'User Avatar'}
            className="h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleAvatarClick}
            title="Clique aqui para alterar a imagem"
            role="button"
            aria-label="Alterar foto do perfil"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
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