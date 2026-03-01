// Shared utilities
export function generateId() {
    return crypto.randomUUID();
}
export function formatDate(date) {
    return date.toISOString();
}
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=index.js.map