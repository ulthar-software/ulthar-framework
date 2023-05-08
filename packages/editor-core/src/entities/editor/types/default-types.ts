import { GenericType } from "./generic-type.js";
import { Type } from "./type.js";

export const DefaultTypes = {
    string: new Type("string"),
    int: new Type("int"),
    float: new Type("float"),
    double: new Type("double"),
    decimal: new Type("decimal"),
    unkown: new Type("unknown"),
    void: new Type("void"),
    Array: new GenericType("Array", ["T"]),
    Set: new GenericType("Set", ["T"]),
    Record: new GenericType("Record", ["K", "T"]),
    Map: new GenericType("Map", ["K", "T"]),
    Promise: new GenericType("Promise", ["T"]),
};
