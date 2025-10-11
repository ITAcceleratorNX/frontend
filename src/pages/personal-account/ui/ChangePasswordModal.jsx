import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { EyeIcon, EyeOffIcon, Lock, Key, RefreshCw, X } from 'lucide-react';
import { authApi } from '../../../shared/api/auth';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

// Схема валидации с Yup
const validationSchema = Yup.object({
  unique_code: Yup.string()
    .matches(/^\d{6}$/, 'Код должен содержать ровно 6 цифр')
    .required('Уникальный код обязателен'),
  password: Yup.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Новый пароль обязателен'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно')
});

const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isResendingCode, setIsResendingCode] = useState(false);

  // Таймер для повторной отправки кода
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

                // Отправка кода на email
              const sendCode = async () => {
                if (!userEmail) {
                  toast.error('Email пользователя не найден');
                  return false;
                }

                setIsResendingCode(true);
                try {
                  const response = await authApi.sendChangePasswordCode(userEmail);
                  console.log('Response from sendChangePasswordCode:', response); // Отладочная информация

                  if (response.user_exists) {
                    setCodeSent(true);
                    setTimer(60); // 60 секунд до повторной отправки
                    toast.success('Код отправлен. Проверьте почту');
                    return true;
                  } else {
                    toast.error('Пользователь с таким email не найден');
                    return false;
                  }
                } catch (error) {
                  console.error('Ошибка при отправке кода:', error);

                  if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('Произошла ошибка при отправке кода');
                  }
                  return false;
                } finally {
                  setIsResendingCode(false);
                }
              };

  // Отправка формы изменения пароля
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    console.log('Form values:', values); // Отладочная информация
    setIsLoading(true);
    try {
      await authApi.changePassword(userEmail, values.unique_code, values.password);
      
      toast.success('Пароль успешно изменен!');
      
      // Закрываем модалку через 2 секунды
      setTimeout(() => {
        onClose();
        // Сбрасываем состояние
        setCodeSent(false);
        setTimer(0);
      }, 2000);
      
                    } catch (error) {
                  console.error('Ошибка при изменении пароля:', error);

                  if (error.response?.data?.message) {
                    const errorMessage = error.response.data.message;
                    
                                         if (typeof errorMessage === 'object') {
                       // Обрабатываем объект с ошибками валидации
                       Object.keys(errorMessage).forEach(field => {
                         if (field === 'unique_code') {
                           setFieldError('unique_code', errorMessage[field]);
                         } else if (field === 'password') {
                           setFieldError('password', errorMessage[field]);
                         }
                       });
                       
                       const messages = Object.values(errorMessage).join(', ');
                       toast.error(messages);
                     } else {
                       toast.error(errorMessage);
                     }
                  } else {
                    toast.error('Произошла ошибка при изменении пароля');
                  }
                } finally {
                  setIsLoading(false);
                  setSubmitting(false);
                }
  };

  // Обработчик закрытия модалки
  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Сбрасываем состояние
      setCodeSent(false);
      setTimer(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Изменить пароль
          </DialogTitle>
          <DialogDescription>
            Введите код, отправленный на ваш email, и новый пароль
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            unique_code: '',
            password: '',
            confirm_password: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-4">
              {/* Email пользователя (только для отображения) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-gray-50 flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Кнопка отправки кода */}
              {!codeSent ? (
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={sendCode}
                    disabled={isResendingCode}
                    className="w-full"
                    variant="outline"
                  >
                    {isResendingCode ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Отправить код
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Код подтверждения */}
                  <div className="space-y-2">
                    <Label htmlFor="unique_code">Код подтверждения (6 цифр)</Label>
                    <Field
                      id="unique_code"
                      name="unique_code"
                      type="text"
                      maxLength="6"
                      placeholder="123456"
                      className="text-center text-lg tracking-widest flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onInput={(e) => {
                        // Разрешаем только цифры
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                      }}
                    />
                    <ErrorMessage name="unique_code" component="div" className="text-red-500 text-sm" />
                  </div>

                  {/* Новый пароль */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Новый пароль</Label>
                    <div className="relative">
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Введите новый пароль"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                  </div>

                  {/* Подтверждение пароля */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Подтвердите пароль</Label>
                    <div className="relative">
                      <Field
                        id="confirm_password"
                        name="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Повторите новый пароль"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="confirm_password" component="div" className="text-red-500 text-sm" />
                  </div>

                  {/* Повторная отправка кода */}
                  <div className="text-center">
                    <Button
                      type="button"
                      onClick={sendCode}
                      disabled={timer > 0 || isResendingCode}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {timer > 0 ? (
                        `Отправить код повторно через ${timer}с`
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Отправить код повторно
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                {codeSent && (
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Изменение...' : 'Изменить пароль'}
                  </Button>
                )}
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
