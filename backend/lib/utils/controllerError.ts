export const controllerError = (error: unknown, info = '') => {
  if (error instanceof Error) {
    let prefix = 'Error';
    if (info) {
      prefix = `Error in ${info}`;
    }
    if (error instanceof Error) {
      if ('message' in error) {
        console.log(`${prefix}:`, error.message);
      } else {
        console.log(`${prefix} (without an attribute message):`, error);
      }
    }
  }
};
