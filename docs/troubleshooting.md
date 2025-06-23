# Устранение неполадок

## React-Konva совместимость

### Проблема
```
Uncaught Error: react-konva version 19 is only compatible with React 19. 
Make sure to have the last version of react-konva and react or downgrade react-konva to version 18.
```

### Причина
React-konva версии 19 совместима только с React 19, а в проекте используется React 18.

### Решение
1. Понизьте версию react-konva до версии 18:
```bash
npm install react-konva@18
```

2. Убедитесь, что konva также совместимой версии:
```bash
npm install konva@9
```

3. Проверьте установленные версии:
```bash
npm list react-konva konva
```

4. Перезапустите проект:
```bash
npm run dev
```

### Совместимость версий
- **React 18** → react-konva@18.x.x + konva@9.x.x
- **React 19** → react-konva@19.x.x + konva@10.x.x

### Проверка успешной установки
После установки правильных версий, интерактивная схема склада должна отображаться без ошибок на странице `/warehouse-order` при выборе склада "EXTRA SPACE Мега". 