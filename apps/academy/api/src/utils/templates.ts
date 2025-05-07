import fs from "fs/promises";
import Handlebars, { type TemplateDelegate } from "handlebars";

export async function compileFileTemplate(
  fileName: string,
): Promise<TemplateDelegate> {
  const fileContent = await fs.readFile(fileName, "utf-8");
  return compileTemplate(fileContent);
}

export function compileTemplate(template: string): TemplateDelegate {
  return Handlebars.compile(template, {
    strict: true,
  });
}
