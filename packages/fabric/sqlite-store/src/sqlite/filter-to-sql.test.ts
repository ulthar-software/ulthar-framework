import {
  defineCollection,
  Field,
  isGreaterOrEqualTo,
  isGreaterThan,
  isIn,
  isLessOrEqualTo,
  isLessThan,
  isLike,
  isNotEqualTo,
} from "@fabric/domain";
import { describe, expect, test } from "@fabric/testing";
import { filterToParams, filterToSQL } from "./filter-to-sql.ts";

describe("SQL where clause from filter options", () => {
  const col = defineCollection("users", {
    name: Field.string(),
    age: Field.integer(),
    status: Field.string(),
    salary: Field.decimal(),
    rating: Field.float(),
    quantity: Field.integer({
      isUnsigned: true,
    }),
    price: Field.decimal(),
  });

  test("should create a where clause from options with IN option", () => {
    const opts = {
      name: isIn(["John", "Jane"]),
    };
    const result = filterToSQL(opts);

    const params = filterToParams(col, opts);

    expect(result).toEqual("WHERE name IN ($where_name_0,$where_name_1)");
    expect(params).toEqual({ $where_name_0: "John", $where_name_1: "Jane" });
  });

  test("should create a where clause from options with LIKE option", () => {
    const opts = {
      name: isLike("%John%"),
    };
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual("WHERE name LIKE $where_name");
    expect(params).toEqual({ $where_name: "%John%" });
  });

  test("should create a where clause from options with EQUALS option", () => {
    const opts = {
      age: 25,
    };
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual("WHERE age = $where_age");
    expect(params).toEqual({ $where_age: 25 });
  });

  test("should create a where clause from options with NOT EQUALS option", () => {
    const opts = {
      status: isNotEqualTo("inactive"),
    };
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual("WHERE status <> $where_status");
    expect(params).toEqual({ $where_status: "inactive" });
  });

  test("should create a where clause from options with GREATER THAN option", () => {
    const opts = {
      salary: isGreaterThan(50000),
    };
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual("WHERE salary > $where_salary");
    expect(params).toEqual({ $where_salary: 50000 });
  });

  test("should create a where clause from options with LESS THAN option", () => {
    const opts = {
      rating: isLessThan(4.5),
    };
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual("WHERE rating < $where_rating");
    expect(params).toEqual({ $where_rating: 4.5 });
  });

  test("should create a where clause from options with GREATER THAN OR EQUALS option", () => {
    const opts = {
      quantity: isGreaterOrEqualTo(10),
    };
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual("WHERE quantity >= $where_quantity");
    expect(params).toEqual({ $where_quantity: 10 });
  });

  test("should create a where clause from options with LESS THAN OR EQUALS option", () => {
    const opts = {
      price: isLessOrEqualTo(100),
    };
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual("WHERE price <= $where_price");
    expect(params).toEqual({ $where_price: 100 });
  });

  test("should create a where clause from options with IS NULL option", () => {
    const opts = {
      price: undefined,
    };
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual("WHERE price IS NULL");
    expect(params).toEqual({});
  });

  test("should create a where clause from options with OR combination", () => {
    const opts = [
      {
        name: isIn(["John", "Jane"]),
        age: isGreaterThan(30),
      },
      {
        status: isNotEqualTo("inactive"),
        salary: isGreaterThan(50000),
      },
      {
        rating: isLessThan(4.5),
        quantity: isGreaterOrEqualTo(10),
      },
    ];
    const result = filterToSQL(opts);
    const params = filterToParams(col, opts);
    expect(result).toEqual(
      "WHERE (name IN ($where_name_0_0,$where_name_0_1) AND age > $where_age_0) OR (status <> $where_status_1 AND salary > $where_salary_1) OR (rating < $where_rating_2 AND quantity >= $where_quantity_2)",
    );
    expect(params).toEqual({
      $where_name_0_0: "John",
      $where_name_0_1: "Jane",
      $where_age_0: 30,
      $where_status_1: "inactive",
      $where_salary_1: 50000,
      $where_rating_2: 4.5,
      $where_quantity_2: 10,
    });
  });
});
