import { useRef, useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'

interface InfoUserProps {
  onNewChat: () => void
}

const InfoUser = ({ onNewChat }: InfoUserProps) => {
  const { user, updateUserProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [uploading, setUploading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newFullName, setNewFullName] = useState(user?.full_name || '')
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Função para validar o nome
  const validateName = (name: string): boolean => {
    // Remove espaços extras e normaliza
    const trimmedName = name.trim()
    
    // Verifica se está vazio
    if (!trimmedName) {
      setNameError('O nome não pode ficar em branco')
      return false
    }

    // Verifica o comprimento mínimo
    if (trimmedName.length < 3) {
      setNameError('O nome deve ter pelo menos 3 caracteres')
      return false
    }

    // Verifica se contém apenas números
    if (/^\d+$/.test(trimmedName)) {
      setNameError('O nome não pode conter apenas números')
      return false
    }

    // Verifica se contém apenas emojis
    const emojiRegex = /^[\p{Emoji}]+$/u
    if (emojiRegex.test(trimmedName)) {
      setNameError('O nome não pode conter apenas emojis')
      return false
    }

    // Verifica se contém caracteres válidos (letras, espaços e alguns caracteres especiais comuns em nomes)
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/
    if (!nameRegex.test(trimmedName)) {
      setNameError('O nome deve conter apenas letras, espaços e caracteres válidos')
      return false
    }

    // Verifica se tem pelo menos duas palavras (nome e sobrenome)
    const words = trimmedName.split(/\s+/).filter(word => word.length > 0)
    if (words.length < 2) {
      setNameError('Por favor, insira nome e sobrenome')
      return false
    }

    // Se passou por todas as validações, limpa o erro
    setNameError('')
    return true
  }

  const handleEditName = async () => {
    try {
      if (!user) return

      // Valida o nome antes de prosseguir
      if (!validateName(newFullName)) {
        return
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: newFullName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      await updateUserProfile({
        ...user,
        full_name: newFullName.trim()
      })

      setIsEditModalOpen(false)
      setIsDropdownOpen(false)

      await Swal.fire({
        title: 'Sucesso!',
        text: 'Nome atualizado com sucesso!',
        icon: 'success',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      })
    } catch (error: any) {
      console.error('Erro ao atualizar nome:', error)
      await Swal.fire({
        title: 'Erro!',
        text: error.message || 'Erro ao atualizar nome. Tente novamente.',
        icon: 'error',
        confirmButtonColor: '#3B82F6'
      })
    }
  }

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
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div>
              <h3 className="text-sm font-medium text-gray-900">{user?.full_name || 'Usuário'}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-gray-400 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsEditModalOpen(true)
                    setIsDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <span>Editar nome</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão Nova Conversa */}
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

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Editar nome</h3>
                <div>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => {
                      setNewFullName(e.target.value)
                      // Limpa o erro quando o usuário começa a digitar
                      if (nameError) setNameError('')
                    }}
                    className={`mt-1 py-3 px-2 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      nameError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Digite seu nome completo"
                  />
                  {nameError && (
                    <p className="mt-2 text-sm text-red-600">{nameError}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Digite seu nome completo usando apenas letras, espaços e caracteres válidos.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditName}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Salvar alterações
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setNameError('')  // Limpa qualquer erro ao fechar
                    setNewFullName(user?.full_name || '')  // Restaura o nome original
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoUser 