import React, { useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RestorePasswordForm } from '../../features/auth'
import { useAuth } from '../../shared/context/AuthContext'

// Мемоизированный компонент страницы восстановления пароля
const RestorePasswordPage = memo(() => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  // Перенаправление если пользователь уже авторизован
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (import.meta.env.DEV) {
        console.log('RestorePasswordPage: Пользователь уже авторизован, перенаправляем на главную')
      }
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Не показываем форму пока идет проверка авторизации
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
      </div>
    )
  }

  // Если пользователь уже авторизован, не показываем форму
  if (isAuthenticated) {
    return null
  }

  return <RestorePasswordForm />
})

RestorePasswordPage.displayName = 'RestorePasswordPage'

export default RestorePasswordPage 