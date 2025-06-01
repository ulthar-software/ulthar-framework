import {
  Field,
  isGreaterOrEqualTo,
  isGreaterThan,
  isIn,
  isLessOrEqualTo,
  isLessThan,
  isLike,
  isNotEqualTo,
  isNotIn,
  Model,
  PosixDate,
} from "@fabric/core";
import { describe, expect, test } from "@fabric/testing";
import { filterToParams, filterToSQL } from "./filter-to-sql.js";

describe("SQL where clause from filter options", () => {
  const model = new Model("users", {
    id: Field.uuid({ isPrimaryKey: true }),
    name: Field.string(),
    age: Field.integer(),
    status: Field.string(),
    salary: Field.decimal(),
    rating: Field.float(),
    quantity: Field.integer({
      isUnsigned: true,
    }),
    price: Field.decimal(),
    createdAt: Field.posixDate(),
  });

  const otherModel = new Model("other", {
    id: Field.uuid({ isPrimaryKey: true }),
    userId: Field.uuid(),
  });

  test("should create a where clause from options with IN option", () => {
    const opts = {
      name: isIn(["John", "Jane"]),
    };
    const result = filterToSQL(model, opts);

    const params = filterToParams(model, [], opts);

    expect(result).toEqual(
      "WHERE `users`.`name` IN ($where_users_name_0,$where_users_name_1)",
    );
    expect(params).toEqual({
      where_users_name_0: "John",
      where_users_name_1: "Jane",
    });
  });

  test("should create a where clause from options with NOT IN option", () => {
    const opts = {
      name: isNotIn(["John", "Jane"]),
    };
    const result = filterToSQL(model, opts);

    const params = filterToParams(model, [], opts);

    expect(result).toEqual(
      "WHERE `users`.`name` NOT IN ($where_users_name_0,$where_users_name_1)",
    );
    expect(params).toEqual({
      where_users_name_0: "John",
      where_users_name_1: "Jane",
    });
  });

  test("should work properly when fields have '.' in their names", () => {
    const opts = {
      "t.option": 25,
    };
    const result = filterToSQL(model, opts);

    const jointModel = new Model("test", {
      option: Field.integer(),
    });

    const params = filterToParams(
      model,
      [
        {
          model: jointModel,
          as: "t",
          on: {
            left: "users.id",
            right: "t.user_id",
          },
        },
      ],
      opts,
    );

    expect(result).toEqual("WHERE `t`.`option` = $where_t_option");
    expect(params).toEqual({ where_t_option: 25 });
  });

  test("should create a where clause from options with LIKE option", () => {
    const opts = {
      name: isLike("%John%"),
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual("WHERE `users`.`name` LIKE $where_users_name");
    expect(params).toEqual({ where_users_name: "%John%" });
  });

  test("should create a where clause from options with EQUALS option", () => {
    const opts = {
      age: 25,
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual("WHERE `users`.`age` = $where_users_age");
    expect(params).toEqual({ where_users_age: 25 });
  });

  test("should create a where clause from options with NOT EQUALS option", () => {
    const opts = {
      status: isNotEqualTo("inactive"),
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual("WHERE `users`.`status` <> $where_users_status");
    expect(params).toEqual({ where_users_status: "inactive" });
  });

  test("should create a where clause from options with GREATER THAN option", () => {
    const opts = {
      salary: isGreaterThan(50000),
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual("WHERE `users`.`salary` > $where_users_salary");
    expect(params).toEqual({ where_users_salary: 50000 });
  });

  test("should create a where clause from options with LESS THAN option", () => {
    const opts = {
      rating: isLessThan(4.5),
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual("WHERE `users`.`rating` < $where_users_rating");
    expect(params).toEqual({ where_users_rating: 4.5 });
  });

  test("should create a where clause from options with GREATER THAN OR EQUALS option", () => {
    const opts = {
      quantity: isGreaterOrEqualTo(10),
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual("WHERE `users`.`quantity` >= $where_users_quantity");
    expect(params).toEqual({ where_users_quantity: 10 });
  });

  test("should create a where clause from options with LESS THAN OR EQUALS option", () => {
    const opts = {
      price: isLessOrEqualTo(100),
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual("WHERE `users`.`price` <= $where_users_price");
    expect(params).toEqual({ where_users_price: 100 });
  });

  test("should create a where clause from options with LESS THAN OR EQUALS option when the field type is a date", () => {
    const opts = {
      createdAt: isLessOrEqualTo(new PosixDate(1627849200000)),
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual(
      "WHERE `users`.`createdAt` <= $where_users_createdAt",
    );
    expect(params).toEqual({ where_users_createdAt: 1627849200000 });
  });

  test("should create a where clause from options with IS NULL option", () => {
    const opts = {
      price: undefined,
    };
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual("WHERE `users`.`price` IS NULL");
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
    const result = filterToSQL(model, opts);
    const params = filterToParams(model, [], opts);
    expect(result).toEqual(
      "WHERE (`users`.`name` IN ($where_users_name_0_0,$where_users_name_0_1) AND `users`.`age` > $where_users_age_0) OR (`users`.`status` <> $where_users_status_1 AND `users`.`salary` > $where_users_salary_1) OR (`users`.`rating` < $where_users_rating_2 AND `users`.`quantity` >= $where_users_quantity_2)",
    );
    expect(params).toEqual({
      where_users_name_0_0: "John",
      where_users_name_0_1: "Jane",
      where_users_age_0: 30,
      where_users_status_1: "inactive",
      where_users_salary_1: 50000,
      where_users_rating_2: 4.5,
      where_users_quantity_2: 10,
    });
  });

  test("should handle ambiguous column names in joins", () => {
    const opts = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      "other.userId": isIn(["123e4567-e89b-12d3-a456-426614174000"]),
    };
    const result = filterToSQL(model, opts);

    const params = filterToParams(
      model,
      [
        {
          model: otherModel,
          as: "other",
          on: {
            left: "id",
            right: "other.userId",
          },
        },
      ],
      opts,
    );

    expect(result).toEqual(
      "WHERE `users`.`id` = $where_users_id AND `other`.`userId` IN ($where_other_userId_0)",
    );
    expect(params).toEqual({
      where_users_id: "123e4567-e89b-12d3-a456-426614174000",
      where_other_userId_0: "123e4567-e89b-12d3-a456-426614174000",
    });
  });
});
