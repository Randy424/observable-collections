
#!/usr/bin/env bash

set -e # Exit immediately if a command returns a non-zero status.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $DIR/..

PATCH_VERSION=${1:-patch}

echo Publish: Checking for changes...

PACKAGE_NAME=`cat package.json | jq -r .name`
PUBLISHED_VERSION=`npm view ${PACKAGE_NAME} version`

npm version --no-git-tag-version $PUBLISHED_VERSION

PUBLISHED_SHA=`npm view ${PACKAGE_NAME} --json | jq .dist.shasum`
NEW_SHA=`npm publish --dry-run --json | jq .shasum`

if [ "$PUBLISHED_SHA" != "$NEW_SHA" ]; then 
    npm version $PATCH_VERSION --no-git-tag-version
    NEW_VERSION=`cat package.json | jq .name | tr -d '"'`

    echo Publish: Publishing ${NEW_VERSION}

    echo registry=http://registry.npmjs.org > .npmrc
    echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} >> .npmrc

    npm publish
else
    echo Publish: No changes detected
fi