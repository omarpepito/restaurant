import { maskPII } from "./helpers";

/**
 * Custom logger that masks PII before outputting to console
 */
export const logger = {
    log: (message: string, ...optionalParams: any[]) => {
        const maskedMessage = maskPII(message);
        const maskedParams = optionalParams.map(p => maskPII(p));
        console.log(maskedMessage, ...maskedParams);
    },
    error: (message: string, ...optionalParams: any[]) => {
        const maskedMessage = maskPII(message);
        const maskedParams = optionalParams.map(p => maskPII(p));
        console.error(maskedMessage, ...maskedParams);
    },
    warn: (message: string, ...optionalParams: any[]) => {
        const maskedMessage = maskPII(message);
        const maskedParams = optionalParams.map(p => maskPII(p));
        console.warn(maskedMessage, ...maskedParams);
    },
    info: (message: string, ...optionalParams: any[]) => {
        const maskedMessage = maskPII(message);
        const maskedParams = optionalParams.map(p => maskPII(p));
        console.info(maskedMessage, ...maskedParams);
    }
};
