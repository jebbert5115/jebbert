import { useState, useEffect } from 'react';

const USER_ID = '751276412308291634';
const LANYARD_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;

export interface SpotifyData {
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: {
    start: number;
    end: number;
  };
  track_id: string;
}

export interface LanyardData {
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  discord_user: {
    id: string;
    username: string;
    display_name: string;
    avatar: string;
    global_name: string;
  };
  listening_to_spotify: boolean;
  spotify: SpotifyData | null;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  activities: Array<{
    name: string;
    type: number;
    state?: string;
    details?: string;
    application_id?: string;
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    timestamps?: {
      start?: number;
      end?: number;
    };
    party?: {
      id?: string;
      size?: [number, number];
    };
  }>;
}

async function fetchPresence(): Promise<LanyardData | null> {
  try {
    const res = await fetch(LANYARD_URL);
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export function useLanyard() {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresence().then(d => {
      setData(d);
      setLoading(false);
    });

    const interval = setInterval(() => {
      fetchPresence().then(d => {
        if (d) setData(d);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const avatarUrl = data
    ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.gif`
    : '';

  const avatarFallback = data
    ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`
    : '';

  const customStatus = data?.activities?.find(a => a.type === 4)?.state ?? null;

  return { data, loading, avatarUrl, avatarFallback, customStatus };
}

export function getSpotifyProgress(timestamps: { start: number; end: number }): number {
  const now = Date.now();
  const duration = timestamps.end - timestamps.start;
  const elapsed = now - timestamps.start;
  return Math.min((elapsed / duration) * 100, 100);
}
