import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axios';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function getVapidPublicKey() {
    const res = await api.get('/push/vapid-public-key');
    return res.data.publicKey;
}

async function saveSubscription(subscription) {
    const { endpoint, keys } = subscription.toJSON();
    await api.post('/push/subscribe', { endpoint, keys });
}

async function registerPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.info('Web Push не поддерживается браузером');
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.info('Разрешение на уведомления не получено');
        return;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const publicKey = await getVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
        });
    }

    await saveSubscription(subscription);
    console.log('✅ Web Push подписка сохранена');
}

/**
 * Автоматически регистрирует Web Push подписку для менеджеров и админов.
 * Вызывается один раз после входа пользователя с нужной ролью.
 */
export function usePushNotifications() {
    const { user } = useAuth();
    const registered = useRef(false);

    useEffect(() => {
        const isStaff = user?.role === 'MANAGER' || user?.role === 'ADMIN';
        if (!isStaff || registered.current) return;

        registered.current = true;
        registerPush().catch((err) => {
            console.error('❌ Ошибка регистрации Web Push:', err);
            registered.current = false;
        });
    }, [user?.id, user?.role]);
}
