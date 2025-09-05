import cssText from "data-text:~/contents/index.css"
import type {PlasmoCSConfig} from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  css: ["index.css"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const primaryButton = () => {
  return (
    <button className="primary-button">
      按钮-primary
    </button>
  )
}

export default primaryButton