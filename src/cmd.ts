import process from 'process'
import { spawn } from 'child_process'

export async function cmd(...command: string[]): Promise<number> {
  const spawnProcess = spawn(command[0], command.slice(1), {
    env: {
      ...process.env
    }
  })
  return new Promise((resolve, reject) => {
    spawnProcess.stdout.on('data', x => {
      process.stdout.write(x.toString())
    })
    spawnProcess.stderr.on('data', x => {
      process.stderr.write(x.toString())
    })
    spawnProcess.on('exit', code => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(
          new Error(`Command '${command.join(' ')}' exited with code ${code}`)
        )
      }
    })
    spawnProcess.on('error', err => {
      reject(err)
    })
  })
}
