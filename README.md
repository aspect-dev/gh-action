# Generate SDKs using latest Liblab and publish PRs

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)


The official Liblab SDK updates Github Action.

Generate SDKs using the latest Liblab versions and publish PRs directly to your SDK repositories.

## Usage:

Add this workflow to your control repository:

```yaml
name: Latest Liblab updates

on:
  workflow_dispatch:
  schedule:
    - cron: "0 11 * * *" # 11am UTC corresponds to 5am CST

jobs:
   build-sdks-and-publish-prs:
      name: Generate SDKs and create PRs
      runs-on: ubuntu-latest
      steps:
         - name: Checkout
           id: checkout
           uses: actions/checkout@v4

         - name: Build SDKs and publish PRs
           id: build_and_publish_prs
           uses: skosijer/gh-action@v1
           with:
              liblab_token: ${{ secrets.LIBLAB_TOKEN }}
              github_token: ${{ secrets.LIBLAB_GITHUB_TOKEN }}

         - name: Build status
           run: echo "Status is ${{ steps.build_and_publish_prs.outputs.status }}"

```
