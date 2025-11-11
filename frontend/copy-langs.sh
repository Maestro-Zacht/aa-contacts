#!/bin/bash

echo "Cleaning old translations."
rm -rf ../aa_contacts/static/aa_contacts/react/i18n

echo "Copying new translations."
# copy the image assets to the correct place.
cp -r i18n ../aa_contacts/static/aa_contacts/react/i18n
echo "Translations copied successfully."