export class AppError extends Error {
  static apiError(error: string) {
    throw error;
  }

  static codeError(error: string) {
    throw error;
  }

  static writeFileError(error: string) {
    throw error;
  }

  static createFolderError(error: string) {
    throw error;
  }

  static folderNotFound(error: string) {
    throw error;
  }

  static bdConnectionError(error: string) {
    throw 'Проблема с подключением к бд\n' + error;
  }
}
