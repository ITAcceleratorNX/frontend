import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../shared/context/AuthContext';
import { usersApi } from '@/shared/api/usersApi.js';
import { FormSelect } from '@/shared/ui/FormSelect.jsx';

/* eslint-disable react/prop-types */
export default function ResponsibleManagerSelect({ value, onChange }) {
  const { user } = useAuth();

  const { data: managers = [], isLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: () => usersApi.getManagers(),
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => {
    const list = [...managers];
    if (user && !list.some((m) => m.id === user.id)) {
      list.push(user);
    }
    const managerOptions = list
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru'))
      .map((m) => ({
        value: String(m.id),
        label: m.name || `Менеджер #${m.id}`,
      }));
    return [{ value: '', label: 'Не выбран' }, ...managerOptions];
  }, [managers, user]);

  return (
    <FormSelect
      label="Ответственный менеджер"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Не выбран"
      disabled={isLoading}
      variant="account"
    />
  );
}
/* eslint-enable react/prop-types */
