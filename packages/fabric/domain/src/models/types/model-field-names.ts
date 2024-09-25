import { CustomModelFields } from "../model.js";

export type ModelFieldNames<TModel extends CustomModelFields> = keyof TModel;
