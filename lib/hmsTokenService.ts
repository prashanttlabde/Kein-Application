// Browser-compatible 100ms JWT token service for Next.js
interface TokenPayload {
  access_key: string;
  room_id: string;
  user_id: string;
  role: string;
  type: 'app';
  version: number;
  iat: number;
  exp: number;
  jti: string; // JWT ID - required by 100ms
}

interface JWTHeader {
  alg: string;
  typ: string;
}

// Base64 URL encoding utilities
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export class HMSTokenService {
  private static APP_ACCESS_KEY = process.env.NEXT_PUBLIC_HMS_APP_ACCESS_KEY || '';
  private static APP_SECRET = process.env.NEXT_PUBLIC_HMS_APP_SECRET || '';

  /**
   * Generate HMAC-SHA256 signature using Web Crypto API
   */
  private static async hmacSHA256(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(message)
    );
    
    return arrayBufferToBase64Url(signature);
  }

  /**
   * Generate a proper JWT token for 100ms authentication
   */
  static async generateToken(roomId: string, userId: string, role: string = 'host'): Promise<string> {
    const header: JWTHeader = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      access_key: this.APP_ACCESS_KEY,
      room_id: roomId,
      user_id: userId,
      role: role,
      type: 'app',
      version: 2,
      iat: now,
      exp: now + (24 * 60 * 60), // 24 hours
      jti: `${userId}-${roomId}-${now}-${Math.random().toString(36).substring(2)}` // Unique JWT ID
    };

    try {
      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;
      
      const signature = await this.hmacSHA256(unsignedToken, this.APP_SECRET);
      const token = `${unsignedToken}.${signature}`;
      
      console.log('Generated JWT token payload:', payload);
      console.log('Generated JWT token for room:', roomId);
      
      // Validate token structure
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token structure');
      }
      
      return token;
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Generate authentication token for room access (async wrapper)
   */
  static async generateAuthToken(roomId: string, userId: string, role: string = 'host'): Promise<string> {
    return this.generateToken(roomId, userId, role);
  }

  /**
   * Create a simple room code for development
   */
  static createRoomCode(customSuffix?: string): string {
    const suffix = customSuffix || Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now().toString(36);
    return `${this.APP_ACCESS_KEY}-${timestamp}-${suffix}`;
  }

  /**
   * Validate if a room code follows the expected format
   */
  static isValidRoomCode(roomCode: string): boolean {
    if (!roomCode || typeof roomCode !== 'string') {
      return false;
    }
    // Check if it starts with the access key or looks like a valid room code
    return roomCode.includes(this.APP_ACCESS_KEY) || roomCode.length > 10;
  }

  /**
   * Get management token from environment
   */
  static getManagementToken(): string {
    return process.env.NEXT_PUBLIC_HMS_MANAGEMENT_TOKEN || '';
  }

  /**
   * Create a room using the 100ms API and return the room code
   */
  static async createRoom(roomName?: string): Promise<string> {
    const managementToken = this.getManagementToken();
    const roomNameForAPI = roomName || `live-stream-${Date.now()}`;
    
    try {
      const response = await fetch('https://api.100ms.live/v2/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomNameForAPI,
          description: 'Live streaming room created via Kein Live',
          template_id: this.APP_ACCESS_KEY,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create room:', errorData);
        throw new Error(`Failed to create room: ${response.status}`);
      }

      const roomData = await response.json();
      console.log('Created room:', roomData);
      
      return roomData.id || roomData.room_id || roomNameForAPI;
    } catch (error) {
      console.error('Error creating room:', error);
      // Fallback to generating a room code
      return this.createRoomCode(roomName);
    }
  }
}

export default HMSTokenService;

