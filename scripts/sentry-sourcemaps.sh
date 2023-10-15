#!/bin/bash

set -e

# Get the current location of this script
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname ${SOURCE_DIR})"
BUILD_DIR="${ROOT_DIR}/electron/build"

if [ -f "${ROOT_DIR}/.env" ]; then
  source ${ROOT_DIR}/.env
fi

if [ -z "${SENTRY_AUTH_TOKEN}" ]; then
  echo "SENTRY_AUTH_TOKEN is not set"
  exit 1
fi

if [ -z "${SENTRY_ORG}" ]; then
  echo "SENTRY_ORG is not set"
  exit 1
fi

if [ -z "${SENTRY_PROJECT}" ]; then
  echo "SENTRY_PROJECT is not set"
  exit 1
fi

if [ ! -d "${BUILD_DIR}" ]; then
  echo "BUILD_DIR does not exist: ${BUILD_DIR}"
  echo "Run 'yarn build' first"
  exit 1
fi

echo "[sentry] Injecting debug ids into sourcemaps..."
npx sentry-cli sourcemaps inject \
  --auth-token ${SENTRY_AUTH_TOKEN} \
  --org ${SENTRY_ORG} \
  --project ${SENTRY_PROJECT} \
  --quiet \
  ${BUILD_DIR} 1> /dev/null

echo "[sentry] Uploading sourcemaps..."
npx sentry-cli sourcemaps upload \
  --auth-token ${SENTRY_AUTH_TOKEN} \
  --org ${SENTRY_ORG} \
  --project ${SENTRY_PROJECT} \
  --quiet \
  ${BUILD_DIR} 1> /dev/null
