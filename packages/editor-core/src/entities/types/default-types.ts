import { GenericType } from "./generic-type.js";
import { Type } from "./type.js";

export const DefaultTypes = [
    new Type("string"),
    new Type("int"),
    new Type("float"),
    new Type("double"),
    new Type("decimal"),
    new Type("unknown"),
    new GenericType("array", ["T"]),
    new GenericType("set", ["T"]),
    new GenericType("record", ["K", "T"]),
    new GenericType("map", ["K", "T"]),
];
