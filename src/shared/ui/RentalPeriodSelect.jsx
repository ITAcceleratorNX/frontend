import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../../components/ui';
import { getMonthLabel } from '../lib/utils/monthLabel';
import { cn } from '../lib/utils/cn';

/**
 * Переиспользуемый компонент для выбора срока аренды (в месяцах)
 * 
 * @param {Object} props
 * @param {string} props.value - Текущее значение (количество месяцев как строка)
 * @param {Function} props.onChange - Callback при изменении значения (принимает строку)
 * @param {string} [props.placeholder] - Placeholder для селекта
 * @param {string} [props.label] - Лейбл (отображается отдельно, если передан)
 * @param {string} [props.variant='default'] - Вариант стиля: 'default', 'cloud', 'individual-home', 'modal'
 * @param {string} [props.className] - Дополнительные CSS классы для контейнера
 * @param {string} [props.triggerClassName] - Дополнительные CSS классы для SelectTrigger
 * @param {number} [props.maxMonths=12] - Максимальное количество месяцев для выбора
 * @param {boolean} [props.showLabelInside=false] - Показывать ли лейбл внутри SelectTrigger (для cloud варианта)
 */
export const RentalPeriodSelect = ({
  value,
  onChange,
  placeholder = 'Выберите срок аренды',
  label,
  variant = 'default',
  className,
  triggerClassName,
  maxMonths = 12,
  showLabelInside = false,
  ...props
}) => {
  // Стили для разных вариантов
  const variantStyles = {
    'individual-home': {
      trigger: 'w-full h-12 text-base bg-gray-100 border-gray-200 rounded-3xl text-[#273655]',
      container: '',
    },
    'cloud-home': {
      trigger: 'w-full h-auto min-h-[60px] text-base border-gray-300 rounded-3xl bg-transparent flex flex-col items-start justify-center p-3 relative [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-3 [&>svg]:h-4 [&>svg]:w-4',
      container: '',
    },
    'warehouse-data': {
      trigger: 'h-12 rounded-2xl border-[#273655]/20 text-[#273655]',
      container: '',
    },
    'modal': {
      trigger: 'w-full h-12 text-base rounded-3xl border-[#d7dbe6] bg-gray-50 focus:border-[#00A991] focus:ring-2 focus:ring-[#00A991]/20',
      container: '',
    },
    'default': {
      trigger: 'w-full h-12 rounded-lg border border-gray-300',
      container: '',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  const handleValueChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn(styles.container, className)}>
      {label && !showLabelInside && (
        <label className="block text-sm font-medium text-[#273655] mb-2">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={handleValueChange} {...props}>
        <SelectTrigger className={cn(styles.trigger, triggerClassName)}>
          {showLabelInside && label && (
            <span className="text-sm text-[#273655] mb-1">{label}</span>
          )}
          <SelectValue className={showLabelInside ? 'text-base' : ''} placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: maxMonths }, (_, i) => i + 1).map((month) => (
            <SelectItem key={month} value={String(month)}>
              {getMonthLabel(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RentalPeriodSelect;

