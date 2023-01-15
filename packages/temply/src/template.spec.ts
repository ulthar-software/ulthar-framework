import { Template } from "./template";

describe("Template", () => {
    it("should define a template and render it successfully", () => {
        const template = new Template("Hello, {{name}}!");
        const result = template.render({ name: "CoolGuy69" });
        expect(result).toBe("Hello, CoolGuy69!");
    });

    it("should render successfully given any number of appearances of key", () => {
        const template = new Template(
            "Hello, {{name}}! {{name}}... Nice to meet you, {{name}}!"
        );
        const result = template.render({ name: "CoolGuy69" });
        expect(result).toBe(
            "Hello, CoolGuy69! CoolGuy69... Nice to meet you, CoolGuy69!"
        );
    });

    it("should define a template with multiple keys and render it successfully", () => {
        const template = new Template(
            "Hello, {{name}}! Thats a cool {{thing}}"
        );
        const result = template.render({ name: "CoolGuy69", thing: "name" });
        expect(result).toBe("Hello, CoolGuy69! Thats a cool name");
    });

    it("should fail if a key is missing from context", () => {
        const template = new Template(
            "Hello, {{name}}! Thats a cool {{thing}}"
        );
        expect(() => {
            const result = template.render({ name: "CoolGuy69" });
        }).toThrow();
    });

    it("should fail if there are keys but no context provided", () => {
        const template = new Template(
            "Hello, {{name}}! Thats a cool {{thing}}"
        );
        expect(() => {
            const result = template.render();
        }).toThrow();
    });

    it("should render the template as is if no context required", () => {
        const template = new Template("Hello, guy! Thats a cool shirt");
        const result = template.render();
        expect(result).toBe("Hello, guy! Thats a cool shirt");
    });
});
