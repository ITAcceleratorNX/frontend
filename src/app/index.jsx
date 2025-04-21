import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Routing from './routing';
import './styles/global.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Создаем клиент для React Query с настройками по умолчанию
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Отключаем автоматическое обновление при фокусе окна
      retry: false, // Отключаем автоматические повторные запросы при ошибке
      staleTime: 5 * 60 * 1000, // Данные считаются свежими в течение 5 минут
    },
  },
});

// Основной компонент приложения
export const App = () => {
  console.log('Рендеринг корневого компонента App');
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routing />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App; 