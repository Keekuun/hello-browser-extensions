import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  // 限制 匹配的域名
  matches: ["https://www.plasmo.com/*"]
}

window.addEventListener("load", () => {
  console.log(
    "[content]: message."
  )

  // 这里可以进行dom操作
  document.querySelectorAll("*").forEach((dom: HTMLElement) => {
    dom.style.border="1px solid red"
  })
})