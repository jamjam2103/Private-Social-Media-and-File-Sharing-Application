import { useCallback } from 'react';

// Efficient conversion of ArrayBuffer to base64
function arrayBufferToBase64(buffer: Uint8Array): string {
  const chunks: string[] = [];
  const chunkSize = 0x8000; // Process 32KB chunks

  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
  }

  return btoa(chunks.join(''));
}

// Convert base64 to Uint8Array efficiently
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function useEncryption() {
  const encryptMessage = useCallback(async (message: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Generate a random key for each message
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    // Export key and combine with IV and encrypted data
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);

    // Combine IV, key, and encrypted data
    const combined = new Uint8Array(iv.length + exportedKey.byteLength + encrypted.byteLength);
    combined.set(new Uint8Array(iv), 0);
    combined.set(new Uint8Array(exportedKey), iv.length);
    combined.set(new Uint8Array(encrypted), iv.length + exportedKey.byteLength);

    // Convert to base64 efficiently
    return arrayBufferToBase64(combined);
  }, []);

  const decryptMessage = useCallback(async (encryptedMessage: string): Promise<string> => {
    try {
      // Convert base64 to Uint8Array efficiently
      const bytes = base64ToArrayBuffer(encryptedMessage);

      const iv = bytes.slice(0, 12);
      const keyData = bytes.slice(12, 44);
      const encrypted = bytes.slice(44);

      const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        'AES-GCM',
        true,
        ['decrypt']
      );

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[encrypted message]';
    }
  }, []);

  return { encryptMessage, decryptMessage };
}