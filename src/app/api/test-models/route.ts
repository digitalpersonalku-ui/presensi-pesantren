import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const modelsDir = path.join(process.cwd(), 'public', 'models')

    const files = fs.readdirSync(modelsDir)
    const modelFiles = files.reduce((acc, file) => {
      const filePath = path.join(modelsDir, file)
      const stats = fs.statSync(filePath)
      acc[file] = {
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        exists: true
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      modelsPath: modelsDir,
      files: modelFiles,
      totalFiles: files.length,
      allModelsPresent: files.length === 6
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
