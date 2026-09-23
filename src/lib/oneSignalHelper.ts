import { BroadcastNotification } from '../types';
import { getStoredOneSignalConfig } from '../config/onesignalConfig';
import { getSupabaseClient } from './supabase';

const BROADCAST_STORAGE_KEY = 'korwilcam_broadcast_history';

/**
 * Membaca riwayat broadcast dari database Supabase (fallback ke LocalStorage)
 */
export const fetchBroadcastHistory = async (): Promise<BroadcastNotification[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('broadcast_notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data)) {
        const mapped: BroadcastNotification[] = data.map((item: any) => ({
          id: item.id || String(Date.now()),
          title: item.title || '',
          message: item.message || '',
          targetUrl: item.target_url || item.targetUrl || '',
          sentAt: item.sent_at || item.sentAt || new Date().toISOString(),
          recipientsCount: item.recipients_count ?? item.recipientsCount ?? 0,
          oneSignalId: item.onesignal_id || item.oneSignalId || '',
          status: item.status || 'sent',
          errorMessage: item.error_message || item.errorMessage || '',
          createdBy: item.created_by || item.createdBy || 'Admin'
        }));

        // Sinkronkan ke local storage untuk cadangan offline
        if (typeof window !== 'undefined') {
          localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch (err) {
      console.warn('Gagal mengambil riwayat broadcast dari Supabase:', err);
    }
  }

  // Fallback LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(BROADCAST_STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }
    } catch (err) {
      console.warn('Gagal membaca riwayat broadcast dari LocalStorage:', err);
    }
  }

  return [];
};

/**
 * Menyimpan riwayat broadcast ke Supabase & LocalStorage
 */
export const saveBroadcastRecord = async (record: BroadcastNotification): Promise<void> => {
  // 1. Simpan ke LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(BROADCAST_STORAGE_KEY);
      const list: BroadcastNotification[] = local ? JSON.parse(local) : [];
      list.unshift(record);
      localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (err) {
      console.warn('Gagal menyimpan broadcast ke LocalStorage:', err);
    }
  }

  // 2. Simpan ke Supabase jika tersedia
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('broadcast_notifications').insert({
        id: record.id,
        title: record.title,
        message: record.message,
        target_url: record.targetUrl || '',
        sent_at: record.sentAt,
        recipients_count: record.recipientsCount || 0,
        onesignal_id: record.oneSignalId || '',
        status: record.status,
        error_message: record.errorMessage || '',
        created_by: record.createdBy || 'Admin'
      });
    } catch (err) {
      console.warn('Gagal menyimpan record broadcast ke Supabase:', err);
    }
  }
};

/**
 * Menghapus riwayat broadcast
 */
export const deleteBroadcastRecord = async (id: string): Promise<boolean> => {
  // 1. LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(BROADCAST_STORAGE_KEY);
      if (local) {
        const list: BroadcastNotification[] = JSON.parse(local);
        const filtered = list.filter((item) => item.id !== id);
        localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (err) {
      console.warn('Gagal menghapus broadcast di LocalStorage:', err);
    }
  }

  // 2. Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('broadcast_notifications').delete().eq('id', id);
    } catch (err) {
      console.warn('Gagal menghapus broadcast di Supabase:', err);
    }
  }
  return true;
};

export interface SendBroadcastParams {
  title: string;
  message: string;
  targetUrl?: string;
  createdBy?: string;
}

export interface SendBroadcastResult {
  success: boolean;
  message: string;
  oneSignalId?: string;
  recipientsCount?: number;
  record?: BroadcastNotification;
}

/**
 * Mengirim Push Notification ke semua perangkat pengguna via OneSignal REST API
 */
export const sendPushBroadcast = async (
  params: SendBroadcastParams
): Promise<SendBroadcastResult> => {
  const config = getStoredOneSignalConfig();

  if (!config.isEnabled) {
    return {
      success: false,
      message: 'Layanan Push Notification OneSignal sedang dinonaktifkan dalam pengaturan.'
    };
  }

  if (!config.appId || !config.apiKey) {
    return {
      success: false,
      message: 'App ID atau REST API Key OneSignal belum dikonfigurasi.'
    };
  }

  const cleanTitle = (params.title || '').trim();
  const cleanMessage = (params.message || '').trim();
  let cleanUrl = (params.targetUrl || '').trim();

  if (!cleanTitle || !cleanMessage) {
    return {
      success: false,
      message: 'Judul dan isi pesan notifikasi wajib diisi!'
    };
  }

  if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const payload: any = {
    app_id: config.appId,
    included_segments: ['Total Subscriptions'],
    headings: {
      en: cleanTitle,
      id: cleanTitle
    },
    contents: {
      en: cleanMessage,
      id: cleanMessage
    },
    url: cleanUrl || 'https://korwilcampurwodadi.web.id',
    chrome_web_icon: 'https://korwilcampurwodadi.web.id/logo.png',
    firefox_icon: 'https://korwilcampurwodadi.web.id/logo.png'
  };

  try {
    const res = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Key ${config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = (data?.errors && Array.isArray(data.errors) ? data.errors.join(', ') : data?.errors) || res.statusText || 'Gagal mengirim push notification ke OneSignal.';
      
      const failedRecord: BroadcastNotification = {
        id: `bc_${Date.now()}`,
        title: cleanTitle,
        message: cleanMessage,
        targetUrl: cleanUrl,
        sentAt: new Date().toISOString(),
        recipientsCount: 0,
        status: 'failed',
        errorMessage: String(errMsg),
        createdBy: params.createdBy || 'Admin'
      };
      await saveBroadcastRecord(failedRecord);

      return {
        success: false,
        message: `Gagal: ${errMsg}`,
        record: failedRecord
      };
    }

    // Jika OneSignal mengembalikan respons berhasil
    // Note: jika belum ada subscriber, OneSignal mengembalikan: { id: "", errors: ["All included players are not subscribed"] }
    const hasNoSubscribersWarning = Array.isArray(data?.errors) && data.errors.some((e: string) => e.toLowerCase().includes('not subscribed'));
    const recipients = data?.recipients || (hasNoSubscribersWarning ? 0 : 1);
    const oneSignalId = data?.id || `os_${Date.now()}`;

    const successRecord: BroadcastNotification = {
      id: `bc_${Date.now()}`,
      title: cleanTitle,
      message: cleanMessage,
      targetUrl: cleanUrl,
      sentAt: new Date().toISOString(),
      recipientsCount: recipients,
      oneSignalId,
      status: 'sent',
      errorMessage: hasNoSubscribersWarning ? 'Sinyal terkirim ke OneSignal. Belum ada perangkat pengunjung yang mengklik "Izinkan" notifikasi.' : undefined,
      createdBy: params.createdBy || 'Admin'
    };

    await saveBroadcastRecord(successRecord);

    if (hasNoSubscribersWarning) {
      return {
        success: true,
        message: 'Broadcast berhasil dikirim ke server OneSignal! Namun saat ini belum ada perangkat pengunjung yang mengaktifkan izin notifikasi.',
        oneSignalId,
        recipientsCount: 0,
        record: successRecord
      };
    }

    return {
      success: true,
      message: `Broadcast berhasil dikirim ke perangkat pelanggan! (ID: ${oneSignalId.slice(0, 8)}...)`,
      oneSignalId,
      recipientsCount: recipients,
      record: successRecord
    };
  } catch (err: any) {
    const errorString = err?.message || 'Terjadi kesalahan koneksi saat mengirim broadcast.';
    const failedRecord: BroadcastNotification = {
      id: `bc_${Date.now()}`,
      title: cleanTitle,
      message: cleanMessage,
      targetUrl: cleanUrl,
      sentAt: new Date().toISOString(),
      recipientsCount: 0,
      status: 'failed',
      errorMessage: errorString,
      createdBy: params.createdBy || 'Admin'
    };
    await saveBroadcastRecord(failedRecord);

    return {
      success: false,
      message: `Terjadi kendala jaringan: ${errorString}`,
      record: failedRecord
    };
  }
};
