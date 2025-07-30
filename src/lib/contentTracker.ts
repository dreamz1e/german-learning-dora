// Content tracking to prevent repetitive AI generations
export class ContentTracker {
  private static recentHashes = new Map<string, number>();
  private static readonly MAX_CACHE_SIZE = 100;
  private static readonly HASH_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Generate a hash for exercise content to detect duplicates
   */
  static hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if content is too similar to recently generated content
   */
  static isDuplicate(content: string): boolean {
    const hash = this.hashContent(content);
    const now = Date.now();

    // Clean expired hashes
    for (const [key, timestamp] of this.recentHashes.entries()) {
      if (now - timestamp > this.HASH_EXPIRY_MS) {
        this.recentHashes.delete(key);
      }
    }

    return this.recentHashes.has(hash);
  }

  /**
   * Track new content to prevent future duplicates
   */
  static trackContent(content: string): void {
    const hash = this.hashContent(content);
    const now = Date.now();

    this.recentHashes.set(hash, now);

    // Limit cache size
    if (this.recentHashes.size > this.MAX_CACHE_SIZE) {
      const oldestKey = this.recentHashes.keys().next().value;
      if (oldestKey) {
        this.recentHashes.delete(oldestKey);
      }
    }
  }

  /**
   * Generate a unique variation seed based on user and request context
   */
  static generateVariationSeed(
    userId: string,
    exerciseType: string,
    difficulty: string,
    topic?: string
  ): string {
    const timestamp = Math.floor(Date.now()); // Changes every 5 minutes
    const contextHash = this.hashContent(
      `${userId}-${exerciseType}-${difficulty}-${topic || "general"}`
    );
    return `${contextHash}-${timestamp}`;
  }

  /**
   * Get count of similar exercises generated recently
   */
  static getSimilarCount(
    exerciseType: string,
    difficulty: string,
    topic?: string
  ): number {
    const contextKey = `${exerciseType}-${difficulty}-${topic || "general"}`;
    let count = 0;
    const now = Date.now();

    for (const [hash, timestamp] of this.recentHashes.entries()) {
      if (now - timestamp <= this.HASH_EXPIRY_MS && hash.includes(contextKey)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Clear tracking data (for testing purposes)
   */
  static clearTracking(): void {
    this.recentHashes.clear();
  }
}
