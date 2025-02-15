#!/bin/bash

while [[ $(git log -1 --pretty=%B) =~ WIP ]]; do
    echo "Resetting WIP commit: $(git log -1 --pretty=%B)"
    git reset --soft HEAD~1
done
echo "No more WIP commits found"