import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"
import LoginDialog from "../LoginDialog"
import SettingsDialog from "./settings"

export default function Header() {
  return (
    <header className="bg-white border-b border-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-500 mr-2" />
            <span className="font-bold text-xl text-green-700">Agri-Bot</span>
          </div>
          <div className="flex items-center">
            <SettingsDialog/>
          </div>
        </div>
      </div>
    </header>
  )
}

