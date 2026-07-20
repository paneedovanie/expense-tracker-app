#!/bin/bash
REPO_ROOT="$(git rev-parse --show-toplevel)"

VERSION=$(node -e "const app = require('$REPO_ROOT/app.json'); console.log(app.expo.version)")
IFS='.' read -ra PARTS <<< "$VERSION"
MAJOR="${PARTS[0]}"
MINOR="${PARTS[1]}"
PATCH=$((PARTS[2] + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
VERSION_CODE="$PATCH"

node -e "
const fs = require('fs');
const app = JSON.parse(fs.readFileSync('$REPO_ROOT/app.json', 'utf8'));
app.expo.version = '$NEW_VERSION';
if (!app.expo.android) app.expo.android = {};
app.expo.android.versionCode = $VERSION_CODE;
fs.writeFileSync('$REPO_ROOT/app.json', JSON.stringify(app, null, 2) + '\n');
"

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$REPO_ROOT/package.json', 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync('$REPO_ROOT/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

node -e "
const fs = require('fs');
let plist = fs.readFileSync('$REPO_ROOT/ios/ExpenseTrackerApp/Info.plist', 'utf8');
plist = plist.replace(/(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*(<\/string>)/, '\$1$NEW_VERSION\$2');
plist = plist.replace(/(<key>CFBundleVersion<\/key>\s*<string>)[^<]*(<\/string>)/, '\$1$VERSION_CODE\$2');
fs.writeFileSync('$REPO_ROOT/ios/ExpenseTrackerApp/Info.plist', plist);
"

node -e "
const fs = require('fs');
let gradle = fs.readFileSync('$REPO_ROOT/android/app/build.gradle', 'utf8');
gradle = gradle.replace(/(versionCode\s+)\d+/, '\$1$VERSION_CODE');
gradle = gradle.replace(/(versionName\s+)\"[^\"]+\"/, '\$1\"$NEW_VERSION\"');
fs.writeFileSync('$REPO_ROOT/android/app/build.gradle', gradle);
"

echo "Bumped version: $VERSION -> $NEW_VERSION, versionCode -> $VERSION_CODE"