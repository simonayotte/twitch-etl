export async function runEvery(method, intervalMinutes) {
  await method()
  setTimeout(
    () => runEvery(method, intervalMinutes),
    intervalMinutes * 60 * 1000,
  )
}

export async function sleep(minutes) {
  return new Promise((resolve) => setTimeout(resolve, minutes * 60 * 1000))
}
