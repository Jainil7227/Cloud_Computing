/**
 * Split an input buffer into fixed-size chunks
 * @param {Buffer} buffer - The full file buffer
 * @param {number} chunkSize - Chunk size in bytes (e.g. 1MB)
 * @returns {Array<{ index: number, buffer: Buffer, size: number }>}
 */
export function splitBufferIntoChunks(buffer, chunkSize = 1048576) {
  const chunks = [];
  const totalLength = buffer.length;
  let offset = 0;
  let index = 0;

  while (offset < totalLength) {
    const end = Math.min(offset + chunkSize, totalLength);
    const chunkBuffer = buffer.subarray(offset, end);

    chunks.push({
      index,
      buffer: chunkBuffer,
      size: chunkBuffer.length,
      startByte: offset,
      endByte: end - 1
    });

    offset = end;
    index++;
  }

  return chunks;
}

/**
 * Reassemble an array of chunk buffers in order into a single unified Buffer
 * @param {Array<Buffer>} buffers - Array of chunk buffers sorted by index
 * @returns {Buffer}
 */
export function reassembleChunks(buffers) {
  return Buffer.concat(buffers);
}
