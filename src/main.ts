import * as core from '@actions/core'
import { setLanguagesForUpdate } from './set-languages-for-update'
import { cmd } from './cmd'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const liblabToken: string = core.getInput('liblab_token')
    const githubToken: string = core.getInput('github_token')

    core.setCommandEcho(true)
    core.exportVariable('liblab_token', liblabToken)
    core.exportVariable('github_token', githubToken)

    const result = await setLanguagesForUpdate()
    core.info(`Language for updates works -> Result: ${result}`)

    await cmd('npx', '--yes', 'liblab', 'build', '--yes')
    await cmd('npx', '--yes', 'liblab', 'pr')

    core.setOutput('status', `The status is: ${liblabToken} & ${result}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
