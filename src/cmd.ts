import process from 'process'
import { spawn } from 'child_process'

export function cmd(command: string, args: string[], options: {}) {
  let p = spawn(command, args, options)
  return new Promise(resolve => {
    p.stdout.on('data', x => {
      process.stdout.write(x.toString())
    })
    p.stderr.on('data', x => {
      process.stderr.write(x.toString())
    })
    p.on('exit', code => {
      resolve(code)
    })
  })
}
