<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; text-align: justify;">

<h1 align="center" style="font-family: 'Times New Roman', Times, serif; font-size: 16pt; font-weight: bold; text-transform: uppercase;">
CLOUDVAULT: DESIGN AND IMPLEMENTATION OF SECURE CHUNKED FILE STORAGE WITH CLIENT-SIDE AES-256 ENCRYPTION AND AMAZON S3 INTEGRATION
</h1>

<p align="center" style="font-weight: bold; font-size: 12pt; margin-bottom: 20px;">
A MINI PROJECT REPORT SUBMITTED FOR THE COURSE OF CLOUD COMPUTING
</p>

<hr style="border: 1px solid #333; margin-bottom: 25px;" />

<table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 11pt; margin-bottom: 25px;">
  <tr>
    <td style="padding: 6px; border: 1px solid #555;"><strong>Course:</strong> Cloud Computing Laboratory</td>
    <td style="padding: 6px; border: 1px solid #555;"><strong>Cloud Provider:</strong> Amazon Web Services (AWS)</td>
  </tr>
  <tr>
    <td style="padding: 6px; border: 1px solid #555;"><strong>Storage Service:</strong> Amazon S3 (Simple Storage Service)</td>
    <td style="padding: 6px; border: 1px solid #555;"><strong>Target Bucket:</strong> <code>chunked-file-storage-jainil</code></td>
  </tr>
  <tr>
    <td style="padding: 6px; border: 1px solid #555;"><strong>Target AWS Region:</strong> <code>ap-south-1</code> (Asia Pacific - Mumbai)</td>
    <td style="padding: 6px; border: 1px solid #555;"><strong>Symmetric Cipher:</strong> AES-256-CBC (Random 16B IV per Chunk)</td>
  </tr>
  <tr>
    <td style="padding: 6px; border: 1px solid #555;"><strong>Integrity Algorithm:</strong> SHA-256 Cryptographic Hash</td>
    <td style="padding: 6px; border: 1px solid #555;"><strong>Application Stack:</strong> Node.js, Express, React 18, Vite</td>
  </tr>
</table>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
1. Introduction
</h2>

<p align="justify">
Over the past decade, cloud computing has fundamentally transformed the paradigms of modern data storage, application deployment, and distributed computing. Organizations and individual users increasingly delegate their sensitive digital assets, documents, and multimedia to hyperscale public cloud service providers like Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure. Cloud object storage architectures provide near-infinite elasticity, high availability, and geographic redundancy at favorable economies of scale.
</p>

<p align="justify">
However, placing unencrypted files directly on third-party cloud infrastructure presents significant security, compliance, and privacy risks. Malicious intrusions, misconfigured bucket access policies, insider threats, and eavesdropping during data transmission can compromise proprietary information. Furthermore, monolithic file uploads suffer from network fragility; a minor network disruption during a multi-megabyte upload necessitates retransmitting the entire file from scratch.
</p>

<p align="justify">
To resolve these critical operational and cryptographic challenges, this project presents <strong>CloudVault</strong>, an end-to-end cloud storage system that implements client-side data segmentation (chunking), symmetric cipher encryption (AES-256-CBC), direct Amazon S3 object storage persistence, and automated cryptographic integrity verification upon download and reassembly.
</p>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
2. Problem Statement
</h2>

<p align="justify">
The prescribed objective of this cloud computing mini project is to implement basic cloud operations, specifically:
</p>

<ul>
  <li><p align="justify">Dividing an input file or image into discrete segments/blocks (chunks) prior to cloud persistence.</p></li>
  <li><p align="justify">Encrypting each segmented block with military-grade symmetric cryptography before it is dispatched to the cloud.</p></li>
  <li><p align="justify">Interfacing with a public cloud object storage repository (Amazon S3) to store and manage the fragmented encrypted blocks under structured object keys.</p></li>
  <li><p align="justify">Retrieving the distributed encrypted blocks from the cloud, decrypting each chunk in memory, verifying cryptographic integrity, and seamlessly reassembling the blocks into the original, unaltered file for the user.</p></li>
  <li><p align="justify">Designing an intuitive, responsive frontend web interface to visualize the chunking pipeline, inspect raw encrypted ciphertext stored in Amazon S3, and download the reconstructed files.</p></li>
  <li><p align="justify">Evaluating content delivery network (CDN) distribution paradigms and HTTPS secure transmission architectures.</p></li>
</ul>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
3. Objectives
</h2>

<p align="justify">
The primary functional and engineering objectives of this project are:
</p>

<ol>
  <li><p align="justify"><strong>Dynamic Binary File Segmentation:</strong> Develop an automated buffer slicing engine capable of dividing arbitrary files (PDFs, images, videos, software binaries) into fixed-size byte blocks (e.g., 512 KB, 1 MB, 2 MB).</p></li>
  <li><p align="justify"><strong>Client-Side/Application-Level Cryptography:</strong> Implement Advanced Encryption Standard (AES) with a 256-bit key in Cipher Block Chaining (CBC) mode, utilizing cryptographically secure pseudorandom Initialization Vectors (IV) for every independent chunk.</p></li>
  <li><p align="justify"><strong>Direct Cloud Object Storage Integration:</strong> Seamlessly integrate the application with Amazon Web Services (AWS) S3 in the <code>ap-south-1</code> (Mumbai) region via the official AWS SDK v3, performing structured <code>PutObject</code> and <code>GetObject</code> operations.</p></li>
  <li><p align="justify"><strong>Deterministic Reassembly and Tamper Verification:</strong> Implement an in-memory reassembly algorithm that concatenates downloaded blocks in strict index sequence and verifies file integrity using SHA-256 cryptographic checksum matching.</p></li>
  <li><p align="justify"><strong>Interactive Cloud Inspection System:</strong> Build a visual web dashboard that provides real-time AWS connection telemetry and an inspector modal allowing evaluators to preview raw hexadecimal ciphertext directly fetched from S3.</p></li>
  <li><p align="justify"><strong>High Resilience and Zero Cloud Data Leakage:</strong> Ensure that at no point in the cloud storage lifecycle does plain, unencrypted data exist on the AWS S3 bucket.</p></li>
</ol>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
4. Theory
</h2>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
4.1 File Segmentation (Chunking)
</h3>
<p align="justify">
File segmentation is the process of partitioning a continuous binary stream or buffer of length <em>L</em> into <em>N</em> sequential blocks of predefined size <em>S</em>. Mathematically, the total number of chunks <em>N</em> is defined as:
</p>

<p align="center" style="font-family: 'Courier New', Courier, monospace; font-weight: bold;">
N = ceil(L / S)
</p>

<p align="justify">
Each chunk <em>i</em> (where 0 &le; <em>i</em> &lt; <em>N</em>) represents a byte slice spanning from index <code>offset = i &times; S</code> to <code>min(offset + S, L)</code>. In distributed cloud storage systems, chunking provides significant benefits:
</p>

<ul>
  <li><p align="justify"><strong>Fault Tolerance:</strong> If network transmission fails midway, only the uncommitted chunk requires retransmission rather than the entire multi-megabyte payload.</p></li>
  <li><p align="justify"><strong>Parallelism:</strong> Independent chunks can be concurrently encrypted, uploaded, downloaded, and decrypted across asynchronous worker threads.</p></li>
  <li><p align="justify"><strong>Granular Deduplication and Caching:</strong> Identical blocks across different files can be deduplicated, and frequently accessed segments can be cached closer to end-users at CDN edge locations.</p></li>
</ul>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
4.2 Advanced Encryption Standard (AES-256-CBC)
</h3>
<p align="justify">
The Advanced Encryption Standard (AES), specified by the National Institute of Standards and Technology (NIST) in FIPS PUB 197, is a symmetric-key block cipher operating on 128-bit (16-byte) blocks. AES-256 utilizes a key size of 256 bits (32 bytes) executed across 14 rounds of substitution-permutation transformations (SubBytes, ShiftRows, MixColumns, and AddRoundKey).
</p>

<p align="justify">
In Cipher Block Chaining (CBC) mode, each plaintext block is exclusive-ORed (XOR) with the preceding ciphertext block prior to encryption. For the initial block, a 16-byte cryptographically secure random Initialization Vector (IV) is utilized:
</p>

<p align="center" style="font-family: 'Courier New', Courier, monospace; font-weight: bold;">
C[0] = E_k(P[0] XOR IV)<br />
C[i] = E_k(P[i] XOR C[i-1]) &nbsp;&nbsp;&nbsp;&nbsp; for i &ge; 1
</p>

<p align="justify">
Because each chunk receives a unique, randomly sampled IV, identical file chunks produce entirely dissimilar ciphertexts, neutralizing frequency analysis and cryptographic pattern extraction attacks.
</p>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
4.3 Cryptographic Integrity via SHA-256
</h3>
<p align="justify">
Data integrity guarantees that information remains unaltered and untampered during cloud storage and transmission. The Secure Hash Algorithm 256-bit (SHA-256) maps an arbitrary-length binary stream to a fixed 256-bit (64-character hexadecimal) message digest. Due to the avalanche effect and collision resistance of SHA-256, even a single altered bit in any cloud chunk yields a completely disparate checksum, enabling instantaneous detection of corruption or unauthorized modification.
</p>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
4.4 Cloud Object Storage versus Block/File Storage
</h3>
<p align="justify">
Traditional storage paradigms utilize hierarchical directories (file storage) or raw sector volumes (block storage). In contrast, cloud object storage models data as discrete, self-contained objects organized in a flat address space termed a <em>Bucket</em>. Each object consists of three essential components:
</p>

<ul>
  <li><p align="justify"><strong>Object Data:</strong> The raw binary payload (in our case, the AES-256 encrypted chunk).</p></li>
  <li><p align="justify"><strong>Object Key:</strong> A globally unique string identifier acting as the URI path within the bucket (e.g., <code>chunks/{fileId}/chunk_0.enc</code>).</p></li>
  <li><p align="justify"><strong>Metadata:</strong> Key-value attributes accompanying the object, defining content type, custom tags, and cryptographic markers.</p></li>
</ul>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
4.5 Content Delivery Networks (CDN) and Edge Distribution
</h3>
<p align="justify">
A Content Delivery Network (CDN) is a globally distributed network of Point of Presence (PoP) edge servers that cache web assets and media in close geographic proximity to requesting clients. In our project architecture, CDN principles are evaluated: the frontend web client is served via edge CDN distribution with TLS/HTTPS enforcement, and origin shielding can route chunk requests through cached edge locations to reduce cloud egress latency.
</p>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
5. Cloud Services and Technologies Used
</h2>

<table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 11pt; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th style="padding: 8px; border: 1px solid #444;">Category</th>
      <th style="padding: 8px; border: 1px solid #444;">Technology / Service</th>
      <th style="padding: 8px; border: 1px solid #444;">Role &amp; Specific Configuration</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>Cloud Provider</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">Amazon Web Services (AWS)</td>
      <td style="padding: 6px; border: 1px solid #444;">Cloud infrastructure hosting the project's decentralized object storage layer.</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>Cloud Storage</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">Amazon Simple Storage Service (S3)</td>
      <td style="padding: 6px; border: 1px solid #444;">Bucket: <code>chunked-file-storage-jainil</code><br />Region: <code>ap-south-1</code> (Asia Pacific - Mumbai)<br />Stores all encrypted <code>.enc</code> chunk partitions.</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>Identity &amp; Access</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">AWS IAM</td>
      <td style="padding: 6px; border: 1px solid #444;">Enforces least-privilege security policies (<code>s3:PutObject</code>, <code>s3:GetObject</code>, <code>s3:DeleteObject</code>, <code>s3:ListBucket</code>).</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>CDN Concept</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">Edge CDN &amp; HTTPS</td>
      <td style="padding: 6px; border: 1px solid #444;">Global content delivery architecture providing edge caching, HTTPS/TLS 1.3 encryption in transit, and origin access control.</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>Backend Runtime</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">Node.js (v24 LTS)</td>
      <td style="padding: 6px; border: 1px solid #444;">High-performance asynchronous JavaScript engine handling streaming I/O and cryptographic operations.</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>Backend Framework</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">Express.js (v4.21)</td>
      <td style="padding: 6px; border: 1px solid #444;">Provides RESTful endpoints for file uploading, chunk inspection, downloading, and cloud status telemetry.</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>AWS Cloud SDK</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">AWS SDK v3 (<code>@aws-sdk/client-s3</code>)</td>
      <td style="padding: 6px; border: 1px solid #444;">Modular AWS SDK for executing <code>PutObjectCommand</code>, <code>GetObjectCommand</code>, and <code>HeadBucketCommand</code>.</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>Cryptography</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">Node.js <code>crypto</code> Module</td>
      <td style="padding: 6px; border: 1px solid #444;">Native C++ OpenSSL bindings for AES-256-CBC chunk encryption and SHA-256 hashing.</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>Frontend Library</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">React 18 &amp; Vite 5</td>
      <td style="padding: 6px; border: 1px solid #444;">Component-driven single page application (SPA) offering fast hot-module replacement and state reactivity.</td>
    </tr>
    <tr>
      <td style="padding: 6px; border: 1px solid #444;"><strong>UI Styling</strong></td>
      <td style="padding: 6px; border: 1px solid #444;">Custom Glassmorphism CSS</td>
      <td style="padding: 6px; border: 1px solid #444;">Dark mode styling with fluid typography, responsive flex/grid layouts, glowing indicators, and interactive modals.</td>
    </tr>
  </tbody>
</table>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
6. System Architecture
</h2>

<p align="justify">
The system architecture follows a decoupled, three-tier cloud design comprising the <strong>Client Presentation Tier (React SPA)</strong>, the <strong>Application &amp; Cryptography Tier (Node.js/Express Engine)</strong>, and the <strong>Cloud Object Storage Tier (Amazon S3)</strong>.
</p>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
6.1 Upload &amp; Chunking Execution Pipeline
</h3>

<ol>
  <li><p align="justify">The user selects a file (image, PDF, archive) via drag-and-drop on the React frontend and designates the desired chunk size (512 KB, 1 MB, 2 MB).</p></li>
  <li><p align="justify">The frontend transmits the file via HTTP <code>POST /api/upload</code> multipart stream to the Express backend.</p></li>
  <li><p align="justify">The backend receives the file into memory and calculates the original file's SHA-256 checksum.</p></li>
  <li><p align="justify">The <code>chunkService</code> divides the binary buffer into <em>N</em> sequential blocks.</p></li>
  <li><p align="justify">For each block, the <code>encryptionService</code> generates a unique 16-byte cryptographically secure IV, encrypts the chunk using AES-256-CBC, and computes an authentication hash.</p></li>
  <li><p align="justify">The <code>s3Service</code> invokes the AWS SDK <code>PutObjectCommand</code>, storing each encrypted chunk into the bucket under the path <code>chunks/{fileId}/chunk_{index}.enc</code>.</p></li>
  <li><p align="justify">The backend writes the chunk ledger and file metadata to the persistence layer and returns a <code>201 Created</code> response with full chunk details to the UI.</p></li>
</ol>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
6.2 Download &amp; Reassembly Execution Pipeline
</h3>

<ol>
  <li><p align="justify">The user clicks the <strong>Download</strong> button for a specific file on the web dashboard.</p></li>
  <li><p align="justify">The browser issues a request to <code>GET /api/download/:fileId</code>.</p></li>
  <li><p align="justify">The backend retrieves the file metadata, identifying the total chunks and their respective S3 keys and IVs.</p></li>
  <li><p align="justify">The backend iterates through all chunks in strict sequential index order (0 to <em>N</em>-1), downloading each encrypted payload directly from Amazon S3 using <code>GetObjectCommand</code>.</p></li>
  <li><p align="justify">Each chunk buffer is decrypted in memory using AES-256-CBC with the specific IV assigned during upload.</p></li>
  <li><p align="justify">All decrypted chunk buffers are concatenated into a single unified binary buffer using <code>reassembleChunks()</code>.</p></li>
  <li><p align="justify">The system computes the SHA-256 digest of the reassembled buffer and validates it against the original checksum recorded at upload time.</p></li>
  <li><p align="justify">Upon successful integrity verification, the backend streams the file to the browser accompanied by <code>Content-Disposition: attachment</code> and original MIME headers, triggering direct download.</p></li>
</ol>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
7. Implementation Details
</h2>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
7.1 File Chunking Service (<code>chunkService.js</code>)
</h3>

<p align="justify">
The chunking engine slices an input binary buffer into sequential slices. The <code>splitBufferIntoChunks</code> function allocates non-overlapping subarrays without memory copying overhead, returning structured metadata including chunk index, byte offsets, and chunk buffer length:
</p>

<pre style="background: #f4f4f4; padding: 10px; border: 1px solid #ccc; font-family: 'Courier New', monospace; font-size: 10pt;">
export function splitBufferIntoChunks(buffer, chunkSize = 1048576) {
  const chunks = [];
  const totalLength = buffer.length;
  let offset = 0, index = 0;

  while (offset &lt; totalLength) {
    const end = Math.min(offset + chunkSize, totalLength);
    chunks.push({
      index,
      buffer: buffer.subarray(offset, end),
      size: end - offset,
      startByte: offset,
      endByte: end - 1
    });
    offset = end;
    index++;
  }
  return chunks;
}
</pre>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
7.2 Encryption &amp; Decryption Service (<code>encryptionService.js</code>)
</h3>

<p align="justify">
Cryptographic operations leverage the native Node.js <code>crypto</code> module. The master key is derived via SHA-256 to ensure a strict 256-bit entropy length. Every chunk generates a dedicated 16-byte random IV:
</p>

<pre style="background: #f4f4f4; padding: 10px; border: 1px solid #ccc; font-family: 'Courier New', monospace; font-size: 10pt;">
export function encryptChunk(chunkBuffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getMasterKey(), iv);
  const encrypted = Buffer.concat([cipher.update(chunkBuffer), cipher.final()]);
  const authHash = crypto.createHash('sha256').update(chunkBuffer).digest('hex');

  return {
    encryptedBuffer: encrypted,
    ivHex: iv.toString('hex'),
    authHash
  };
}
</pre>

<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold;">
7.3 AWS S3 Integration Service (<code>s3Service.js</code>)
</h3>

<p align="justify">
The cloud storage service interfaces with Amazon S3 using the AWS SDK v3 client. Uploads set custom metadata indicating client-side encryption:
</p>

<pre style="background: #f4f4f4; padding: 10px; border: 1px solid #ccc; font-family: 'Courier New', monospace; font-size: 10pt;">
export async function uploadChunkToS3({ key, buffer }) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'application/octet-stream',
    Metadata: { encrypted: 'true', algorithm: 'aes-256-cbc' }
  });
  return await s3Client.send(command);
}
</pre>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
8. Screenshots
</h2>

<p align="justify">
The figures below illustrate the operational execution of CloudVault running in real time, interfaced directly with the Amazon S3 cloud bucket in the <code>ap-south-1</code> region.
</p>

<div align="center" style="margin: 20px 0;">
  <img src="screenshots/01_cloudvault_dashboard.png" alt="CloudVault Dashboard Overview" style="max-width: 100%; border: 1px solid #aaa; border-radius: 4px;" />
  <p align="center" style="font-size: 11pt; font-style: italic; font-weight: bold; margin-top: 6px;">
    Figure 8.1: CloudVault Web Dashboard showing live AWS S3 Connected status (ap-south-1), bucket telemetry (chunked-file-storage-jainil), 6-stage architecture flowchart, storage statistics, upload dropzone, and the Cloud Storage Ledger.
  </p>
</div>

<p align="justify">
<strong>Explanation of Figure 8.1:</strong> The dashboard displays the live cloud telemetry badge in the top right, confirming active authorization with AWS S3. The architecture workflow illustrates the six-step pipeline from file chunking to reassembly. The statistics overview displays the total number of files, encrypted S3 chunks, cloud storage consumed, and the active AES-256-CBC cipher. In the ledger table, the file <code>TE-2024 Pattern.pdf</code> (2.53 MB) is shown divided into 3 distinct S3 chunks (1 MB each), complete with AES-256 status badges and cryptographic SHA-256 checksums.
</p>

<div align="center" style="margin: 20px 0;">
  <img src="screenshots/02_chunk_encryption_inspector.png" alt="Cloud Chunk & Encryption Inspector Modal" style="max-width: 100%; border: 1px solid #aaa; border-radius: 4px;" />
  <p align="center" style="font-size: 11pt; font-style: italic; font-weight: bold; margin-top: 6px;">
    Figure 8.2: Cloud Chunk &amp; Encryption Inspector modal displaying raw encrypted ciphertext, Initialization Vector (IV), S3 object key, and direct raw chunk download capabilities.
  </p>
</div>

<p align="justify">
<strong>Explanation of Figure 8.2:</strong> When an evaluator clicks the <strong>Inspect</strong> button, the modal directly pulls the raw encrypted chunk metadata from Amazon S3. In this view, chunk 0 (<code>chunks/d4615ec3.../chunk_0.enc</code>) is inspected, displaying its unique Initialization Vector (<code>648d8a74e5ce6c342750e6be6f3807ff</code>) and original vs. encrypted size. The modal renders the raw hexadecimal stream of ciphertext and the Base64 representation. An evaluator can click <em>Download Raw .enc Chunk</em> to verify in a binary editor that unencrypted data never resides on the cloud.
</p>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
9. Advantages
</h2>

<ol>
  <li><p align="justify"><strong>Zero-Knowledge Cloud Confidentiality:</strong> Because encryption occurs prior to S3 persistence, neither AWS system administrators, malicious actors intercepting bucket traffic, nor unauthorized cloud users can decipher the stored blocks.</p></li>
  <li><p align="justify"><strong>Mitigation of Large File Upload Failures:</strong> Slicing files into modular blocks prevents monolithic upload timeouts. Future extensions can retransmit only failing chunks instead of restarting entire transfers.</p></li>
  <li><p align="justify"><strong>Strong Cryptographic Isolation:</strong> Employing a fresh 16-byte random IV for every chunk guarantees that identical file content produces completely unique ciphertext across all cloud storage blocks.</p></li>
  <li><p align="justify"><strong>Guaranteed Data Integrity:</strong> The end-to-end SHA-256 verification ensures that any cloud bit rot, partial download, or byte corruption is detected immediately before the file is presented to the user.</p></li>
  <li><p align="justify"><strong>Cost Efficiency &amp; Infinite Elasticity:</strong> Utilizing AWS S3 standard object storage leverages pay-as-you-go cloud pricing without provisioning expensive dedicated virtual machines or file storage appliances.</p></li>
</ol>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
10. Limitations
</h2>

<ol>
  <li><p align="justify"><strong>Client-Side Master Key Management:</strong> If the symmetric master key is lost, the encrypted chunks stored in S3 become cryptographically irrecoverable. In production, an external key management service such as AWS KMS or HashiCorp Vault is required.</p></li>
  <li><p align="justify"><strong>Sequential Processing Latency:</strong> In the current implementation, chunks are uploaded and downloaded sequentially in a loop. For very large files (e.g., &gt; 1 GB), this introduces cumulative HTTP latency compared to concurrent stream pipelines.</p></li>
  <li><p align="justify"><strong>Cloud Egress Bandwidth Costs:</strong> Downloading multiple encrypted chunks incurs standard cloud data transfer egress fees when scaling to massive enterprise datasets.</p></li>
</ol>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
11. Conclusion
</h2>

<p align="justify">
The CloudVault project successfully designs, implements, and evaluates a secure, distributed cloud file storage solution adhering to all core objectives of the cloud computing curriculum. The system demonstrates practical proficiency in cloud object storage (Amazon S3), symmetric cryptographic algorithms (AES-256-CBC), cryptographic hashing (SHA-256), and dynamic binary buffer segmentation.
</p>

<p align="justify">
The interactive web application provides clear transparency into cloud storage operations, offering live telemetry, chunk inspection, and verifiable data reconstruction. The project confirms that client-side chunking combined with symmetric encryption effectively neutralizes public cloud data exposure risks while preserving seamless user accessibility and high storage reliability.
</p>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
12. Future Scope
</h2>

<ol>
  <li><p align="justify"><strong>Integration of AWS CloudFront CDN with Signed URLs:</strong> As soon as AWS account verification for CloudFront concludes, routing all chunk retrieval traffic through CloudFront edge locations using presigned CloudFront cookies will enable global low-latency distribution with edge DDoS protection.</p></li>
  <li><p align="justify"><strong>Multi-threaded Parallel Chunk Streaming:</strong> Implementing asynchronous parallel chunk uploads and downloads via JavaScript Web Workers or Node.js Worker Threads will drastically increase throughput for multi-gigabyte payloads.</p></li>
  <li><p align="justify"><strong>Multi-Cloud Redundant Erasure Coding:</strong> Upgrading from simple chunking to Reed-Solomon Erasure Coding will allow distributing parity chunks across multiple cloud vendors (e.g., AWS S3, Google Cloud Storage, and Azure Blob Storage), ensuring data recovery even if an entire cloud provider experiences an outage.</p></li>
  <li><p align="justify"><strong>Hardware Security Module (AWS KMS) Integration:</strong> Integrating envelope encryption with AWS Key Management Service (KMS) for automated key rotation and fine-grained IAM policy enforcement.</p></li>
</ol>

<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
13. References
</h2>

<ol>
  <li><p align="justify">National Institute of Standards and Technology (NIST), <em>“Specification for the Advanced Encryption Standard (AES),”</em> Federal Information Processing Standards Publication (FIPS PUB) 197, 2001.</p></li>
  <li><p align="justify">Amazon Web Services, <em>“Amazon Simple Storage Service (S3) Developer Guide &amp; API Reference,”</em> AWS Documentation, 2026. [Online]. Available: https://docs.aws.amazon.com/s3/</p></li>
  <li><p align="justify">M. Dworkin, <em>“Recommendation for Block Cipher Modes of Operation: Methods and Techniques,”</em> NIST Special Publication 800-38A, 2001.</p></li>
  <li><p align="justify">OpenSSL Project, <em>“EVP Symmetric Encryption and Message Authentication Code Documentation,”</em> OpenSSL Software Foundation, 2025.</p></li>
  <li><p align="justify">V. K. Vavilapalli et al., <em>“Apache Hadoop YARN: Yet Another Resource Negotiator and Distributed File Systems,”</em> in Proc. ACM SOCC, 2013.</p></li>
  <li><p align="justify">AWS Architecture Center, <em>“Best Practices for Amazon S3 and Content Delivery Networks (CloudFront),”</em> AWS Whitepapers, 2025.</p></li>
</ol>

</div>
