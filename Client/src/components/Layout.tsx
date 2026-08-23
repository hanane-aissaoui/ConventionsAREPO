import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import "./Layout.css"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`layout__main ${sidebarOpen ? "" : "layout__main--full"}`}>
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  )
}