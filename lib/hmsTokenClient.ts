// HMS Token Client - Edge function client for token generation
// This uses the edge function for secure token generation

/**
 * Get HMS auth token via edge function (recommended)
 * This is the secure way to generate tokens without exposing app secret
 */
export async function getHMSAuthTokenViaEdge(
  roomCode: string,
  role: string,
  userId: string
): Promise<string> {
  try {
    const response = await fetch('/api/hms/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode,
        role: role,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to generate token: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('No token received from edge function');
    }

    console.log('Successfully generated token via edge function');
    return data.token;
  } catch (error) {
    console.error('Error generating token via edge function:', error);
    throw error;
  }
}

/**
 * Create HMS room via edge function
 */
export async function createHMSRoomViaEdge(roomName?: string): Promise<string> {
  try {
    const response = await fetch('/api/hms/create-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_name: roomName || `live-stream-${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create room: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.room_id) {
      throw new Error('No room_id received from edge function');
    }

    console.log('Successfully created room via edge function:', data.room_id);
    return data.room_id;
  } catch (error) {
    console.error('Error creating room via edge function:', error);
    throw error;
  }
}

