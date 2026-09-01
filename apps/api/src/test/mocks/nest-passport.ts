export function AuthGuard(_strategy: string) {
  void _strategy;
  return class MockAuthGuard {};
}

export class PassportModule {}
export function PassportStrategy<T extends new (...args: never[]) => unknown>(
  strategy: T,
): T {
  return strategy;
}
