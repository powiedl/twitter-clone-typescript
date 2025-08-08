export function shouldBeUnreachable(value: never) {
  console.log('unhandled value in switch statement', value);
}
