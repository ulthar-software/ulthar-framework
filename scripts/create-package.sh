yarn packages/$1 init
cp packages/package-template/* packages/$1 -r
sed -i "s/package-template/$1/g" packages/$1/README.md
sed -i "s/package-template/$1/g" packages/$1/package.json