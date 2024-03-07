import { Octokit } from '@octokit/rest'
import { Manifest } from './types/manifest'
import { LibLabConfig, LiblabVersion } from './types/liblab-config'
import { Language } from './types/language'
import semver from 'semver'
import { GitRepoRelease } from './types/git-repo-release'
import { getSdkEngine, SdkEngines } from './types/sdk-language-engine-map'
import { LIBLAB_CONFIG_PATH, readLiblabConfig } from './read-liblab-config'
import fs from 'fs-extra'

const MANIFEST_PATH = '.manifest.json'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export async function setLanguagesForUpdate(): Promise<boolean> {
  const liblabConfig = await readLiblabConfig()
  const languagesToUpdate = []

  for (const language of liblabConfig.languages) {
    const manifest = await fetchManifestForLanguage(language, liblabConfig)
    if (
      !manifest ||
      (await shouldUpdateLanguage({
        liblabVersion: liblabConfig.liblabVersion,
        languageVersion: manifest.liblabVersion,
        language
      }))
    ) {
      languagesToUpdate.push(language)
    }
  }

  if (languagesToUpdate.length === 0) {
    return false
  }

  liblabConfig.languages = languagesToUpdate
  await fs.writeJson(LIBLAB_CONFIG_PATH, liblabConfig, { spaces: 2 })
  return true
}

async function fetchManifestForLanguage(
  language: Language,
  config: LibLabConfig
): Promise<Manifest | undefined> {
  try {
    const remoteManifestJson = await fetchFileFromBranch({
      owner: config.publishing.githubOrg,
      path: MANIFEST_PATH,
      repo: config.languageOptions[language].githubRepoName
    })

    return JSON.parse(remoteManifestJson)
  } catch (error) {
    console.log(
      `Unable to fetch .manifest.json file from ${config.publishing.githubOrg}/${config.languageOptions[language].githubRepoName}`
    )
  }
}

async function shouldUpdateLanguage(args: {
  liblabVersion: LiblabVersion
  language: Language
  languageVersion: string
}): Promise<boolean> {
  const { liblabVersion, language, languageVersion } = args

  // const [latestCodeGenVersion, latestSdkGenVersion] = await Promise.all([
  //   getLatestVersion(LIBLAB_OWNER, SdkEngines.CodeGen),
  //   getLatestVersion(LIBLAB_OWNER, SdkEngines.SdkGen)
  // ]);
  // TODO: @skos temporary change because I'm unable to use secrets for Liblabot GITHUB_TOKEN inside a composite Github Action
  const [latestCodeGenVersion, latestSdkGenVersion] = ['1.1.39', '2.0.17']

  const codeGenHasNewVersion = semver.gt(latestCodeGenVersion, languageVersion)
  const sdkGenHasNewVersion = semver.gt(latestSdkGenVersion, languageVersion)

  if (liblabVersion === '1') {
    return (
      (codeGenHasNewVersion &&
        isSupported(SdkEngines.CodeGen, language, liblabVersion)) ||
      (sdkGenHasNewVersion &&
        isSupported(SdkEngines.SdkGen, language, liblabVersion))
    )
  } else if (liblabVersion === '2') {
    return sdkGenHasNewVersion
  }

  throw new Error(
    `Unsupported liblabVersion: ${liblabVersion} in liblab.config.json.`
  )
}

function isSupported(
  sdkEngine: SdkEngines,
  language: Language,
  liblab: LiblabVersion
): boolean {
  try {
    return getSdkEngine(language, liblab) === sdkEngine
  } catch (e) {
    return false
  }
}

async function fetchFileFromBranch({
  owner,
  path,
  repo
}: {
  owner: string
  path: string
  repo: string
}): Promise<string> {
  const { data } = await octokit.repos.getContent({
    owner,
    path,
    repo
  })

  if (Array.isArray(data) || data.type !== 'file' || data.size === 0) {
    throw new Error(
      `Could not read content of file ${path} from repository ${repo}`
    )
  }

  return Buffer.from(data.content!, 'base64').toString('utf8')
}

async function getLatestVersion(
  owner: string,
  repository: string
): Promise<string> {
  try {
    const release = await getLatestRepoRelease({
      owner,
      repo: repository
    })

    console.log(`Latest ${owner}/${repository} release is ${release.tagName}`)

    return getVersionFromTagName(release.tagName)
  } catch (error) {
    console.log(error)
    throw new Error(
      `Unable to get latest release from repo ${owner}/${repository}`
    )
  }
}

/**
 * Parses a semantic versioning tag name in format of v0.0.1.
 * @param tagName tag name (e.g. v0.0.1)
 */
function getVersionFromTagName(tagName: string): string {
  const hasVersionPrefix =
    tagName && tagName.length > 1 && tagName.startsWith('v')

  return hasVersionPrefix ? tagName.substring(1) : tagName
}

async function getLatestRepoRelease(args: {
  owner: string
  repo: string
}): Promise<GitRepoRelease> {
  const { owner, repo } = args

  const { data: release, status } = await octokit.repos.getLatestRelease({
    owner,
    repo
  })

  if (status !== 200) {
    throw new Error(
      `Could not get latest release for repository: ${owner}/${repo}`
    )
  }

  return { tagName: release.tag_name }
}
