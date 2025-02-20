
import bigInt from 'big-integer';
import CryptoJS from 'crypto-js';

export class ZKPAuth {
  private p = bigInt("FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF", 16);
  private g = bigInt(2);

  async generateProof(password: string): Promise<{ commitment: string, challenge: string, response: string }> {
    const x = bigInt(CryptoJS.SHA256(password).toString(), 16);
    const r = bigInt.randBetween(1, this.p.minus(1));
    const commitment = this.g.modPow(r, this.p).toString(16);
    const challenge = CryptoJS.SHA256(commitment).toString();
    const response = r.add(x.multiply(bigInt(challenge, 16))).mod(this.p.minus(1)).toString(16);
    
    return { commitment, challenge, response };
  }

  async verifyProof(proof: { commitment: string, challenge: string, response: string }, y: string): Promise<boolean> {
    const response = bigInt(proof.response, 16);
    const commitment = bigInt(proof.commitment, 16);
    const challenge = bigInt(proof.challenge, 16);
    const yPowC = bigInt(y, 16).modPow(challenge, this.p);
    const gPowR = this.g.modPow(response, this.p);
    
    return commitment.equals(gPowR.multiply(yPowC).mod(this.p));
  }
}
