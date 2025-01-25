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

# Update version that is referenced in the code
echo "export const VERSION = '${VERSION}';" > electron/common/version.ts

# Rename dist files since they were built before the version was ticked
find "$ROOT_DIR/dist" -type f | while read -r file; do
  if [[ $file =~ (.*)-v[0-9]+\.[0-9]+\.[0-9]+-(.*) ]]; then
    new_file="${BASH_REMATCH[1]}-v${VERSION}-${BASH_REMATCH[2]}"
    mv "$file" "$new_file"
  fi
done
