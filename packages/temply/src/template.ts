export class Template {
    constructor(private template: string) {}

    render(context?: Record<string, any>) {
        let result = this.template;

        const pattern = /{{(.*?)}}/g;

        let matches = pattern.exec(this.template);

        if (!matches) return result;

        while (matches) {
            const key = matches[1];

            if (!context)
                throw new Error(`Missing context when '${key}' is required`);

            const value = context[key];

            if (!value) {
                throw new Error(`Missing required key '${key}' in context`);
            }

            result = result.replace(matches[0], value.toString());

            matches = pattern.exec(this.template);
        }

        return result;
    }
}
