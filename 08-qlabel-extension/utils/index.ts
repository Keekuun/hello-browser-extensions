export async function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export async function downloadImage(url: string, filename: string) {
  const response = await fetch(url)
  const blob = await response.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}