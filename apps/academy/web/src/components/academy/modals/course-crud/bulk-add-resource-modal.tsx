import type { SchemaParsingError } from "@fabric/core";
import { Effect, JSONParsingError, Result, type UUID } from "@fabric/core";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, TextArea } from "../../../forms/index";
import { Button } from "../../../ui/button.tsx";
import type { BulkResource, BulkResourceAddPayload } from "./schemas.ts";
import { bulkResourceAddSchema, bulkResourceSchema } from "./schemas.ts";

export interface BulkAddResourceModalProps {
  courseId: UUID;
  closeModal: () => void;
  refresh: () => Promise<void>;
}

export function BulkAddResourceModal({
  courseId,
  closeModal,
  refresh,
}: BulkAddResourceModalProps) {
  const addResourceCommand = useRPC("addResourceToCourse");
  const getTagsCommand = useRPC("getTags");
  const createTagCommand = useRPC("createTag");

  const handleAddResource = async ({
    json,
  }: BulkResourceAddPayload): Promise<void> => {
    const parseResult = await Effect.tryFrom(
      () => JSON.parse(json) as unknown,
      (e: Error) => new JSONParsingError(e.message),
    )
      .mapResult(
        (
          result,
        ): Result<
          BulkResource[],
          JSONParsingError | SchemaParsingError<typeof bulkResourceSchema>
        > => {
          console.log("Raw JSON result:", result);

          if (!Array.isArray(result)) {
            return Result.failWith(
              new JSONParsingError("El JSON debe ser un array de recursos."),
            );
          }

          const items: BulkResource[] = [];

          for (const item of result) {
            const parsedResult = bulkResourceSchema.parse(item);
            if (parsedResult.isError()) {
              return parsedResult;
            }
            items.push(parsedResult.unwrapOrThrow());
          }

          return Result.ok(items);
        },
      )
      .run();

    console.log("Parsed JSON:", parseResult);

    if (parseResult.isError()) {
      console.error("Error parsing JSON:", parseResult.value);

      showErrorToast(
        "Error al procesar el JSON. Asegúrate de que tenga el formato correcto.",
      );
      return;
    }

    console.log(parseResult);

    const resourcePayloads = parseResult.unwrapOrThrow();

    const tagsResult = await getTagsCommand({ limit: -1 });

    if (tagsResult.isError()) {
      showErrorToast(
        "Hubo un error al obtener las etiquetas. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    const existingTags = new Map<string, UUID>(
      tagsResult
        .unwrapOrThrow()
        .tags.map((tag) => [tag.name.toLowerCase(), tag.id]),
    );

    for (const resource of resourcePayloads) {
      const tagIds: UUID[] = [];
      for (const tag of resource.tags) {
        if (!existingTags.has(tag.toLowerCase())) {
          const createTagResult = await createTagCommand({ name: tag });

          if (createTagResult.isError()) {
            showErrorToast(
              `Hubo un error al crear la etiqueta "${tag}". Por favor, inténtalo de nuevo más tarde.`,
            );
            return;
          }
          const createdTagId = createTagResult.unwrapOrThrow().tagId;

          existingTags.set(tag.toLowerCase(), createdTagId);
          tagIds.push(createdTagId);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          tagIds.push(existingTags.get(tag.toLowerCase())!);
        }
      }

      const result = await addResourceCommand({
        courseId,
        ...resource,
        tagIds,
      });

      if (result.isError()) {
        showErrorToast(
          "Hubo un error al agregar una de las unidades. Por favor, inténtalo de nuevo más tarde.",
        );
        return;
      }
    }

    void refresh();
    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Agregar unidades</h2>
      <Form
        schema={bulkResourceAddSchema}
        onSubmit={handleAddResource}
        className="flex flex-col gap-4"
      >
        <TextArea name="json" label="Recursos en formato JSON" />

        <div className="flex justify-end gap-2">
          <Button onClick={closeModal} className="bg-gray-500 text-white">
            Cancelar
          </Button>
          <FormButton className="bg-primary text-white">Agregar</FormButton>
        </div>
      </Form>
    </div>
  );
}
