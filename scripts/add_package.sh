#! /bin/bash
set -e

if [ -z "$1" ]; then
    echo "Please provide a package name"
    exit 1
fi

yarn packages/$1 init

cp -r templates/lib-template/* packages/$1

#for each file in the template
for file in ./packages/$1/*; do
  #replace the template name with the package name
  if [ -f "$file" ]; then
      sed -i "s/lib-template/$1/g" $file
  fi
done

yarn install

