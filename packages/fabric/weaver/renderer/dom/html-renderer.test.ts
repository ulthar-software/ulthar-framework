import { describe, expect, fnMock, test } from "@fabric/testing";
import { Window as HappyDomWindow } from "npm:happy-dom";
import { WeaverDocument } from "../../document.ts";
import { text } from "../element.ts";
import { h1 } from "../headings.ts";
import { HTMLRenderer } from "./html-renderer.ts";

describe("HTMLRenderer", () => {
  const window = new HappyDomWindow();
  const mockDocument: Document = window.document as unknown as Document;

  test("should render a simple document", () => {
    const fn = fnMock();

    const renderer = new HTMLRenderer(mockDocument, fn);

    const document: WeaverDocument = {
      title: "Hello",
      meta: {
        description: "World",
      },
      body: [
        h1({}, [text("Hello, World")]),
      ],
    };

    renderer.renderView(document);

    expect(mockDocument.title).toBe("Hello");
    expect(
      mockDocument.head.querySelector("meta[name=description]")?.getAttribute(
        "content",
      ),
    ).toBe("World");
    expect(mockDocument.body.innerHTML).toBe("<h1>Hello, World</h1>");
  });

  test("should update the view when the document changes", () => {
    const fn = fnMock();

    const renderer = new HTMLRenderer(mockDocument, fn);

    const initialDocument: WeaverDocument = {
      title: "Hello",
      meta: {},
      body: [
        h1({}, [text("Hello, World")]),
      ],
    };

    renderer.renderView(initialDocument);

    const updatedDocument: WeaverDocument = {
      title: "Goodbye",
      meta: {},
      body: [
        h1({}, [text("Goodbye, Universe")]),
      ],
    };

    renderer.renderView(updatedDocument);

    expect(mockDocument.title).toBe("Goodbye");
    expect(mockDocument.body.innerHTML).toBe("<h1>Goodbye, Universe</h1>");
  });

  test("should update the view when the document changes for a second time", () => {
    const fn = fnMock();

    const renderer = new HTMLRenderer(mockDocument, fn);

    const initialDocument: WeaverDocument = {
      title: "Hello",
      meta: {},
      body: [
        h1({}, [text("Hello, World")]),
      ],
    };

    renderer.renderView(initialDocument);

    const updatedDocument: WeaverDocument = {
      title: "Goodbye",
      meta: {},
      body: [
        h1({}, [text("Goodbye, Universe")]),
      ],
    };

    renderer.renderView(updatedDocument);

    const updatedDocument2: WeaverDocument = {
      title: "Hello",
      meta: {},
      body: [
        h1({}, [text("Hello, World")]),
      ],
    };

    renderer.renderView(updatedDocument2);

    expect(mockDocument.title).toBe("Hello");
    expect(mockDocument.body.innerHTML).toBe("<h1>Hello, World</h1>");
  });

  // test("Given a document with an effect, the effect gets hooked up to the correct event", () => {
  //   const renderer = new HTMLRenderer(mockDocument);

  //   const fn = fnMock();

  //   const document: WeaverDocument = {
  //     title: "Hello",
  //     meta: {},
  //     body: [
  //       h1({
  //         onClick: () => Effect.from(fn),
  //       }, [text("Hello, World")]),
  //     ],
  //   };

  //   renderer.renderView(document);

  //   const h1Element = mockDocument.body.querySelector("h1")!;
  //   h1Element.dispatchEvent(new Event("click"));

  //   expect(fn).toHaveBeenCalledWith();
  // });
});
