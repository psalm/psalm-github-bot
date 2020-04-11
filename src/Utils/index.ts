export async function delay(ms: number) {
  new Promise<void>(resolve => setTimeout(resolve, ms))
}
