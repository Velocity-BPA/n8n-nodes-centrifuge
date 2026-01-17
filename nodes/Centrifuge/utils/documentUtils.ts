/**
 * Document Utilities for Centrifuge Anchoring
 *
 * Centrifuge uses on-chain document anchoring to verify
 * off-chain documents and data. The process:
 * 1. Document is hashed (usually with SHA-256 or BLAKE2)
 * 2. Hash is committed on-chain with metadata
 * 3. On-chain anchor serves as proof of existence at a point in time
 *
 * Use cases:
 * - Loan agreement verification
 * - Asset ownership proofs
 * - Invoice verification
 * - KYC/AML document attestation
 */

import { blake2AsHex, sha256AsU8a, xxhashAsHex } from '@polkadot/util-crypto';
import { hexToU8a, u8aToHex, stringToU8a, isHex } from '@polkadot/util';

/**
 * Supported hash algorithms for document anchoring
 */
export enum HashAlgorithm {
	Blake2_256 = 'blake2_256',
	Sha256 = 'sha256',
	Xxhash = 'xxhash',
}

/**
 * Document anchor structure
 */
export interface DocumentAnchor {
	anchorId: string;
	documentRoot: string;
	signingRoot?: string;
	docType?: DocumentType;
	timestamp?: number;
	blockNumber?: number;
}

/**
 * Document types in Centrifuge
 */
export enum DocumentType {
	Invoice = 'invoice',
	PurchaseOrder = 'purchase_order',
	LoanAgreement = 'loan_agreement',
	AssetDocument = 'asset_document',
	KycDocument = 'kyc_document',
	Generic = 'generic',
}

/**
 * Pre-commit structure for two-phase anchoring
 */
export interface PreCommit {
	anchorId: string;
	signingRoot: string;
	identity: string;
	expirationBlock: number;
}

/**
 * Document proof for verification
 */
export interface DocumentProof {
	documentId: string;
	version: string;
	proofFields: ProofField[];
	rootHash: string;
}

/**
 * Individual proof field
 */
export interface ProofField {
	property: string;
	value: string;
	salt: string;
	hash: string;
	sortedHashes: string[];
}

/**
 * Hash a document or data
 *
 * @param data - Data to hash (string, Buffer, or Uint8Array)
 * @param algorithm - Hash algorithm to use
 * @returns Hex-encoded hash
 */
export function hashDocument(
	data: string | Uint8Array | Buffer,
	algorithm: HashAlgorithm = HashAlgorithm.Blake2_256,
): string {
	let input: Uint8Array;

	if (typeof data === 'string') {
		// Check if it's already hex
		if (isHex(data)) {
			input = hexToU8a(data);
		} else {
			input = stringToU8a(data);
		}
	} else if (Buffer.isBuffer(data)) {
		input = new Uint8Array(data);
	} else {
		input = data;
	}

	switch (algorithm) {
		case HashAlgorithm.Blake2_256:
			return blake2AsHex(input, 256);
		case HashAlgorithm.Sha256:
			return u8aToHex(sha256AsU8a(input));
		case HashAlgorithm.Xxhash:
			return xxhashAsHex(input, 256);
		default:
			return blake2AsHex(input, 256);
	}
}

/**
 * Generate an anchor ID from document content
 */
export function generateAnchorId(
	documentHash: string,
	nonce?: string | number,
): string {
	const nonceStr = nonce?.toString() || Date.now().toString();
	const combined = `${documentHash}${nonceStr}`;
	return blake2AsHex(combined, 256);
}

/**
 * Validate a document hash format
 */
export function validateDocumentHash(hash: string): {
	isValid: boolean;
	error?: string;
} {
	if (!hash) {
		return { isValid: false, error: 'Hash is required' };
	}

	// Check hex format
	if (!isHex(hash)) {
		// Try adding 0x prefix
		if (!isHex(`0x${hash}`)) {
			return { isValid: false, error: 'Hash must be a hex string' };
		}
	}

	// Check length (32 bytes = 64 hex chars + 0x prefix)
	const cleanHex = hash.startsWith('0x') ? hash : `0x${hash}`;
	if (cleanHex.length !== 66) {
		return { isValid: false, error: 'Hash must be 32 bytes (64 hex characters)' };
	}

	return { isValid: true };
}

/**
 * Combine multiple hashes into a Merkle root
 * Uses pairwise hashing
 */
export function computeMerkleRoot(hashes: string[]): string {
	if (hashes.length === 0) {
		return blake2AsHex('', 256);
	}

	if (hashes.length === 1) {
		return hashes[0];
	}

	// Ensure even number of hashes
	const workingHashes = [...hashes];
	if (workingHashes.length % 2 !== 0) {
		workingHashes.push(workingHashes[workingHashes.length - 1]);
	}

	// Compute parent level
	const parentHashes: string[] = [];
	for (let i = 0; i < workingHashes.length; i += 2) {
		const left = workingHashes[i];
		const right = workingHashes[i + 1];

		// Sort for consistency
		const [first, second] = [left, right].sort();
		const combined = hexToU8a(first).toString() + hexToU8a(second).toString();
		parentHashes.push(blake2AsHex(combined, 256));
	}

	// Recurse until we have a single root
	return computeMerkleRoot(parentHashes);
}

/**
 * Create a document proof for a specific field
 */
export function createFieldProof(
	property: string,
	value: string,
	salt: string,
): string {
	const combined = `${property}|${value}|${salt}`;
	return blake2AsHex(combined, 256);
}

/**
 * Verify a document proof against an anchor
 */
export function verifyDocumentProof(
	proof: DocumentProof,
	anchor: DocumentAnchor,
): {
	isValid: boolean;
	error?: string;
} {
	try {
		// Recompute field hashes
		const fieldHashes = proof.proofFields.map((field) => {
			const computed = createFieldProof(field.property, field.value, field.salt);
			if (computed !== field.hash) {
				throw new Error(`Field hash mismatch for ${field.property}`);
			}
			return computed;
		});

		// Compute root from field hashes
		const computedRoot = computeMerkleRoot(fieldHashes);

		if (computedRoot !== proof.rootHash) {
			return { isValid: false, error: 'Root hash mismatch' };
		}

		// Verify against anchor
		if (proof.rootHash !== anchor.documentRoot) {
			return { isValid: false, error: 'Proof root does not match anchor' };
		}

		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Verification failed',
		};
	}
}

/**
 * Generate a signing root from document and identity
 */
export function generateSigningRoot(
	documentRoot: string,
	identityAddress: string,
): string {
	const combined = `${documentRoot}${identityAddress}`;
	return blake2AsHex(combined, 256);
}

/**
 * Check if a pre-commit is expired
 */
export function isPreCommitExpired(preCommit: PreCommit, currentBlock: number): boolean {
	return currentBlock > preCommit.expirationBlock;
}

/**
 * Calculate pre-commit expiration block
 */
export function calculatePreCommitExpiration(
	currentBlock: number,
	validityPeriodBlocks: number = 256,
): number {
	return currentBlock + validityPeriodBlocks;
}

/**
 * Format anchor for display
 */
export function formatAnchor(anchor: DocumentAnchor): string {
	return JSON.stringify(
		{
			anchorId: anchor.anchorId,
			documentRoot: anchor.documentRoot,
			signingRoot: anchor.signingRoot,
			type: anchor.docType || 'generic',
			timestamp: anchor.timestamp ? new Date(anchor.timestamp * 1000).toISOString() : undefined,
			block: anchor.blockNumber,
		},
		null,
		2,
	);
}

/**
 * Parse IPFS CID to anchor-compatible format
 */
export function ipfsCidToAnchorHash(cid: string): string {
	// CIDv0 starts with Qm, CIDv1 with b
	// For anchoring, we hash the CID itself
	return blake2AsHex(cid, 256);
}

/**
 * Document version utilities
 */
export function incrementVersion(currentVersion: string): string {
	const parts = currentVersion.split('.');
	const lastPart = parseInt(parts[parts.length - 1], 10) || 0;
	parts[parts.length - 1] = (lastPart + 1).toString();
	return parts.join('.');
}

/**
 * Compare document versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
	const parts1 = v1.split('.').map((p) => parseInt(p, 10) || 0);
	const parts2 = v2.split('.').map((p) => parseInt(p, 10) || 0);

	const maxLength = Math.max(parts1.length, parts2.length);

	for (let i = 0; i < maxLength; i++) {
		const p1 = parts1[i] || 0;
		const p2 = parts2[i] || 0;

		if (p1 < p2) return -1;
		if (p1 > p2) return 1;
	}

	return 0;
}

/**
 * Create a document ID from components
 */
export function createDocumentId(
	issuer: string,
	documentType: DocumentType,
	identifier: string,
): string {
	const combined = `${issuer}:${documentType}:${identifier}`;
	return blake2AsHex(combined, 256);
}

/**
 * Anchor metadata structure
 */
export interface AnchorMetadata {
	documentType: DocumentType;
	issuer: string;
	issuedAt: number;
	version: string;
	description?: string;
	relatedDocuments?: string[];
}

/**
 * Serialize anchor metadata for storage
 */
export function serializeMetadata(metadata: AnchorMetadata): string {
	return JSON.stringify(metadata);
}

/**
 * Parse anchor metadata from storage
 */
export function parseMetadata(data: string): AnchorMetadata {
	return JSON.parse(data) as AnchorMetadata;
}
