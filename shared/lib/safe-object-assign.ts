export function safeAssign<T extends object>(target: T, source: Partial<T>): T {
    return Object.assign(target, source)
  }
  