export class AppError extends Error {
  static apiError(error: string) {
    console.error(error);
  }

  static codeError(error: string) {
    console.error(error);
  }
}
