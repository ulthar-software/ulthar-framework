import "zx/globals";

if (process.argv.length < 3) {
  console.log("Usage: add-package.ts <package-name>");
  process.exit(1);
}

const packagePath = process.argv[2];

const packageName = path.basename(packagePath);

await $`yarn packages/${packagePath} init`;

await $`cp -r packages/templates/lib/* packages/${packagePath}`;

await Promise.all(
  fs.readdirSync(`packages/${packagePath}`).map(async (file) => {
    if (fs.statSync(`packages/${packagePath}/${file}`).isFile()) {
      await $`sed -i 's/lib-template/${packageName}/g' packages/${packagePath}/${file}`;
    }
  }),
);

await $`yarn install`;
