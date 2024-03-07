import * as core from '@actions/core'
import { setLanguagesForUpdate } from './set-languages-for-update'
import { cmd } from './cmd'
import process from 'process'

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
    core.info(`Process environment variables: ${JSON.stringify(process.env)}`)

    const languagesToUpdate = await setLanguagesForUpdate()
    if (!languagesToUpdate) {
      core.info('No languages need an update. Exiting the action.')
      core.setOutput('status', `No languages need an update.`)
      return
    }
    core.info(`Languages that need update: ${languagesToUpdate}`)

    core.info('Building SDKs...')
    await cmd('npx', ['--yes', 'liblab', 'build', '--yes'], {
      env: { LIBLAB_TOKEN: liblabToken, GITHUB_TOKEN: githubToken }
    })
    core.info('Finished building SDKs.')

    core.info('Publishing PRs...')
    await cmd('npx', ['--yes', 'liblab', 'pr'], {
      env: { LIBLAB_TOKEN: liblabToken, GITHUB_TOKEN: githubToken }
    })
    core.info('Finished publishing PRs.')

    core.setOutput('status', `Finished building languages: `)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
