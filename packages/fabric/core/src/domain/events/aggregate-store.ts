/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Effect } from "../../effect/effect.js";
import type { TaggedError } from "../../error/tagged-error.js";
import type { CircularDependencyError } from "../../utils/sort-by-dependencies.js";
import type { StoreQueryError } from "../value-store/index.js";
import type { ValueStoreDriver } from "../value-store/value-store-driver.js";
import { ReadonlyValueStore } from "../value-store/value-store.js";
import type { EventStore } from "./event-store.js";
import type { EventStream } from "./event-stream.js";
import type { AggregateProjector } from "./projector.js";

export class AggregateStore<
  TProjectors extends readonly AggregateProjector[],
  TModels extends TProjectors[number]["model"],
  TEventStreams extends readonly EventStream[],
> extends ReadonlyValueStore<TModels> {
  constructor(
    storageDriver: ValueStoreDriver,
    private readonly eventStore: EventStore<TEventStreams>,
    private readonly projectors: TProjectors,
  ) {
    super(
      storageDriver,
      projectors.map((projector) => projector.model as TModels),
    );

    for (const projector of projectors) {
      for (const event of projector.events) {
        eventStore.subscribe(
          event.name,
          (e) => {
            return this.from(projector.model.name)
              .where({ id: e.streamId } as any)
              .selectOne()
              .flatMap((aggregate) => {
                let result: any;
                if (aggregate.isNothing()) {
                  //@ts-expect-error aggregate is nothing, so we call the create projector without the second argument
                  result = projector.projections[event.name](e);
                  return this.driver.insert(projector.model, {
                    into: projector.model.name,
                    values: [result],
                  });
                }

                result = projector.projections[event.name](e, aggregate.value!);

                if (result === null) {
                  return this.driver.delete(projector.model, {
                    from: projector.model.name,
                    where: { id: e.streamId },
                  });
                }

                return this.driver.update(projector.model, {
                  table: projector.model.name,
                  set: result,
                  where: { id: e.streamId },
                });
              });
          },
          {
            callOnReplay: true,
          },
        );
      }
    }
  }

  sync(): Effect<void, CircularDependencyError | StoreQueryError> {
    return this.eventStore.sync().flatMap(() => this.driver.sync(this.models));
  }

  clearAndReplay(): Effect<
    void,
    CircularDependencyError | StoreQueryError | TaggedError
  > {
    return this.driver
      .sync(this.models)
      .flatMap(() => this.eventStore.replayAll());
  }
}
