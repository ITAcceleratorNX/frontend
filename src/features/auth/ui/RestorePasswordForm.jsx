import React, { useState, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { showSuccessToast, showErrorToast } from '../../../shared/lib/toast'
import { EyeIcon, EyeOffIcon, Phone, Lock, RefreshCw } from 'lucide-react'
import { authApi } from '../../../shared/api/auth'
import '../styles/auth-forms.css'
import loginLogo from '../../../assets/login-logo-66f0b4.png'

// Схема валидации с Yup
const validationSchema = Yup.object({
  login: Yup.string()
    .required('Телефон или email обязателен')
    .test('is-valid-login', 'Введите корректный телефон или email', (value) => {
      if (!value) return false

      const trimmed = value.trim()

      // Проверка email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(trimmed)) {
        return true
      }

      // Проверка телефона (формат +7 ...)
      const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/
      return phoneRegex.test(trimmed)
    }),
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

  // Определение типа ввода (email или телефон)
  const detectInputType = (input) => {
    if (!input || typeof input !== 'string') {
      return null
    }

    const trimmed = input.trim()

    if (trimmed.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(trimmed) ? 'email' : null
    }

    const cleaned = trimmed.replace(/[\s\-\(\)]/g, '')
    const phoneRegex = /^\+?[0-9]{10,15}$/
    return phoneRegex.test(cleaned) ? 'phone' : null
  }

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

  // Функция форматирования номера телефона
  const formatPhoneNumber = (value) => {
    // Если значение пустое, возвращаем пустую строку
    if (!value || value.trim() === '') {
      return '';
    }
    
    // Удаляем все символы кроме цифр
    const numbers = value.replace(/\D/g, '');
    
    // Если нет цифр, возвращаем пустую строку
    if (numbers.length === 0) {
      return '';
    }
    
    // Если начинается с 8, заменяем на 7
    let cleaned = numbers;
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    }
    
    // Если не начинается с 7, добавляем 7
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    
    // Ограничиваем до 11 цифр (7 + 10 цифр)
    cleaned = cleaned.slice(0, 11);
    
    // Форматируем в формат +7 (XXX) XXX-XX-XX
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = '+7';
      if (cleaned.length > 1) {
        formatted += ' (' + cleaned.slice(1, 4);
      }
      if (cleaned.length > 4) {
        formatted += ') ' + cleaned.slice(4, 7);
      }
      if (cleaned.length > 7) {
        formatted += '-' + cleaned.slice(7, 9);
      }
      if (cleaned.length > 9) {
        formatted += '-' + cleaned.slice(9, 11);
      }
    }
    
    return formatted;
  };

  // Отправка кода на телефон или email
  const sendCode = async (login) => {
    if (!login) {
      showErrorToast('Введите телефон или email для отправки кода')
      return false
    }

    const inputType = detectInputType(login)

    if (!inputType) {
      showErrorToast('Введите корректный телефон или email')
      return false
    }

    setIsResendingCode(true)
    try {
      let response

      if (inputType === 'email') {
        response = await authApi.checkEmailForRestore(login.trim())
      } else {
        // phone
        response = await authApi.checkPhoneForRestore(login)
      }
      
      if (response.user_exists) {
        setCodeSent(true)
        if (response.remainingSeconds) {
          setTimer(response.remainingSeconds)
        } else {
          setTimer(60) // 60 секунд до повторной отправки
        }
        showSuccessToast(inputType === 'email'
          ? 'Код отправлен. Проверьте email'
          : 'Код отправлен. Проверьте SMS')
        return true
      } else {
        showErrorToast(inputType === 'email'
          ? 'Пользователь с таким email не найден'
          : 'Пользователь с таким телефоном не найден')
        return false
      }
    } catch (error) {
      console.error('Ошибка при отправке кода:', error)
      
      if (error.response?.status === 429) {
        const remainingSeconds = error.response?.data?.remainingSeconds || 60
        setTimer(remainingSeconds)
        showErrorToast(error.response?.data?.error || 'Подождите перед повторной отправкой')
      } else if (error.response?.data?.message) {
        showErrorToast(error.response.data.message)
      } else {
        showErrorToast('Произошла ошибка при отправке кода')
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
      await authApi.restorePassword(values.login, values.unique_code, values.password)
      
      showSuccessToast('Пароль успешно восстановлен!')
      
      // Перенаправляем на страницу логина через 2 секунды
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            login: values.login,
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
            } else if (field === 'phone') {
              setFieldError('phone', errorMessage[field])
            } else if (field === 'password') {
              setFieldError('password', errorMessage[field])
            }
          })
          
          const messages = Object.values(errorMessage).join(', ')
          showErrorToast(messages)
        } else {
          showErrorToast(errorMessage)
        }
      } else {
        showErrorToast('Произошла ошибка при восстановлении пароля')
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
                    ? 'Введите телефон или email для получения кода восстановления'
                    : 'Введите код и новый пароль'
                  }
                </p>
              </div>
            </div>
            
            {/* Форма восстановления */}
            <Formik
              initialValues={{
                login: '',
                unique_code: '',
                password: '',
                confirmPassword: ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, isSubmitting, setFieldValue }) => {
                const handleLoginChange = (e) => {
                  const value = e.target.value
                  const inputType = detectInputType(value)

                  if (inputType === 'phone') {
                    const formatted = formatPhoneNumber(value)
                    setFieldValue('login', formatted)
                  } else {
                    setFieldValue('login', value)
                  }
                };

                return (
                  <Form className="flex flex-col gap-[22px] w-full">
                    {/* Поля ввода */}
                    <div className="flex flex-col gap-[20px] w-full">
                      {/* Поле для телефона или email */}
                      <div className="flex flex-col gap-[6px] w-full">
                        <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                          <Phone className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                          Телефон или email
                        </label>
                        <div className="flex gap-[8px] w-full">
                          <Field
                            name="login"
                            type="text"
                            className="flex-1 min-w-0 h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] outline-none bg-white"
                            placeholder="Телефон или email"
                            disabled={isLoading || isSubmitting}
                            onChange={handleLoginChange}
                          />
                          
                          {/* Кнопка отправки/переотправки кода */}
                          <button
                            type="button"
                            onClick={() => sendCode(values.login)}
                            disabled={!values.login || timer > 0 || isResendingCode || isLoading}
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
                        <ErrorMessage name="login" component="div" className="text-xs sm:text-sm text-red-500 mt-1" />
                      </div>

                      {/* Проверочный код */}
                      <div className="flex flex-col gap-[6px] w-full">
                        <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                          <Phone className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                          Проверочный код
                        </label>
                        <Field
                          name="unique_code"
                          type="text"
                          maxLength="6"
                          className="w-full h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] outline-none text-center tracking-widest bg-white"
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
                          className="w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] outline-none bg-white"
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
                          className="w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] outline-none bg-white"
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
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestorePasswordForm 