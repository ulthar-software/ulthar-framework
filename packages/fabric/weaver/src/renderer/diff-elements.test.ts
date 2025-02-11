import { describe, expect, test } from "@fabric/testing";
import { diffElements } from "./diff-elements.js";
import { text, type WeaverElement } from "./element.js";
import { h1 } from "./headings.js";

describe("diffElements", () => {
  test("given identical elements, should return empty diff object", () => {
    const initialElement: WeaverElement = text("Hello, world!");
    const targetElement: WeaverElement = text("Hello, world!");

    const diff = diffElements(initialElement, targetElement);

    expect(diff).toEqual({});
  });

  test("given elements with different tags, should return diff object with the entire target element", () => {
    const initialElement: WeaverElement = h1({}, [text("Hello, world!")]);
    const targetElement: WeaverElement = text("Goodbye, world!");

    const diff = diffElements(initialElement, targetElement);

    expect(diff).toEqual(text("Goodbye, world!"));
  });

  test("given elements with the same tag but different text, should return diff object with only the target text", () => {
    const initialElement: WeaverElement = text("Hello, world!");
    const targetElement: WeaverElement = text("Goodbye, world!");

    const diff = diffElements(initialElement, targetElement);

    expect(diff).toEqual({
      text: "Goodbye, world!",
    });
  });

  test("given elements with the same tag but different attributes, should return diff object with the attributes diff", () => {
    const initialElement: WeaverElement = h1({ class: "title", id: "test" }, [
      text("Hello, world!"),
    ]);
    const targetElement: WeaverElement = h1({ class: "subtitle" }, [
      text("Hello, world!"),
    ]);

    const diff = diffElements(initialElement, targetElement);

    expect(diff).toEqual({
      attrs: {
        set: {
          class: "subtitle",
        },
        remove: ["id"],
      },
      children: [{}],
    });
  });

  test("given elements with the same tag but different children, should return diff object with the children diff", () => {
    const initialElement: WeaverElement = h1({}, [text("Hello, world!")]);
    const targetElement: WeaverElement = h1({}, [text("Goodbye, world!")]);

    const diff = diffElements(initialElement, targetElement);

    expect(diff).toEqual({
      children: [
        {
          text: "Goodbye, world!",
        },
      ],
      attrs: {
        set: {},
        remove: [],
      },
    });
  });
});
