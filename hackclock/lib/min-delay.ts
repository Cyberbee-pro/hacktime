export async function minDelay(ms = 20) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
