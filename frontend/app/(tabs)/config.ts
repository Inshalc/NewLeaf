// config.ts
import { Platform } from 'react-native';

const LAN_IP = '10.0.0.43';
const PORT = '3000';

export const API_URL =
  Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos'
    ? `http://localhost:${PORT}`
    : `http://${LAN_IP}:${PORT}`;
