export async function minDelay(ms = 60) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
