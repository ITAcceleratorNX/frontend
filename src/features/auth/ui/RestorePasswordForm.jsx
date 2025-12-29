import React, { useState, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EyeIcon, EyeOffIcon, Mail, Lock, RefreshCw } from 'lucide-react'
import { authApi } from '../../../shared/api/auth'
import '../styles/auth-forms.css'
import loginLogo from '../../../assets/login-logo-66f0b4.png'

// Схема валидации с Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  unique_code: Yup.string()
    .matches(/^\d{6}$/, 'Код должен содержать ровно 6 цифр')
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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[520px] mx-auto">
        {/* Карточка формы восстановления */}
        <div className="bg-white rounded-[25px] border border-[#DFDFDF] shadow-[0px_4px_8.8px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="flex flex-col items-center gap-[20px] sm:gap-[24px] lg:gap-[28px] p-4 sm:p-5 lg:p-6">
            {/* Верхняя часть с логотипом и заголовком */}
            <div className="flex flex-col items-center gap-[16px] w-full">
              {/* Логотип */}
              <div className="w-[44px] h-[50px] sm:w-[48px] sm:h-[54px] flex-shrink-0">
                <img 
                  src={loginLogo} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Заголовок и подзаголовок */}
              <div className="flex flex-col items-center gap-[6px] w-full">
                <h1 className="text-[20px] sm:text-[22px] lg:text-[24px] font-medium leading-[1.19] tracking-[-0.05em] text-center text-[#363636] max-w-fit mx-auto">
                  Восстановление пароля
                </h1>
                <p className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-center text-[#5C5C5C] w-full max-w-[340px]">
                  {!codeSent 
                    ? 'Введите email для получения кода восстановления'
                    : 'Введите код из email и новый пароль'
                  }
                </p>
              </div>
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
                <Form className="flex flex-col gap-[22px] w-full">
                  {/* Поля ввода */}
                  <div className="flex flex-col gap-[20px] w-full">
                    {/* Email поле */}
                    <div className="flex flex-col gap-[6px] w-full">
                      <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                        <Mail className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                        Email
                      </label>
                      <div className="flex gap-[8px] w-full">
                        <Field
                          name="email"
                          type="email"
                          className="flex-1 min-w-0 h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] bg-white"
                          placeholder="example@gmail.com"
                          disabled={isLoading || isSubmitting}
                        />
                        
                        {/* Кнопка отправки/переотправки кода */}
                        <button
                          type="button"
                          onClick={() => sendCode(values.email)}
                          disabled={!values.email || timer > 0 || isResendingCode || isLoading}
                          className="h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 bg-gradient-to-br from-[#26B3AB] to-[#104D4A] text-[#F5F5F5] rounded-[25px] text-[12px] sm:text-[13px] font-medium leading-[1.19] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 flex-shrink-0"
                        >
                          {isResendingCode ? (
                            <RefreshCw className="w-[14px] h-[14px] animate-spin flex-shrink-0" />
                          ) : (
                            <RefreshCw className="w-[14px] h-[14px] flex-shrink-0" />
                          )}
                          <span className="hidden sm:inline">{timer > 0 ? `${timer}с` : codeSent ? 'Повторно' : 'Отправить'}</span>
                          <span className="sm:hidden">{timer > 0 ? `${timer}с` : 'Код'}</span>
                        </button>
                      </div>
                      <ErrorMessage name="email" component="div" className="text-xs sm:text-sm text-red-500 mt-1" />
                    </div>

                    {/* Проверочный код */}
                    <div className="flex flex-col gap-[6px] w-full">
                      <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                        <Mail className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                        Проверочный код
                      </label>
                      <Field
                        name="unique_code"
                        type="text"
                        maxLength="6"
                        className="w-full h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] text-center tracking-widest bg-white"
                        placeholder="123456"
                        disabled={isLoading || isSubmitting}
                        onInput={(e) => {
                          // Разрешаем только цифры
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }}
                      />
                      <ErrorMessage name="unique_code" component="div" className="text-xs sm:text-sm text-red-500 mt-1" />
                    </div>

                    {/* Новый пароль */}
                    <div className="flex flex-col gap-[6px] w-full">
                      <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                        <Lock className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                        Новый пароль
                      </label>
                      <div className="relative">
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className="w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] bg-white"
                          placeholder="Введите новый пароль"
                          disabled={isLoading || isSubmitting}
                        />
                        <div className="absolute right-4 sm:right-5 top-0 bottom-0 flex items-center pointer-events-none">
                          <button 
                            type="button"
                            className="flex items-center justify-center text-[#BEBEBE] hover:text-[#5C5C5C] transition-colors disabled:opacity-50 cursor-pointer pointer-events-auto"
                            onClick={togglePasswordVisibility}
                            disabled={isLoading || isSubmitting}
                          >
                            {showPassword ? <EyeOffIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" /> : <EyeIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />}
                          </button>
                        </div>
                      </div>
                      <ErrorMessage name="password" component="div" className="text-xs sm:text-sm text-red-500 mt-1" />
                    </div>

                    {/* Подтверждение пароля */}
                    <div className="flex flex-col gap-[6px] w-full">
                      <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                        <Lock className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                        Подтверждение пароля
                      </label>
                      <div className="relative">
                        <Field
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] bg-white"
                          placeholder="Повторите пароль"
                          disabled={isLoading || isSubmitting}
                        />
                        <div className="absolute right-4 sm:right-5 top-0 bottom-0 flex items-center pointer-events-none">
                          <button 
                            type="button"
                            className="flex items-center justify-center text-[#BEBEBE] hover:text-[#5C5C5C] transition-colors disabled:opacity-50 cursor-pointer pointer-events-auto"
                            onClick={toggleConfirmPasswordVisibility}
                            disabled={isLoading || isSubmitting}
                          >
                            {showConfirmPassword ? <EyeOffIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" /> : <EyeIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />}
                          </button>
                        </div>
                      </div>
                      <ErrorMessage name="confirmPassword" component="div" className="text-xs sm:text-sm text-red-500 mt-1" />
                    </div>
                  </div>

                  {/* Кнопка восстановления пароля и ссылка на вход */}
                  <div className="flex flex-col items-center gap-[14px] w-full">
                    {/* Кнопка восстановления пароля */}
                    <button 
                      type="submit" 
                      disabled={isLoading || isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-br from-[#26B3AB] to-[#104D4A] rounded-[25px] text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-[1.4] text-[#F5F5F5] hover:opacity-90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isLoading || isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Восстановление...</span>
                        </div>
                      ) : (
                        <span>Восстановить пароль</span>
                      )}
                    </button>

                    {/* Ссылка назад на логин */}
                    <p className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-center text-[#363636]">
                      Вспомнили пароль?{" "}
                      <button 
                        type="button" 
                        className="text-[#363636] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </div>
  )
}

export default RestorePasswordForm 