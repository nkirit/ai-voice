export class VoiceAppError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = "VoiceAppError";
  }
}

export class InvalidApiKeyError extends VoiceAppError {
  constructor(public readonly provider: string) {
    super(`Invalid or unauthorized API key for provider: ${provider}`, 401);
    this.name = "InvalidApiKeyError";
  }
}

export class ProviderError extends VoiceAppError {
  constructor(provider: string, cause: unknown, statusCode = 502) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`${provider} provider error: ${detail}`, statusCode);
    this.name = "ProviderError";
  }
}
