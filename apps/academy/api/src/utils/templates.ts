import fs from "fs/promises";
import { compile, type TemplateDelegate } from "handlebars";

export async function compileFileTemplate(
  fileName: string,
): Promise<TemplateDelegate> {
  const fileContent = await fs.readFile(fileName, "utf-8");
  return compileTemplate(fileContent);
}

export function compileTemplate(template: string): TemplateDelegate {
  return compile(template, {
    strict: true,
  });
}
