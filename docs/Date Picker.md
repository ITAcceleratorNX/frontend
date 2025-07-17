Сіз React жобасына MUI X Date Picker компонентін орнату үшін мына қадамдарды орындаңыз:

## 1-қадам: Қажетті пакеттерді орнатыңыз

npm install @mui/x-date-pickers @mui/material @emotion/react @emotion/styled dayjs
немесе yarn пайдаланып:


yarn add @mui/x-date-pickers @mui/material @emotion/react @emotion/stypackage.json:
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/material": "^7.2.0",
    "@mui/x-date-pickers": "^8.8.0",
    "dayjs": "^1.11.13",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  --
  пример код!

  import React from 'react';
import BasicDatePicker from './BasicDatePicker';
import { Calendar } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Календарь на русском языке
          </h1>
        </div>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Особенности русской локализации:</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Формат даты: ДД.ММ.ГГГГ</li>
            <li>• Неделя начинается с понедельника</li>
            <li>• Русские названия месяцев и дней недели</li>
            <li>• 24-часовой формат времени</li>
          </ul>
        </div>
        <BasicDatePicker />
      </div>
    </div>
  );
}

export default App;

import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import updateLocale from 'dayjs/plugin/updateLocale';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Configure dayjs for Russian locale
dayjs.extend(updateLocale);
dayjs.extend(localizedFormat);
dayjs.locale('ru');

// Customize Russian locale settings
dayjs.updateLocale('ru', {
  weekStart: 1, // Monday as first day of week (Russian standard)
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD.MM.YYYY',
    LL: 'D MMMM YYYY г.',
    LLL: 'D MMMM YYYY г., HH:mm',
    LLLL: 'dddd, D MMMM YYYY г., HH:mm'
  }
});

export default function BasicDatePicker() {
  const [selectedDate, setSelectedDate] = React.useState(dayjs());

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDayjs} 
      adapterLocale="ru"
      localeText={{
        // Russian translations for picker interface
        cancelButtonLabel: 'Отмена',
        clearButtonLabel: 'Очистить',
        okButtonLabel: 'ОК',
        todayButtonLabel: 'Сегодня',
        datePickerToolbarTitle: 'Выберите дату',
        timePickerToolbarTitle: 'Выберите время',
        dateTimePickerToolbarTitle: 'Выберите дату и время',
        pickersCalendarHeaderSwitchViewIcon: 'Изменить вид',
        pickersCalendarHeaderPreviousMonth: 'Предыдущий месяц',
        pickersCalendarHeaderNextMonth: 'Следующий месяц',
      }}
    >
      <DemoContainer components={['DatePicker']}>
        <DatePicker 
          label="Выберите дату"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          format="DD.MM.YYYY"
          slotProps={{
            textField: {
              helperText: selectedDate ? `Выбранная дата: ${selectedDate.format('DD.MM.YYYY')}` : '',
            },
          }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}