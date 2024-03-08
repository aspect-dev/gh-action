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

    core.exportVariable('liblab_token', liblabToken)
    core.exportVariable('github_token', githubToken)

    const languagesToUpdate = await setLanguagesForUpdate()
    if (!languagesToUpdate) {
      core.info('************ No languages need an update. Skipping the builds. ************')
      core.setOutput('status', 'skipped')
      return
    }
    core.info(`************ Languages that need update: ${languagesToUpdate} ************`)

    core.info('************ Building SDKs... ************')
    await cmd('npx', '--yes', 'liblab', 'build', '--yes')
    core.info('************ Finished building SDKs. ************')

    core.info('************ Publishing PRs... ************')
    await cmd('npx', '--yes', 'liblab', 'pr')
    core.info('************ Finished publishing PRs. ************')

    core.setOutput('status', `success`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setOutput('status', 'failed')
      core.setFailed(error.message)
    }
  }
}
