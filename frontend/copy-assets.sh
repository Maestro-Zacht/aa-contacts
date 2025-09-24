#!/bin/bash

echo "Cleaning old assets."
rm -rf ../aa_contacts/static/aa_contacts/react/

echo "Copying new assets."
mkdir -p ../aa_contacts/static/aa_contacts/react
cp -r dist/static/aa_contacts/react ../aa_contacts/static/aa_contacts/react
cp -r dist/assets ../aa_contacts/static/aa_contacts/react/assets

cp dist/.vite/manifest.json ../aa_contacts/static/aa_contacts/react/manifest.json

echo "Assets copied successfully."
