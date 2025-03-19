"use client"

import { useState, useEffect } from "react"
import type { DatabaseType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, X } from "lucide-react"
import { useDbConfigStore } from "@/lib/store/db-config-store"

interface ConfigPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const { dbConfig, isLoading, error, updateDbConfig, setDbType, saveConfiguration, clearError } = useDbConfigStore()
  const [showPassword, setShowPassword] = useState(false)
  const [useConnectionString, setUseConnectionString] = useState(false)

  // Reset connection string option when database type changes
  useEffect(() => {
    setUseConnectionString(false)
  }, [dbConfig.type])

  const handleSave = async () => {
    const success = await saveConfiguration()
    if (success) {
      onClose()
    }
  }

  const renderDatabaseSpecificFields = () => {
    switch (dbConfig.type) {
      case "mongodb":
        return (
          <>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="use-connection-string"
                checked={useConnectionString}
                onCheckedChange={setUseConnectionString}
              />
              <Label htmlFor="use-connection-string">Use Connection String</Label>
            </div>

            {useConnectionString ? (
              <div className="space-y-2">
                <Label htmlFor="connection-string">Connection String</Label>
                <Input
                  id="connection-string"
                  value={dbConfig.connectionString || ""}
                  onChange={(e) => updateDbConfig({ connectionString: e.target.value })}
                  placeholder="mongodb://username:password@host:port/database"
                  className="bg-[#2a2a2a] border-[#3a3a3a]"
                  disabled={isLoading}
                />
              </div>
            ) : null}

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="use-ssl"
                checked={dbConfig.ssl || false}
                onCheckedChange={(checked) => updateDbConfig({ ssl: checked })}
                disabled={isLoading}
              />
              <Label htmlFor="use-ssl">Use SSL</Label>
            </div>
          </>
        )

      case "sqlite":
        return (
          <div className="space-y-2">
            <Label htmlFor="database-file">Database File Path</Label>
            <Input
              id="database-file"
              value={dbConfig.database}
              onChange={(e) => updateDbConfig({ database: e.target.value })}
              placeholder="/path/to/database.db"
              className="bg-[#2a2a2a] border-[#3a3a3a]"
              disabled={isLoading}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 w-80 bg-[#1a1a1a] p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} z-20`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Database Configuration</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={isLoading}>
          <X size={20} />
        </button>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-900/20 border-red-800">
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError} className="h-6 px-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <Label htmlFor="db-type">Database Type</Label>
          <Select
            value={dbConfig.type}
            onValueChange={(value) => setDbType(value as DatabaseType)}
            disabled={isLoading}
          >
            <SelectTrigger id="db-type" className="bg-[#2a2a2a] border-[#3a3a3a]">
              <SelectValue placeholder="Select database type" />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mongodb">MongoDB</SelectItem>
              <SelectItem value="sqlite">SQLite</SelectItem>
              <SelectItem value="mssql">SQL Server</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dbConfig.type !== "sqlite" && !useConnectionString && (
          <>
            <div>
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={dbConfig.host}
                onChange={(e) => updateDbConfig({ host: e.target.value })}
                className="bg-[#2a2a2a] border-[#3a3a3a]"
                disabled={isLoading}
              />
            </div>

            {dbConfig.type !== "sqlite" && (
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  value={dbConfig.port}
                  onChange={(e) => updateDbConfig({ port: e.target.value })}
                  className="bg-[#2a2a2a] border-[#3a3a3a]"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                value={dbConfig.user}
                onChange={(e) => updateDbConfig({ user: e.target.value })}
                className="bg-[#2a2a2a] border-[#3a3a3a]"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={dbConfig.password}
                  onChange={(e) => updateDbConfig({ password: e.target.value })}
                  className="bg-[#2a2a2a] border-[#3a3a3a] pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {dbConfig.type !== "sqlite" && (
              <div>
                <Label htmlFor="database">Database Name</Label>
                <Input
                  id="database"
                  value={dbConfig.database}
                  onChange={(e) => updateDbConfig({ database: e.target.value })}
                  className="bg-[#2a2a2a] border-[#3a3a3a]"
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        )}

        {renderDatabaseSpecificFields()}

        <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Configuration"
          )}
        </Button>
      </div>
    </div>
  )
}

