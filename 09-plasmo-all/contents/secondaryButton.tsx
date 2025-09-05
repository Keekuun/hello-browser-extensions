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


const SecondaryButton = () => {
  return (
    <button className="secondary-button">
      按钮-secondary
    </button>
  )
}

export default SecondaryButton