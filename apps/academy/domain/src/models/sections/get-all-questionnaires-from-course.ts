import type { UUID } from "@fabric/core";
import type { DomainStateStore } from "../../services/state-store.js";
import { ModuleModel } from "../module.js";
import { UnitModel } from "../unit.js";

export function getQuestionnairesFromCourse(
  state: DomainStateStore,
  courseId: UUID,
) {
  return state
    .from("questionnaireSections")
    .innerJoin({
      model: UnitModel,
      as: "u",
      on: { left: "unitId", right: "id" },
    })
    .innerJoin({
      model: ModuleModel,
      as: "m",
      on: { left: "u.moduleId", right: "id" },
    })
    .where({ "m.courseId": courseId, "m.deletedAt": undefined })
    .select(["id", "title", "version"]);
}

export function getQuestionnairesCountFromCourse(
  state: DomainStateStore,
  courseId: UUID,
) {
  return state
    .from("questionnaireSections")
    .innerJoin({
      model: UnitModel,
      as: "u",
      on: { left: "unitId", right: "id" },
    })
    .innerJoin({
      model: ModuleModel,
      as: "m",
      on: { left: "u.moduleId", right: "id" },
    })
    .where({ "m.courseId": courseId, "m.deletedAt": undefined })
    .count();
}
