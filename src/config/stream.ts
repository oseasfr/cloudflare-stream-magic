const DEFAULT_STREAM_URL = "https://tv.opendata.center/stream";

export const STREAM_URL = (import.meta.env.VITE_STREAM_URL || DEFAULT_STREAM_URL).trim();
