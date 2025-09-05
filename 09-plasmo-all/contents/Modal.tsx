import type { PlasmoCSConfig } from "plasmo"
import {useRef} from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

// 和页面中普通js一样
window.addEventListener("load", () => {
  console.log(
    "[content modal]"
  )
})

// 默认导出 的组件会通过 shadow DOM 插入到页面中
const Modal = () => {
  const ref = useRef<HTMLDivElement>(null)
  const handleClose = () => {
    ref.current.remove()
  }
  return (
    <div
      ref={ref}
      id="plasmo-modal"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
      }}>
        <h2 style={{ marginBottom: "10px" }}>Plasmo Modal</h2>
        <p style={{ marginBottom: "10px" }}>This is a modal injected by Plasmo.</p>
        <button
          onClick={handleClose}
          style={{
          backgroundColor: "dodgerblue",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "4px",
          cursor: "pointer",
        }}>关闭</button>
      </div>
    </div>
  )
}

export default Modal