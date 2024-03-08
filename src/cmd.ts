import process from 'process'
import { spawn } from 'child_process'

export function cmd(...command: string[]) {
  let p = spawn(command[0], command.slice(1), {
    env: {
      ...process.env
    }
  })
  return new Promise((resolve, reject) => {
    p.stdout.on('data', x => {
      process.stdout.write(x.toString())
    })
    p.stderr.on('data', x => {
      process.stderr.write(x.toString())
    })
    p.on('exit', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command '${command.join(' ')}' exited with code ${code}`));
      }
    });
    p.on('error', err => {
      reject(err);
    });
  })
}
