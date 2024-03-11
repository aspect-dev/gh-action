import fs from 'fs-extra'
import { LibLabConfig } from './types/liblab-config'

export const LIBLAB_CONFIG_PATH = './liblab.config.json'

export async function readLiblabConfig(): Promise<LibLabConfig> {
  if (!(await fs.pathExists(LIBLAB_CONFIG_PATH))) {
    throw new Error('liblab.config.json not found in the root directory.')
  }

  try {
    const rawData = await fs.readFile(LIBLAB_CONFIG_PATH, 'utf8')
    return JSON.parse(rawData) as LibLabConfig
  } catch (error) {
    // @ts-expect-error if customers removed liblab.config.json
    throw new Error(`Error reading liblab.config.json: ${error.message}`)
  }
}
