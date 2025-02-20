
import { SignalProtocolStore, SignalProtocolAddress, SessionBuilder, SessionCipher } from '@privacyresearch/libsignal-protocol-typescript';

export class SignalChat {
  private store: SignalProtocolStore;
  private sessionCipher: SessionCipher | null = null;
  private address: SignalProtocolAddress;

  constructor(userId: string) {
    this.store = new SignalProtocolStore();
    this.address = new SignalProtocolAddress(userId, 1);
  }

  async initSession(preKey: any) {
    const sessionBuilder = new SessionBuilder(this.store, this.address);
    await sessionBuilder.processPreKey(preKey);
    this.sessionCipher = new SessionCipher(this.store, this.address);
  }

  async encrypt(message: string): Promise<string> {
    if (!this.sessionCipher) throw new Error('Session not initialized');
    const ciphertext = await this.sessionCipher.encrypt(Buffer.from(message));
    return Buffer.from(ciphertext.body).toString('base64');
  }

  async decrypt(message: string): Promise<string> {
    if (!this.sessionCipher) throw new Error('Session not initialized');
    const plaintext = await this.sessionCipher.decrypt(Buffer.from(message, 'base64'));
    return Buffer.from(plaintext).toString('utf8');
  }
}
