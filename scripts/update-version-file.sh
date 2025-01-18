#!/bin/bash

set -e

# Get the current location of this script
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname ${SOURCE_DIR})"

while [ "$1" != "" ]; do
  case $1 in
    -v | --version)
      shift
      VERSION=$1
      ;;
  esac
  if [ "$#" -gt 0 ]; then
    shift
  fi
done

# Assign values in order of precedence: flags > env vars > defaults
VERSION="${VERSION:-"${npm_package_version}"}"

echo "export const VERSION = '${VERSION}';" > electron/common/version.ts
