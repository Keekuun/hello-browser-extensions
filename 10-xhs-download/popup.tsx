import React from "react"
import logo from "./assets/icon.svg"

function IndexPopup() {
  return (
    <div
      style={{
        padding: 16,
        width: 300,
        fontFamily: "Arial, sans-serif"
      }}>
      <h2 style={{ marginBottom: 16, color: "#333", display: "flex", alignItems: "center" }}>
        <img src={logo} alt="" style={{ width: 24, height: 24, marginRight: 8 }} />
        小红书图片下载器
      </h2>
      
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: "8px 0", color: "#666" }}>
          这个扩展可以帮助您快速下载小红书图片：
        </p>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "12px 0", fontSize: 16, color: "#333" }}>
          ✨ 功能介绍
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#666" }}>
          <li style={{ margin: "6px 0" }}>
            自动检测小红书图片轮播列表
          </li>
          <li style={{ margin: "6px 0" }}>
            显示「下载全部图片」按钮
          </li>
          <li style={{ margin: "6px 0" }}>
            右键菜单添加「下载当前图片」选项
          </li>
          <li style={{ margin: "6px 0" }}>
            支持一键下载所有幻灯片图片
          </li>
        </ul>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "12px 0", fontSize: 16, color: "#333" }}>
          📖 使用说明
        </h3>
        <ol style={{ margin: 0, paddingLeft: 20, color: "#666" }}>
          <li style={{ margin: "6px 0" }}>
            访问小红书网站，打开图片帖子
          </li>
          <li style={{ margin: "6px 0" }}>
            在图片轮播区域会自动出现下载按钮
          </li>
          <li style={{ margin: "6px 0" }}>
            点击「下载全部图片」获取所有图片
          </li>
          <li style={{ margin: "6px 0" }}>
            或右键点击图片，选择「下载当前图片」
          </li>
        </ol>
      </div>
      
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #eee", color: "#999", fontSize: 12 }}>
        <p>© jeek 小红书图片下载器</p>
      </div>
    </div>
  )
}

export default IndexPopup
