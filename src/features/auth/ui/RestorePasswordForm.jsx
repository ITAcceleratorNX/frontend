import React, { useState, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EyeIcon, EyeOffIcon, Mail, Lock, Key, ArrowRight, RefreshCw } from 'lucide-react'
import { authApi } from '../../../shared/api/auth'
import '../styles/auth-forms.css'

// Схема валидации с Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  unique_code: Yup.string()
    .min(4, 'Код должен содержать минимум 4 символа')
    .required('Уникальный код обязателен'),
  password: Yup.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно')
})

export const RestorePasswordForm = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isResendingCode, setIsResendingCode] = useState(false)

  // Таймер для повторной отправки кода
  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1)
      }, 1000)
    } else if (timer === 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timer])

  // Отправка кода на email
  const sendCode = async (email) => {
    if (!email) {
      toast.error('Введите email для отправки кода')
      return false
    }

    setIsResendingCode(true)
    try {
      const response = await authApi.checkEmailForRestore(email)
      
      if (response.user_exists) {
        setCodeSent(true)
        setTimer(60) // 60 секунд до повторной отправки
        toast.success('Код отправлен. Проверьте почту')
        return true
      } else {
        toast.error('Пользователь с таким email не найден')
        return false
      }
    } catch (error) {
      console.error('Ошибка при отправке кода:', error)
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Произошла ошибка при отправке кода')
      }
      return false
    } finally {
      setIsResendingCode(false)
    }
  }

  // Отправка формы восстановления пароля
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true)
    try {
      await authApi.restorePassword(values.email, values.unique_code, values.password)
      
      toast.success('Пароль успешно восстановлен!')
      
      // Перенаправляем на страницу логина через 2 секунды
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: values.email,
            message: 'Пароль восстановлен. Войдите с новым паролем.' 
          } 
        })
      }, 2000)
      
    } catch (error) {
      console.error('Ошибка при восстановлении пароля:', error)
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message
        
        if (typeof errorMessage === 'object') {
          // Обрабатываем объект с ошибками валидации
          Object.keys(errorMessage).forEach(field => {
            if (field === 'unique_code') {
              setFieldError('unique_code', errorMessage[field])
            } else if (field === 'email') {
              setFieldError('email', errorMessage[field])
            } else if (field === 'password') {
              setFieldError('password', errorMessage[field])
            }
          })
          
          const messages = Object.values(errorMessage).join(', ')
          toast.error(messages)
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Произошла ошибка при восстановлении пароля')
      }
    } finally {
      setIsLoading(false)
      setSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-[500px] mx-auto">
        {/* Блок с логотипом компании */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#273655]">ExtraSpace</h2>
          <div className="h-1 w-20 bg-[#273655] mx-auto mt-2 rounded-full"></div>
        </div>
        
        {/* Карточка формы восстановления */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Заголовок формы */}
          <div className="p-8 pb-0">
            <h1 className="text-2xl font-semibold mb-1 text-slate-800">Восстановление пароля</h1>
            <p className="text-slate-500 mb-6">
              {!codeSent 
                ? 'Введите email для получения кода восстановления'
                : 'Введите код из email и новый пароль'
              }
            </p>
          </div>
          
          {/* Форма восстановления */}
          <Formik
            initialValues={{
              email: '',
              unique_code: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <Form className="p-8 pt-4 space-y-5">
                {/* Email поле */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Field
                        name="email"
                        type="email"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 bg-white"
                        placeholder="example@email.com"
                        disabled={isLoading || isSubmitting}
                      />
                    </div>
                    
                    {/* Кнопка отправки/переотправки кода */}
                    <button
                      type="button"
                      onClick={() => sendCode(values.email)}
                      disabled={!values.email || timer > 0 || isResendingCode || isLoading}
                      className="px-4 py-3 bg-[#273655] text-white rounded-lg font-medium hover:bg-[#324569] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                      {isResendingCode ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {timer > 0 ? `${timer}с` : codeSent ? 'Отправить повторно' : 'Отправить код'}
                    </button>
                  </div>
                  <ErrorMessage name="email" component="div" className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  </ErrorMessage>
                </div>

                {/* Уникальный код */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <Key className="h-4 w-4" />
                    Уникальный код
                  </label>
                  <Field
                    name="unique_code"
                    type="text"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 bg-white"
                    placeholder="Введите код из email"
                    disabled={isLoading || isSubmitting}
                  />
                  <ErrorMessage name="unique_code" component="div" className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  </ErrorMessage>
                </div>

                {/* Новый пароль */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <Lock className="h-4 w-4" />
                    Новый пароль
                  </label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 bg-white pr-12"
                      placeholder="Введите новый пароль"
                      disabled={isLoading || isSubmitting}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading || isSubmitting}
                    >
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  </ErrorMessage>
                </div>

                {/* Подтверждение пароля */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <Lock className="h-4 w-4" />
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <Field
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 bg-white pr-12"
                      placeholder="Повторите новый пароль"
                      disabled={isLoading || isSubmitting}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={toggleConfirmPasswordVisibility}
                      disabled={isLoading || isSubmitting}
                    >
                      {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  </ErrorMessage>
                </div>

                {/* Кнопка восстановления пароля */}
                <button 
                  type="submit" 
                  disabled={isLoading || isSubmitting}
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-[#273655] text-white rounded-lg font-medium shadow-lg shadow-[#273655]/20 hover:bg-[#324569] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading || isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Восстановление...</span>
                    </div>
                  ) : (
                    <>
                      <span>Восстановить пароль</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Ссылка назад на логин */}
                <div className="text-center mt-6">
                  <p className="text-slate-600">
                    Вспомнили пароль?{" "}
                    <button 
                      type="button" 
                      className="text-[#273655] font-medium hover:underline"
                      onClick={() => navigate('/login')}
                      disabled={isLoading || isSubmitting}
                    >
                      Войти в систему
                    </button>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        
        {/* Футер */}
        <div className="text-center mt-6 text-sm text-slate-500">
          &copy; 2025 ExtraSpace. Все права защищены.
        </div>
      </div>
    </div>
  )
}

export default RestorePasswordForm 