import { create } from 'ipfs-http-client';
import { create as createIPFS } from 'ipfs-core';
import { FileShare } from '@shared/schema';
import { log } from './vite';

class IPFSService {
  private ipfs: any;
  private initialized: boolean = false;

  async initialize() {
    if (this.initialized) return;

    try {
      log('Initializing IPFS service...');
      // Create an embedded node instead of trying to connect to a local daemon
      this.ipfs = await createIPFS();
      this.initialized = true;
      log('IPFS node initialized successfully');
    } catch (error) {
      log('Failed to initialize IPFS node: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  async addFile(data: string): Promise<string> {
    try {
      await this.initialize();

      // Convert base64 to Buffer more efficiently using chunking
      const chunkSize = 1024 * 1024; // 1MB chunks
      const base64Chunks = data.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
      const buffers = base64Chunks.map(chunk => Buffer.from(chunk, 'base64'));
      const buffer = Buffer.concat(buffers);

      // Add file to IPFS with chunking enabled
      const result = await this.ipfs.add(buffer, {
        chunker: 'size-1048576', // 1MB chunks
        rawLeaves: true,
        pin: true
      });

      log('File added to IPFS with CID: ' + result.cid.toString());
      return result.cid.toString();
    } catch (error) {
      log('Failed to add file to IPFS: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  async getFile(cid: string): Promise<string> {
    try {
      await this.initialize();

      const chunks: Buffer[] = [];
      let totalSize = 0;

      // Stream file from IPFS in chunks
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
        totalSize += chunk.length;

        // Log progress for large files
        if (totalSize > 1024 * 1024) { // 1MB
          log(`Retrieved ${(totalSize / (1024 * 1024)).toFixed(2)}MB from IPFS`);
        }
      }

      // Convert Buffer to base64 efficiently
      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString('base64');

      log('File retrieved from IPFS successfully');
      return base64;
    } catch (error) {
      log('Failed to get file from IPFS: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }
}

export const ipfsService = new IPFSService();