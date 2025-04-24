import type { UUID } from "@fabric/core";
import { Effect, UnexpectedError } from "@fabric/core";
import type { DomainStateStore } from "../../../../../services/state-store.js";

export function getMaxSectionOrder(
  state: DomainStateStore,
  unitId: UUID,
): Effect<number, UnexpectedError> {
  return Effect.all(() => [
    state.from("textSections").where({ unitId }).max("order"),
    state.from("videoSections").where({ unitId }).max("order"),
    state.from("questionnaireSections").where({ unitId }).max("order"),
  ])
    .mapError(() => new UnexpectedError())
    .map(([textMaxOrder, videoMaxOrder, questionnaireMaxOrder]) => {
      const maxOrder = Math.max(
        textMaxOrder,
        videoMaxOrder,
        questionnaireMaxOrder,
      );
      return maxOrder;
    });
}
