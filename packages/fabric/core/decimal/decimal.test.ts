import { describe, expect, test } from "@fabric/testing";
import { Decimal } from "./decimal.ts";

describe("Decimal", () => {
  test("negate", () => {
    const vectors = [
      { mantissa: 123n, exponent: 1 },
      { mantissa: 123n, exponent: 0 },
      { mantissa: 123n, exponent: -1 },
      { mantissa: 0n, exponent: 0 },
    ];
    for (const { mantissa, exponent } of vectors) {
      expect(new Decimal(mantissa, exponent).neg()).toEqual(
        new Decimal(-mantissa, exponent),
      );
      expect(new Decimal(-mantissa, exponent).neg()).toEqual(
        new Decimal(mantissa, exponent),
      );
    }
  });

  test("from", () => {
    const vectors = [
      { input: 123, mantissa: 123n, exponent: 0 },
      { input: 123.45, mantissa: 12345n, exponent: -2 },
      { input: "123.45", mantissa: 12345n, exponent: -2 },
      { input: 123n, mantissa: 123n, exponent: 0 },
      { input: 120n, mantissa: 12n, exponent: 1 },
      { input: 0n, mantissa: 0n, exponent: 0 },
      { input: Decimal.from(123), mantissa: 123n, exponent: 0 },
      { input: Decimal.from("123.45"), mantissa: 12345n, exponent: -2 },
      { input: "123", mantissa: 123n, exponent: 0 },
      { input: "120", mantissa: 12n, exponent: 1 },
      { input: "0", mantissa: 0n, exponent: 0 },
      { input: "123.0", mantissa: 123n, exponent: 0 },
      { input: "120.0", mantissa: 12n, exponent: 1 },
      { input: "0.0", mantissa: 0n, exponent: 0 },
      { input: "123.45", mantissa: 12345n, exponent: -2 },
      { input: "123e2", mantissa: 123n, exponent: 2 },
      { input: "1.23e1", mantissa: 123n, exponent: -1 },
      { input: "123e-2", mantissa: 123n, exponent: -2 },
      { input: "1230e-2", mantissa: 123n, exponent: -1 },
      { input: "1.23e-2", mantissa: 123n, exponent: -4 },
      {
        input: "123456789.123456789123456789",
        mantissa: 123456789123456789123456789n,
        exponent: -18,
      },
    ];
    for (const { input, mantissa, exponent } of vectors) {
      const value = Decimal.from(input);
      expect(value.mantissa).toEqual(mantissa);
      expect(value.exponent).toEqual(exponent);
    }
  });

  test("toString", () => {
    const vectors = [
      { input: Decimal.from(123), output: "123" },
      { input: Decimal.from(12.30), output: "12.3" },
      { input: Decimal.from(0.123), output: "0.123" },
      { input: Decimal.from(0.0123), output: "0.0123" },
      {
        input: Decimal.from("123456789.123456789123456789"),
        output: "123456789.123456789123456789",
      },
    ];
    for (const { input, output } of vectors) {
      const vectors = [{ input, output }, {
        input: input.neg(),
        output: `-${output}`,
      }];
      for (const { input, output } of vectors) {
        expect(input.toString()).toEqual(output);
      }
    }
  });

  test("floor", () => {
    const vectors = [
      { input: Decimal.from(13), output: Decimal.from(13) },
      { input: Decimal.from(12.7), output: Decimal.from(12) },
      { input: Decimal.from(12.5), output: Decimal.from(12) },
      { input: Decimal.from(12.3), output: Decimal.from(12) },
      { input: Decimal.from(0), output: Decimal.from(0) },
      { input: Decimal.from(-12.3), output: Decimal.from(-13) },
      { input: Decimal.from(-12.5), output: Decimal.from(-13) },
      { input: Decimal.from(-12.7), output: Decimal.from(-13) },
      { input: Decimal.from(-13), output: Decimal.from(-13) },
      {
        input: Decimal.from(5.1),
        precision: Decimal.from(0.3),
        output: Decimal.from(5.1),
      },
      {
        input: Decimal.from(5),
        precision: Decimal.from(0.3),
        output: Decimal.from(4.8),
      },
      {
        input: Decimal.from(4.95),
        precision: Decimal.from(0.3),
        output: Decimal.from(4.8),
      },
      {
        input: Decimal.from(4.9),
        precision: Decimal.from(0.3),
        output: Decimal.from(4.8),
      },
      {
        input: Decimal.from(0),
        precision: Decimal.from(0.3),
        output: Decimal.from(0),
      },
      {
        input: Decimal.from(-4.9),
        precision: Decimal.from(0.3),
        output: Decimal.from(-5.1),
      },
      {
        input: Decimal.from(-4.95),
        precision: Decimal.from(0.3),
        output: Decimal.from(-5.1),
      },
      {
        input: Decimal.from(-5),
        precision: Decimal.from(0.3),
        output: Decimal.from(-5.1),
      },
      {
        input: Decimal.from(-5.1),
        precision: Decimal.from(0.3),
        output: Decimal.from(-5.1),
      },
    ];
    for (const { input, precision, output } of vectors) {
      expect(input.floor(precision)).toEqual(output);
    }
  });

  test("ceil", () => {
    const vectors = [
      { input: Decimal.from(13), output: Decimal.from(13) },
      { input: Decimal.from(12.7), output: Decimal.from(13) },
      { input: Decimal.from(12.5), output: Decimal.from(13) },
      { input: Decimal.from(12.3), output: Decimal.from(13) },
      { input: Decimal.from(0), output: Decimal.from(0) },
      { input: Decimal.from(-12.3), output: Decimal.from(-12) },
      { input: Decimal.from(-12.5), output: Decimal.from(-12) },
      { input: Decimal.from(-12.7), output: Decimal.from(-12) },
      { input: Decimal.from(-13), output: Decimal.from(-13) },
      {
        input: Decimal.from(5.1),
        precision: Decimal.from(0.3),
        output: Decimal.from(5.1),
      },
      {
        input: Decimal.from(5),
        precision: Decimal.from(0.3),
        output: Decimal.from(5.1),
      },
      {
        input: Decimal.from(4.95),
        precision: Decimal.from(0.3),
        output: Decimal.from(5.1),
      },
      {
        input: Decimal.from(4.9),
        precision: Decimal.from(0.3),
        output: Decimal.from(5.1),
      },
      {
        input: Decimal.from(0),
        precision: Decimal.from(0.3),
        output: Decimal.from(0),
      },
      {
        input: Decimal.from(-4.9),
        precision: Decimal.from(0.3),
        output: Decimal.from(-4.8),
      },
      {
        input: Decimal.from(-4.95),
        precision: Decimal.from(0.3),
        output: Decimal.from(-4.8),
      },
      {
        input: Decimal.from(-5),
        precision: Decimal.from(0.3),
        output: Decimal.from(-4.8),
      },
      {
        input: Decimal.from(-5.1),
        precision: Decimal.from(0.3),
        output: Decimal.from(-5.1),
      },
    ];
    for (const { input, precision, output } of vectors) {
      expect(input.ceil(precision)).toEqual(output);
    }
  });

  test("round", () => {
    const vectors = [
      { input: Decimal.from(13), output: Decimal.from(13) },
      { input: Decimal.from(12.7), output: Decimal.from(13) },
      { input: Decimal.from(12.5), output: Decimal.from(13) },
      { input: Decimal.from(12.3), output: Decimal.from(12) },
      { input: Decimal.from(0), output: Decimal.from(0) },
      { input: Decimal.from(-12.3), output: Decimal.from(-12) },
      { input: Decimal.from(-12.5), output: Decimal.from(-12) },
      { input: Decimal.from(-12.7), output: Decimal.from(-13) },
      { input: Decimal.from(-13), output: Decimal.from(-13) },
      {
        input: Decimal.from(5.1),
        precision: Decimal.from(0.3),
        output: Decimal.from(5.1),
      },
      {
        input: Decimal.from(5),
        precision: Decimal.from(0.3),
        output: Decimal.from(5.1),
      },
      {
        input: Decimal.from(4.95),
        precision: Decimal.from(0.3),
        output: Decimal.from(5.1),
      },
      {
        input: Decimal.from(4.9),
        precision: Decimal.from(0.3),
        output: Decimal.from(4.8),
      },
      {
        input: Decimal.from(0),
        precision: Decimal.from(0.3),
        output: Decimal.from(0),
      },
      {
        input: Decimal.from(-4.9),
        precision: Decimal.from(0.3),
        output: Decimal.from(-4.8),
      },
      {
        input: Decimal.from(-4.95),
        precision: Decimal.from(0.3),
        output: Decimal.from(-4.8),
      },
      {
        input: Decimal.from(-5),
        precision: Decimal.from(0.3),
        output: Decimal.from(-5.1),
      },
      {
        input: Decimal.from(-5.1),
        precision: Decimal.from(0.3),
        output: Decimal.from(-5.1),
      },
    ];
    for (const { input, precision, output } of vectors) {
      expect(input.round(precision)).toEqual(output);
    }
  });

  test("toFixed", () => {
    const vectors = [
      { input: Decimal.from(123), precision: 0, output: "123" },
      { input: Decimal.from(123), precision: 1, output: "123.0" },
      { input: Decimal.from(123.8), precision: 0, output: "124" },
      { input: Decimal.from(123.45), precision: 1, output: "123.5" },
    ];
    for (const { input, precision, output } of vectors) {
      const vectors = [{ input, output }, {
        input: input.neg(),
        output: `-${output}`,
      }];
      for (const { input, output } of vectors) {
        expect(input.toFixed(precision)).toEqual(output);
      }
    }
  });

  test("eq", () => {
    const vectors = [
      { a: Decimal.from(123), b: Decimal.from(123), output: true },
      { a: Decimal.from(123), b: Decimal.from(456), output: false },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.eq(b)).toEqual(output);
      expect(a.neg().eq(b.neg())).toEqual(output);
    }
  });

  test("add", () => {
    const vectors = [
      { a: Decimal.from(123), b: Decimal.from(456), output: Decimal.from(579) },
      {
        a: Decimal.from(1000),
        b: Decimal.from(456),
        output: Decimal.from(1456),
      },
      {
        a: Decimal.from(1000),
        b: Decimal.from(45.6),
        output: Decimal.from(1045.6),
      },
      {
        a: Decimal.from(1000),
        b: Decimal.from(-45.6),
        output: Decimal.from(954.4),
      },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.add(b)).toEqual(output);
      expect(a.neg().add(b.neg())).toEqual(output.neg());
    }
  });

  test("sub", () => {
    const vectors = [
      {
        a: Decimal.from(123),
        b: Decimal.from(456),
        output: Decimal.from(-333),
      },
      {
        a: Decimal.from(1000),
        b: Decimal.from(456),
        output: Decimal.from(544),
      },
      {
        a: Decimal.from(1000),
        b: Decimal.from(45.6),
        output: Decimal.from(954.4),
      },
      {
        a: Decimal.from(1000),
        b: Decimal.from(-45.6),
        output: Decimal.from(1045.6),
      },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.sub(b)).toEqual(output);
      expect(a.neg().sub(b.neg())).toEqual(output.neg());
    }
  });

  test("mul", () => {
    const vectors = [
      {
        a: Decimal.from(123),
        b: Decimal.from(456),
        output: Decimal.from(56088),
      },
      {
        a: Decimal.from(1000),
        b: Decimal.from(456),
        output: Decimal.from(456000),
      },
      {
        a: Decimal.from(1000),
        b: Decimal.from(45.6),
        output: Decimal.from(45600),
      },
    ];
    for (const { a, b, output } of vectors) {
      const vectors = [
        { a, b, output },
        { a: a.neg(), b, output: output.neg() },
        { a, b: b.neg(), output: output.neg() },
        { a: a.neg(), b: b.neg(), output },
      ];
      for (const { a, b, output } of vectors) {
        expect(a.mul(b)).toEqual(output);
      }
    }
  });

  test("fromFraction", () => {
    const vectors: (
      & { numerator: bigint; denominator: bigint }
      & ({ success: true; output: Decimal } | { success: false })
    )[] = [
      {
        numerator: 1n,
        denominator: 2n,
        success: true,
        output: Decimal.from(0.5),
      },
      {
        numerator: 3n,
        denominator: 12n,
        success: true,
        output: Decimal.from(0.25),
      },
      { numerator: 1n, denominator: 3n, success: false },
      {
        numerator: -1n,
        denominator: 2n,
        success: true,
        output: Decimal.from(-0.5),
      },
      {
        numerator: 1n,
        denominator: -2n,
        success: true,
        output: Decimal.from(-0.5),
      },
      {
        numerator: -1n,
        denominator: -2n,
        success: true,
        output: Decimal.from(0.5),
      },
    ];
    for (const vector of vectors) {
      const { numerator, denominator } = vector;
      if (vector.success) {
        const output = vector.output;
        const vectors = [
          { numerator, denominator, output },
          { numerator: -numerator, denominator, output: output.neg() },
          { numerator, denominator: -denominator, output: output.neg() },
          { numerator: -numerator, denominator: -denominator, output },
        ];
        for (const { numerator, denominator, output } of vectors) {
          expect(Decimal.fromFraction({ numerator, denominator })).toEqual(
            output,
          );
        }
      } else {
        const vectors = [
          { numerator, denominator },
          { numerator: -numerator, denominator },
          { numerator, denominator: -denominator },
          { numerator: -numerator, denominator: -denominator },
        ];
        for (const { numerator, denominator } of vectors) {
          expect(() => Decimal.fromFraction({ numerator, denominator }))
            .toThrow(Error);
        }
      }
    }
  });

  test("toFraction", () => {
    const vectors: {
      input: Decimal;
      numerator: bigint;
      denominator: bigint;
    }[] = [
      { input: Decimal.from(123), numerator: 123n, denominator: 1n },
      { input: Decimal.from(1000), numerator: 1000n, denominator: 1n },
      { input: Decimal.from(0), numerator: 0n, denominator: 1n },
      {
        input: Decimal.from("123456789123456789"),
        numerator: 123456789123456789n,
        denominator: 1n,
      },
      { input: Decimal.from(1.23), numerator: 123n, denominator: 100n },
      { input: Decimal.from(0.5), numerator: 1n, denominator: 2n },
      { input: Decimal.from(0.25), numerator: 1n, denominator: 4n },
      { input: Decimal.from(0.125), numerator: 1n, denominator: 8n },
      { input: Decimal.from(123.456), numerator: 15432n, denominator: 125n },
      {
        input: Decimal.from("1.23456789123456789"),
        numerator: 123456789123456789n,
        denominator: 100000000000000000n,
      },
      {
        input: Decimal.from(-1.23),
        numerator: -123n,
        denominator: 100n,
      },
      {
        input: Decimal.from(-0.5),
        numerator: -1n,
        denominator: 2n,
      },
      {
        input: Decimal.from(-0.25),
        numerator: -1n,
        denominator: 4n,
      },
      {
        input: Decimal.from(-0.125),
        numerator: -1n,
        denominator: 8n,
      },
      {
        input: Decimal.from(-123.456),
        numerator: -15432n,
        denominator: 125n,
      },
      {
        input: Decimal.from("-1.23456789123456789"),
        numerator: -123456789123456789n,
        denominator: 100000000000000000n,
      },
    ];
    for (const { input, numerator, denominator } of vectors) {
      const vectors = [{ input, numerator }, {
        input: input.neg(),
        numerator: -numerator,
      }];
      for (const { input, numerator } of vectors) {
        const fraction = input.toFraction();
        expect(fraction.numerator).toEqual(numerator);
        expect(fraction.denominator).toEqual(denominator);
      }
    }
  });

  test("div", () => {
    const vectors: (
      & { a: Decimal; b: Decimal; significantDigits?: number }
      & ({ success: true; output: Decimal } | { success: false })
    )[] = [
      {
        a: Decimal.from(1000),
        b: Decimal.from(2),
        success: true,
        output: Decimal.from(500),
      },
      {
        a: Decimal.from(2),
        b: Decimal.from(1000),
        success: true,
        output: Decimal.from(0.002),
      },
      {
        a: Decimal.from(1000),
        b: Decimal.from(0.2),
        success: true,
        output: Decimal.from(5000),
      },
      {
        a: Decimal.from(1),
        b: Decimal.from(8),
        success: true,
        output: Decimal.from(0.125),
      },
      {
        a: Decimal.from(141),
        b: Decimal.from(376),
        success: true,
        output: Decimal.from(0.375),
      },
      {
        a: Decimal.from(0),
        b: Decimal.from(2),
        success: true,
        output: Decimal.from(0),
      },
      {
        a: Decimal.from(0),
        b: Decimal.from(3),
        success: true,
        output: Decimal.from(0),
      },
      {
        a: Decimal.from(0),
        b: Decimal.from(3),
        significantDigits: 2,
        success: true,
        output: Decimal.from(0),
      },
      {
        a: Decimal.from(1),
        b: Decimal.from(4),
        significantDigits: 1,
        success: true,
        output: Decimal.from(0.3),
      },
      {
        a: Decimal.from(1),
        b: Decimal.from(4),
        significantDigits: 2,
        success: true,
        output: Decimal.from(0.25),
      },
      { a: Decimal.from(1), b: Decimal.from(3), success: false },
      { a: Decimal.from(1000), b: Decimal.from(30), success: false },
      {
        a: Decimal.from(1),
        b: Decimal.from(3),
        significantDigits: 1,
        success: true,
        output: Decimal.from(0.3),
      },
      {
        a: Decimal.from(1),
        b: Decimal.from(3),
        significantDigits: 2,
        success: true,
        output: Decimal.from(0.33),
      },
      {
        a: Decimal.from(100),
        b: Decimal.from(3),
        significantDigits: 2,
        success: true,
        output: Decimal.from(33),
      },
      {
        a: Decimal.from(1),
        b: Decimal.from(6),
        significantDigits: 1,
        success: true,
        output: Decimal.from(0.2),
      },
      {
        a: Decimal.from(1),
        b: Decimal.from(6),
        significantDigits: 2,
        success: true,
        output: Decimal.from(0.17),
      },
      {
        a: Decimal.from(100),
        b: Decimal.from(6),
        significantDigits: 2,
        success: true,
        output: Decimal.from(17),
      },
    ];
    for (const vector of vectors) {
      const { a, b, significantDigits } = vector;
      if (vector.success) {
        const output = vector.output;
        const vectors = [
          { a, b, output },
          { a: a.neg(), b, output: output.neg() },
          { a, b: b.neg(), output: output.neg() },
          { a: a.neg(), b: b.neg(), output },
        ];
        for (const { a, b, output } of vectors) {
          expect(a.div(b, significantDigits)).toEqual(output);
        }
      } else {
        const vectors = [
          { a, b },
          { a: a.neg(), b },
          { a, b: b.neg() },
          { a: a.neg(), b: b.neg() },
        ];
        for (const { a, b } of vectors) {
          expect(() => a.div(b, significantDigits)).toThrow(Error);
        }
      }
    }
  });

  test("inv", () => {
    const vectors: (
      & { input: Decimal; significantDigits?: number }
      & ({ success: true; output: Decimal } | { success: false })
    )[] = [
      { input: Decimal.from(1000), success: true, output: Decimal.from(0.001) },
      { input: Decimal.from(0.2), success: true, output: Decimal.from(5) },
      { input: Decimal.from(1), success: true, output: Decimal.from(1) },
      { input: Decimal.from(0.5), success: true, output: Decimal.from(2) },
      { input: Decimal.from(0.25), success: true, output: Decimal.from(4) },
      { input: Decimal.from(3), success: false },
      {
        input: Decimal.from(3),
        significantDigits: 2,
        success: true,
        output: Decimal.from(0.33),
      },
      {
        input: Decimal.from(6),
        significantDigits: 2,
        success: true,
        output: Decimal.from(0.17),
      },
      {
        input: Decimal.from(4),
        significantDigits: 1,
        success: true,
        output: Decimal.from(0.3),
      },
    ];
    for (const vector of vectors) {
      const { input, significantDigits } = vector;
      if (vector.success) {
        const output = vector.output;
        const vectors = [{ input, output }, {
          input: input.neg(),
          output: output.neg(),
        }];
        for (const { input, output } of vectors) {
          expect(input.inv(significantDigits)).toEqual(output);
        }
      } else {
        const vectors = [{ input }, { input: input.neg() }];
        for (const { input } of vectors) {
          expect(() => input.inv(significantDigits)).toThrow(Error);
        }
      }
    }
  });

  test("mod", () => {
    const vectors = [
      { a: Decimal.from(1000), b: Decimal.from(2), output: Decimal.from(0) },
      { a: Decimal.from(1000), b: Decimal.from(3), output: Decimal.from(1) },
      { a: Decimal.from(1000), b: Decimal.from(0.2), output: Decimal.from(0) },
      {
        a: Decimal.from(1000),
        b: Decimal.from(0.3),
        output: Decimal.from(0.1),
      },
      { a: Decimal.from(1), b: Decimal.from(8), output: Decimal.from(1) },
      { a: Decimal.from(17.5), b: Decimal.from(3), output: Decimal.from(2.5) },
      { a: Decimal.from(1), b: Decimal.from(3), output: Decimal.from(1) },
      { a: Decimal.from(1000), b: Decimal.from(30), output: Decimal.from(10) },
      { a: Decimal.from(-1000), b: Decimal.from(2), output: Decimal.from(0) },
      { a: Decimal.from(-1000), b: Decimal.from(3), output: Decimal.from(2) },
      { a: Decimal.from(-1000), b: Decimal.from(0.2), output: Decimal.from(0) },
      {
        a: Decimal.from(-1000),
        b: Decimal.from(0.3),
        output: Decimal.from(0.2),
      },
      { a: Decimal.from(-1), b: Decimal.from(8), output: Decimal.from(7) },
      { a: Decimal.from(-17.5), b: Decimal.from(3), output: Decimal.from(0.5) },
      { a: Decimal.from(-1), b: Decimal.from(3), output: Decimal.from(2) },
      { a: Decimal.from(-1000), b: Decimal.from(30), output: Decimal.from(20) },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.mod(b)).toEqual(output);
      expect(a.mod(b.neg())).toEqual(output);
    }
  });

  test("pow", () => {
    const vectors: (
      & { a: Decimal; b: number }
      & ({ success: true; output: Decimal } | { success: false })
    )[] = [
      { a: Decimal.from(2), b: 3, success: true, output: Decimal.from(8) },
      { a: Decimal.from(2), b: 2, success: true, output: Decimal.from(4) },
      { a: Decimal.from(2), b: 1, success: true, output: Decimal.from(2) },
      { a: Decimal.from(2), b: 0, success: true, output: Decimal.from(1) },
      { a: Decimal.from(2), b: 2, success: true, output: Decimal.from(4) },
      { a: Decimal.from(2), b: -1, success: true, output: Decimal.from(0.5) },
      { a: Decimal.from(2), b: -2, success: true, output: Decimal.from(0.25) },
      { a: Decimal.from(2), b: -3, success: true, output: Decimal.from(0.125) },
      {
        a: Decimal.from(0.2),
        b: 3,
        success: true,
        output: Decimal.from(0.008),
      },
      { a: Decimal.from(0.2), b: 2, success: true, output: Decimal.from(0.04) },
      { a: Decimal.from(0.2), b: 1, success: true, output: Decimal.from(0.2) },
      { a: Decimal.from(0.2), b: 0, success: true, output: Decimal.from(1) },
      { a: Decimal.from(0.2), b: 2, success: true, output: Decimal.from(0.04) },
      { a: Decimal.from(0.2), b: -1, success: true, output: Decimal.from(5) },
      { a: Decimal.from(0.2), b: -2, success: true, output: Decimal.from(25) },
      { a: Decimal.from(0.2), b: -3, success: true, output: Decimal.from(125) },
      { a: Decimal.from(3), b: 3, success: true, output: Decimal.from(27) },
      { a: Decimal.from(3), b: 2, success: true, output: Decimal.from(9) },
      { a: Decimal.from(3), b: 1, success: true, output: Decimal.from(3) },
      { a: Decimal.from(3), b: 0, success: true, output: Decimal.from(1) },
      { a: Decimal.from(3), b: -1, success: false },
      { a: Decimal.from(3), b: -2, success: false },
      { a: Decimal.from(3), b: -3, success: false },
    ];
    for (const vector of vectors) {
      const { a, b } = vector;
      if (vector.success) {
        const output = vector.output;
        const vectors = [{ a, b, output }, {
          a: a.neg(),
          b,
          output: b % 2 == 0 ? output : output.neg(),
        }];
        for (const { a, b, output } of vectors) {
          expect(a.pow(b)).toEqual(output);
        }
      } else {
        expect(() => a.pow(b)).toThrow(Error);
        expect(() => a.neg().pow(b)).toThrow(Error);
      }
    }
  });

  test("abs", () => {
    const vectors = [
      { input: Decimal.from(123), output: Decimal.from(123) },
      { input: Decimal.from(0), output: Decimal.from(0) },
      { input: Decimal.from(12.3), output: Decimal.from(12.3) },
    ];
    for (const { input, output } of vectors) {
      expect(input.abs()).toEqual(output);
      expect(input.neg().abs()).toEqual(output);
    }
  });

  test("magnitude", () => {
    const vectors = [
      { input: Decimal.from(999), output: 2 },
      { input: Decimal.from(123), output: 2 },
      { input: Decimal.from(100), output: 2 },
      { input: Decimal.from(99.9), output: 1 },
      { input: Decimal.from(12.3), output: 1 },
      { input: Decimal.from(10), output: 1 },
      { input: Decimal.from(9.99), output: 0 },
      { input: Decimal.from(1.23), output: 0 },
      { input: Decimal.from(1), output: 0 },
      { input: Decimal.from(0.999), output: -1 },
      { input: Decimal.from(0.123), output: -1 },
      { input: Decimal.from(0.1), output: -1 },
      { input: Decimal.from(0.0999), output: -2 },
      { input: Decimal.from(0.0123), output: -2 },
      { input: Decimal.from(0.01), output: -2 },
    ];
    for (const { input, output } of vectors) {
      expect(input.magnitude()).toEqual(output);
      expect(input.neg().magnitude()).toEqual(output);
    }
  });

  test("toBigInt", () => {
    const vectors: (
      & { input: Decimal }
      & ({ success: true; output: bigint } | { success: false })
    )[] = [
      { input: Decimal.from(123), success: true, output: 123n },
      { input: Decimal.from(1000), success: true, output: 1000n },
      { input: Decimal.from(0), success: true, output: 0n },
      {
        input: Decimal.from("123456789123456789"),
        success: true,
        output: 123456789123456789n,
      },
      { input: Decimal.from("123e3"), success: true, output: 123000n },
      { input: Decimal.from(1.23), success: false },
    ];
    for (const vector of vectors) {
      const { input } = vector;
      if (vector.success) {
        expect(input.toBigInt()).toEqual(vector.output);
        expect(input.neg().toBigInt()).toEqual(-vector.output);
      } else {
        expect(() => input.toBigInt()).toThrow(Error);
        expect(() => input.neg().toBigInt()).toThrow(Error);
      }
    }
  });

  test("gt", () => {
    const vectors = [
      { a: Decimal.from(123), b: Decimal.from(100), output: true },
      { a: Decimal.from(123), b: Decimal.from(123), output: false },
      { a: Decimal.from(100), b: Decimal.from(123), output: false },
      { a: Decimal.from(-100), b: Decimal.from(-123), output: true },
      { a: Decimal.from(-123), b: Decimal.from(-123), output: false },
      { a: Decimal.from(-123), b: Decimal.from(-100), output: false },
      { a: Decimal.from(0), b: Decimal.from(0), output: false },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.gt(b)).toEqual(output);
    }
  });

  test("gte", () => {
    const vectors = [
      { a: Decimal.from(123), b: Decimal.from(100), output: true },
      { a: Decimal.from(123), b: Decimal.from(123), output: true },
      { a: Decimal.from(100), b: Decimal.from(123), output: false },
      { a: Decimal.from(-100), b: Decimal.from(-123), output: true },
      { a: Decimal.from(-123), b: Decimal.from(-123), output: true },
      { a: Decimal.from(-123), b: Decimal.from(-100), output: false },
      { a: Decimal.from(0), b: Decimal.from(0), output: true },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.gte(b)).toEqual(output);
    }
  });

  test("lt", () => {
    const vectors = [
      { a: Decimal.from(123), b: Decimal.from(100), output: false },
      { a: Decimal.from(123), b: Decimal.from(123), output: false },
      { a: Decimal.from(100), b: Decimal.from(123), output: true },
      { a: Decimal.from(-100), b: Decimal.from(-123), output: false },
      { a: Decimal.from(-123), b: Decimal.from(-123), output: false },
      { a: Decimal.from(-123), b: Decimal.from(-100), output: true },
      { a: Decimal.from(0), b: Decimal.from(0), output: false },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.lt(b)).toEqual(output);
    }
  });

  test("lte", () => {
    const vectors = [
      { a: Decimal.from(123), b: Decimal.from(100), output: false },
      { a: Decimal.from(123), b: Decimal.from(123), output: true },
      { a: Decimal.from(100), b: Decimal.from(123), output: true },
      { a: Decimal.from(-100), b: Decimal.from(-123), output: false },
      { a: Decimal.from(-123), b: Decimal.from(-123), output: true },
      { a: Decimal.from(-123), b: Decimal.from(-100), output: true },
      { a: Decimal.from(0), b: Decimal.from(0), output: true },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.lte(b)).toEqual(output);
    }
  });

  test("gt0", () => {
    const vectors = [
      { input: Decimal.from(123), output: true },
      { input: Decimal.from(0), output: false },
      { input: Decimal.from(-123), output: false },
    ];
    for (const { input, output } of vectors) {
      expect(input.gt0()).toEqual(output);
    }
  });

  test("gte0", () => {
    const vectors = [
      { input: Decimal.from(123), output: true },
      { input: Decimal.from(0), output: true },
      { input: Decimal.from(-123), output: false },
    ];
    for (const { input, output } of vectors) {
      expect(input.gte0()).toEqual(output);
    }
  });

  test("lt0", () => {
    const vectors = [
      { input: Decimal.from(123), output: false },
      { input: Decimal.from(0), output: false },
      { input: Decimal.from(-123), output: true },
    ];
    for (const { input, output } of vectors) {
      expect(input.lt0()).toEqual(output);
    }
  });

  test("lte0", () => {
    const vectors = [
      { input: Decimal.from(123), output: false },
      { input: Decimal.from(0), output: true },
      { input: Decimal.from(-123), output: true },
    ];
    for (const { input, output } of vectors) {
      expect(input.lte0()).toEqual(output);
    }
  });

  test("e", () => {
    const vectors = [
      { input: Decimal.from(12.3), exponent: 3, output: Decimal.from(12300) },
      { input: Decimal.from(12.3), exponent: 2, output: Decimal.from(1230) },
      { input: Decimal.from(12.3), exponent: 1, output: Decimal.from(123) },
      { input: Decimal.from(12.3), exponent: 0, output: Decimal.from(12.3) },
      { input: Decimal.from(12.3), exponent: -1, output: Decimal.from(1.23) },
      { input: Decimal.from(12.3), exponent: -2, output: Decimal.from(0.123) },
      { input: Decimal.from(12.3), exponent: -3, output: Decimal.from(0.0123) },
    ];
    for (const { input, exponent, output } of vectors) {
      expect(input.e(exponent)).toEqual(output);
      expect(input.neg().e(exponent)).toEqual(output.neg());
    }
  });

  test("compare", () => {
    const vectors = [
      { a: Decimal.from(123), b: Decimal.from(100), output: 1 },
      { a: Decimal.from(123), b: Decimal.from(123), output: 0 },
      { a: Decimal.from(100), b: Decimal.from(123), output: -1 },
      { a: Decimal.from(-100), b: Decimal.from(-123), output: 1 },
      { a: Decimal.from(-123), b: Decimal.from(-123), output: 0 },
      { a: Decimal.from(-123), b: Decimal.from(-100), output: -1 },
      { a: Decimal.from(0), b: Decimal.from(0), output: 0 },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.compare(b)).toEqual(output);
    }
  });

  test("neq", () => {
    const vectors = [
      { a: Decimal.from(123), b: Decimal.from(123), output: false },
      { a: Decimal.from(123), b: Decimal.from(456), output: true },
      { a: Decimal.from(123), b: Decimal.from(-123), output: true },
      { a: Decimal.from(0), b: Decimal.from(0), output: false },
      { a: Decimal.from(0), b: Decimal.from(1), output: true },
      { a: Decimal.from(-123), b: Decimal.from(-123), output: false },
      { a: Decimal.from(-123), b: Decimal.from(123), output: true },
    ];
    for (const { a, b, output } of vectors) {
      expect(a.neq(b)).toEqual(output);
      expect(a.neg().neq(b.neg())).toEqual(output);
    }
  });

  test("Symbol.for('Deno.customInspect')", () => {
    const vectors = [
      { input: Decimal.from(123), output: "123" },
      { input: Decimal.from(12.30), output: "12.3" },
      { input: Decimal.from(0.123), output: "0.123" },
      { input: Decimal.from(0.0123), output: "0.0123" },
      {
        input: Decimal.from("123456789.123456789123456789"),
        output: "123456789.123456789123456789",
      },
    ];
    for (const { input, output } of vectors) {
      const vectors = [{ input, output }, {
        input: input.neg(),
        output: `-${output}`,
      }];
      const symbol = Symbol.for("Deno.customInspect");
      for (const { input, output } of vectors) {
        // deno-lint-ignore no-explicit-any
        expect((input as any)[symbol]()).toEqual(output);
      }
    }
  });

  test("static add", () => {
    const vectors = [
      {
        values: [Decimal.from(123), Decimal.from(456)],
        output: Decimal.from(579),
      },
      {
        values: [Decimal.from(1000), Decimal.from(456)],
        output: Decimal.from(1456),
      },
      {
        values: [Decimal.from(1000), Decimal.from(45.6)],
        output: Decimal.from(1045.6),
      },
      {
        values: [Decimal.from(1000), Decimal.from(-45.6)],
        output: Decimal.from(954.4),
      },
      {
        values: [Decimal.from(1), Decimal.from(2), Decimal.from(3)],
        output: Decimal.from(6),
      },
      {
        values: [Decimal.from(1.1), Decimal.from(2.2), Decimal.from(3.3)],
        output: Decimal.from(6.6),
      },
      {
        values: [Decimal.from(-1), Decimal.from(-2), Decimal.from(-3)],
        output: Decimal.from(-6),
      },
    ];
    for (const { values, output } of vectors) {
      expect(Decimal.add(...values)).toEqual(output);
    }
  });

  test("static mul", () => {
    const vectors = [
      {
        values: [Decimal.from(123), Decimal.from(456)],
        output: Decimal.from(56088),
      },
      {
        values: [Decimal.from(1000), Decimal.from(456)],
        output: Decimal.from(456000),
      },
      {
        values: [Decimal.from(1000), Decimal.from(45.6)],
        output: Decimal.from(45600),
      },
      {
        values: [Decimal.from(1), Decimal.from(2), Decimal.from(3)],
        output: Decimal.from(6),
      },
      {
        values: [Decimal.from(1.1), Decimal.from(2.2), Decimal.from(3.3)],
        output: Decimal.from(7.986),
      },
      {
        values: [Decimal.from(-1), Decimal.from(-2), Decimal.from(-3)],
        output: Decimal.from(-6),
      },
    ];
    for (const { values, output } of vectors) {
      expect(Decimal.mul(...values)).toEqual(output);
    }
  });

  test("static max", () => {
    const vectors = [
      {
        values: [Decimal.from(123), Decimal.from(456)],
        output: Decimal.from(456),
      },
      {
        values: [Decimal.from(1000), Decimal.from(456)],
        output: Decimal.from(1000),
      },
      {
        values: [Decimal.from(1000), Decimal.from(45.6)],
        output: Decimal.from(1000),
      },
      {
        values: [Decimal.from(1), Decimal.from(2), Decimal.from(3)],
        output: Decimal.from(3),
      },
      {
        values: [
          Decimal.from(1.1),
          Decimal.from(2.2),
          Decimal.from(3.3),
        ],
        output: Decimal.from(3.3),
      },
      {
        values: [Decimal.from(-1), Decimal.from(-2), Decimal.from(-3)],
        output: Decimal.from(-1),
      },
    ];
    for (const { values, output } of vectors) {
      expect(Decimal.max(values)).toEqual(output);
    }
  });

  test("static min", () => {
    const vectors = [
      {
        values: [Decimal.from(123), Decimal.from(456)],
        output: Decimal.from(123),
      },
      {
        values: [Decimal.from(1000), Decimal.from(456)],
        output: Decimal.from(456),
      },
      {
        values: [Decimal.from(1000), Decimal.from(45.6)],
        output: Decimal.from(45.6),
      },
      {
        values: [Decimal.from(1), Decimal.from(2), Decimal.from(3)],
        output: Decimal.from(1),
      },
      {
        values: [
          Decimal.from(1.1),
          Decimal.from(2.2),
          Decimal.from(3.3),
        ],
        output: Decimal.from(1.1),
      },
      {
        values: [Decimal.from(-1), Decimal.from(-2), Decimal.from(-3)],
        output: Decimal.from(-3),
      },
    ];
    for (const { values, output } of vectors) {
      expect(Decimal.min(values)).toEqual(output);
    }
  });

  test("static gcd", () => {
    const vectors = [
      {
        a: Decimal.from(48),
        b: Decimal.from(18),
        output: Decimal.from(6),
      },
      {
        a: Decimal.from(56),
        b: Decimal.from(98),
        output: Decimal.from(14),
      },
      {
        a: Decimal.from(101),
        b: Decimal.from(103),
        output: Decimal.from(1),
      },
      {
        a: Decimal.from(0),
        b: Decimal.from(5),
        output: Decimal.from(5),
      },
      {
        a: Decimal.from(5),
        b: Decimal.from(0),
        output: Decimal.from(5),
      },
      {
        a: Decimal.from(0),
        b: Decimal.from(0),
        output: Decimal.from(0),
      },
      {
        a: Decimal.from(-48),
        b: Decimal.from(18),
        output: Decimal.from(6),
      },
      {
        a: Decimal.from(48),
        b: Decimal.from(-18),
        output: Decimal.from(6),
      },
      {
        a: Decimal.from(-48),
        b: Decimal.from(-18),
        output: Decimal.from(6),
      },
    ];
    for (const { a, b, output } of vectors) {
      expect(Decimal.gcd(a, b)).toEqual(output);
    }
  });
});
