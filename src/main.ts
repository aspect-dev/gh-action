import * as core from '@actions/core'
import { wait } from './wait'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const liblabToken: string = core.getInput('liblab_token')
    const githubToken: string = core.getInput('github_token')

    core.setCommandEcho(true);
    core.exportVariable('liblab_token', liblabToken);
    core.exportVariable('github_token', githubToken);

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt('10', 10))
    core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('status', `The status is: ${liblabToken}`);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
