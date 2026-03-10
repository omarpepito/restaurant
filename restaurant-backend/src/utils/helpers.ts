/**
 * Masks PII (Email and Phone) in a string or object
 */
export const maskPII = (data: any): any => {
    if (typeof data === 'string') {
        // Mask email: a***b@example.com
        const emailRegex = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
        data = data.replace(emailRegex, (match, p1, p2) => {
            if (p1.length <= 2) return `${p1[0]}***@${p2}`;
            return `${p1[0]}***${p1[p1.length - 1]}@${p2}`;
        });

        // Mask phone: ***-***-1234 (assuming US-like format for simplicity, or any 10-digit sequence)
        const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?(\d{4})\b/g;
        data = data.replace(phoneRegex, '***-***-$1');
        
        return data;
    }

    if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
            return data.map(maskPII);
        }
        const masked: any = {};
        for (const [key, value] of Object.entries(data)) {
            masked[key] = maskPII(value);
        }
        return masked;
    }

    return data;
};

/**
 * Checks if the payload size exceeds the limit (default 16KB)
 */
export const isPayloadTooLarge = (payload: any, limitInBytes: number = 16384): boolean => {
    const size = Buffer.byteLength(JSON.stringify(payload));
    return size > limitInBytes;
};
