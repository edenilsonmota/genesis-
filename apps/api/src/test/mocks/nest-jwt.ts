export class JwtService {
  signAsync(_payload: unknown): Promise<string> {
    void _payload;
    return Promise.resolve("signed-token");
  }
}

export class JwtModule {}
