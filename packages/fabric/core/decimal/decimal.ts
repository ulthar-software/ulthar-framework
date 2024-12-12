import { assert } from "jsr:@std/assert@^1.0.8/assert";
import { ensure } from "../utils/ensure.ts";

/**
 * A type alias representing the different types a Decimal instance can be created from.
 */
export type DecimalType = Decimal | number | bigint | string;

/**
 * A class to represent arbitrary precision decimal numbers.
 */
export class Decimal {
  readonly mantissa: bigint;
  readonly exponent: number;

  /**
   * Constructs a new Decimal instance, from a `mantissa` and an `exponent`.
   *
   * Conceptually, a Decimal instance represents the value `mantissa * 10 ^ exponent`.
   *
   * The constructor normalizes the mantissa and exponent, ensuring that the mantissa is as small as possible.
   *
   * If the mantissa is 0, the exponent is set to 0.
   *
   * @param mantissa The mantissa, represented as a bigint.
   * @param exponent The exponent, representing the power of 10 by which the mantissa is multiplied. Defaults to 0.
   * @throws Will throw an error if the exponent is not an integer.
   */
  constructor(mantissa: bigint, exponent = 0) {
    assert(
      Number.isInteger(exponent),
      `Exponent must be an integer, got ${exponent}`,
    );
    if (mantissa === 0n) {
      this.mantissa = 0n;
      this.exponent = 0;
    } else {
      while (mantissa % 10n === 0n) {
        mantissa /= 10n;
        exponent += 1;
      }
      this.mantissa = mantissa;
      this.exponent = exponent;
    }
  }

  /**
   * Custom inspection method for Deno which returns the string representation of the Decimal instance.
   *
   * @returns A string representing the Decimal value.
   */
  [Symbol.for("Deno.customInspect")](): string {
    return this.toString();
  }

  /**
   * Returns the absolute value of the current Decimal instance.
   *
   * @returns A new Decimal instance representing the absolute value.
   */
  abs(): Decimal {
    return this.gt0() ? this : this.neg();
  }

  /**
   * Adds the provided value to the current Decimal instance.
   *
   * @param value The value to add.
   * @returns A new Decimal instance representing the sum.
   */
  add(value: DecimalType): Decimal {
    value = Decimal.from(value);
    const { mantissa1, mantissa2, exponent } = normalize(this, value);
    return new Decimal(mantissa1 + mantissa2, exponent);
  }

  /**
   * Rounds the current value up towards positive infinity to the nearest multiple of the specified precision.
   *
   * @param precision The precision to round to. Defaults to `Decimal.one`, meaning it rounds to the nearest integer.
   * @returns A new Decimal instance representing the rounded value.
   */
  ceil(precision: DecimalType = Decimal.one): Decimal {
    const remainder = this.mod(precision);
    if (remainder.eq0()) {
      return this;
    }
    return this.sub(remainder).add(precision);
  }

  /**
   * Compares the current Decimal instance with the provided value.
   *
   * @param other The value to compare with.
   * @returns 0 if both values are equal, 1 if the current instance is greater, and -1 if it is less.
   */
  compare(other: DecimalType): number {
    return this.sub(other).sign().toNumber();
  }

  /**
   * Divides the current Decimal instance by the provided value.
   *
   * Throws if the resulting value cannot be represented with a fixed number of decimals (like 1/3).
   *
   * If you need to divide by such a value, use the optional `significantDigits` parameter to specify the number of significant digits to use in the result.
   *
   * ```ts
   * Decimal.from(1).div(3); // Throws
   * Decimal.from(1).div(3, 2); // Returns 0.33
   * ```
   *
   * @param value The value to divide by.
   * @param significantDigits The number of significant digits to use in the result.
   * @returns A new Decimal instance representing the result of the division.
   */
  div(value: DecimalType, significantDigits?: number): Decimal {
    value = Decimal.from(value);
    assert(value.neq0(), "Division by zero");
    if (this.eq0()) {
      return Decimal.zero;
    }
    if (this.lt0()) {
      return this.neg().div(value, significantDigits).neg();
    }
    if (value.lt0()) {
      return this.div(value.neg(), significantDigits).neg();
    }
    let { mantissa1, mantissa2 } = normalize(this, value);
    if (significantDigits === undefined) {
      return Decimal.fromFraction({
        numerator: mantissa1,
        denominator: mantissa2,
      });
    } else {
      assert(
        Number.isInteger(significantDigits) && significantDigits > 0,
        `Significant digits must be a positive integer, got ${significantDigits}`,
      );
      let exponent = 0;
      while (mantissa1 < mantissa2) {
        mantissa1 *= 10n;
        exponent -= 1;
      }
      while (mantissa2 < mantissa1) {
        mantissa2 *= 10n;
        exponent += 1;
      }
      for (let i = 0; i < significantDigits; i++) {
        mantissa1 *= 10n;
        exponent -= 1;
      }
      let quotient = mantissa1 / mantissa2;
      const remainder = mantissa1 % mantissa2;
      if (remainder * 2n >= mantissa2) {
        quotient += 1n;
      }
      return new Decimal(quotient, exponent);
    }
  }

  /**
   * Multiplies the current Decimal instance by 10 raised to the provided integer exponent.
   *
   * @param exponent The integer exponent to raise 10 to.
   * @returns A new Decimal instance representing the result.
   */
  e(exponent: number): Decimal {
    return this.mul(new Decimal(10n).pow(exponent));
  }

  /**
   * Checks if the current Decimal instance is equal to the provided value.
   *
   * @param value The value to compare with.
   * @returns True if the values are equal, false otherwise.
   */
  eq(value: DecimalType): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = normalize(this, value);
    return mantissa1 === mantissa2;
  }

  /**
   * Checks if the current Decimal instance is equal to zero.
   *
   * @returns True if the value is zero, false otherwise.
   */
  eq0(): boolean {
    return this.mantissa === 0n;
  }

  /**
   * Rounds the current value down towards negative infinity to the nearest multiple of the specified precision.
   *
   * @param precision The precision to round to. Defaults to `Decimal.one`, meaning it rounds to the nearest integer.
   * @returns A new Decimal instance representing the rounded value.
   */
  floor(precision: DecimalType = Decimal.one): Decimal {
    const remainder = this.mod(precision);
    if (remainder.eq0()) {
      return this;
    }
    return this.sub(remainder);
  }

  /**
   * Checks if the current Decimal instance is greater than the provided value.
   *
   * @param value The value to compare with.
   * @returns True if the current instance is greater, false otherwise.
   */
  gt(value: DecimalType): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = normalize(this, value);
    return mantissa1 > mantissa2;
  }

  /**
   * Checks if the current Decimal instance is greater than zero.
   *
   * @returns True if the value is greater than zero, false otherwise.
   */
  gt0(): boolean {
    return this.mantissa > 0n;
  }

  /**
   * Checks if the current Decimal instance is greater than or equal to the provided value.
   *
   * @param value The value to compare with.
   * @returns True if the current instance is greater or equal, false otherwise.
   */
  gte(value: DecimalType): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = normalize(this, value);
    return mantissa1 >= mantissa2;
  }

  /**
   * Checks if the current Decimal instance is greater than or equal to zero.
   *
   * @returns True if the value is greater than or equal to zero, false otherwise.
   */
  gte0(): boolean {
    return this.mantissa >= 0n;
  }

  /**
   * Returns the multiplicative inverse of the current Decimal instance.
   *
   * Throws if the resulting value cannot be represented with a fixed number of decimals (like 1/3).
   *
   * If you need to invert such a value, use the optional `significantDigits` parameter to specify the number of significant digits to use in the result.
   *
   * ```ts
   * Decimal.from(3).inv(); // Throws
   * Decimal.from(3).inv(2); // Returns 0.33
   * ```
   *
   * @param significantDigits The number of significant digits to use in the result.
   * @returns A new Decimal instance representing the inverse.
   */
  inv(significantDigits?: number): Decimal {
    return Decimal.one.div(this, significantDigits);
  }

  /**
   * Checks if the current Decimal instance is an integer.
   *
   * @returns True if the value is an integer, false otherwise.
   */
  isInteger(): boolean {
    return this.exponent >= 0;
  }

  /**
   * Checks if the current Decimal instance is less than the provided value.
   *
   * @param value The value to compare with.
   * @returns True if the current instance is less, false otherwise.
   */
  lt(value: DecimalType): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = normalize(this, value);
    return mantissa1 < mantissa2;
  }

  /**
   * Checks if the current Decimal instance is less than zero.
   *
   * @returns True if the value is less than zero, false otherwise.
   */
  lt0(): boolean {
    return this.mantissa < 0n;
  }

  /**
   * Checks if the current Decimal instance is less than or equal to the provided value.
   *
   * @param value The value to compare with.
   * @returns True if the current instance is less or equal, false otherwise.
   */
  lte(value: DecimalType): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = normalize(this, value);
    return mantissa1 <= mantissa2;
  }

  /**
   * Checks if the current Decimal instance is less than or equal to zero.
   *
   * @returns True if the value is less than or equal to zero, false otherwise.
   */
  lte0(): boolean {
    return this.mantissa <= 0n;
  }

  /**
   * Returns the order of magnitude (defined as `floor(log10(abs(value)))`) of the current Decimal instance.
   *
   * @returns A number representing the order of magnitude.
   */
  magnitude(): number {
    if (this.lt0()) {
      return this.neg().magnitude();
    }
    let mantissa = 1n;
    let exponent = -1;
    while (this.mantissa >= mantissa) {
      mantissa *= 10n;
      exponent += 1;
    }
    return exponent + this.exponent;
  }

  /**
   * Returns the remainder when dividing the current Decimal instance by the provided value.
   *
   * @param value The value to divide by.
   * @returns A new Decimal instance representing the remainder.
   */
  mod(value: DecimalType): Decimal {
    value = Decimal.from(value);
    assert(value.neq0(), `Division by zero`);
    if (value.lt0()) {
      return this.mod(value.neg());
    }
    const { mantissa1, mantissa2, exponent } = normalize(this, value);
    const result = mantissa1 % mantissa2;
    return new Decimal(result < 0n ? result + mantissa2 : result, exponent);
  }

  /**
   * Multiplies the current Decimal instance by the provided value.
   *
   * @param value The value to multiply by.
   * @returns A new Decimal instance representing the product.
   */
  mul(value: DecimalType): Decimal {
    value = Decimal.from(value);
    return new Decimal(
      this.mantissa * value.mantissa,
      this.exponent + value.exponent,
    );
  }

  /**
   * Negates the current Decimal instance.
   *
   * @returns A new Decimal instance representing the negated value.
   */
  neg(): Decimal {
    return new Decimal(-this.mantissa, this.exponent);
  }

  /**
   * Checks if the current value is not equal to the provided value.
   *
   * @param value The value to compare against.
   * @returns True if the values are not equal, false otherwise.
   */
  neq(value: DecimalType): boolean {
    return !this.eq(value);
  }

  /**
   * Checks if the current value is not equal to zero.
   *
   * @returns True if the value is not zero, false otherwise.
   */
  neq0(): boolean {
    return !this.eq0();
  }

  /**
   * Raises the current Decimal instance to the power of the provided integer exponent.
   *
   * @param value The integer exponent to raise to.
   * @returns A new Decimal instance representing the result of the exponentiation.
   */
  pow(value: number): Decimal {
    assert(
      Number.isInteger(value),
      `Exponent must be an integer, got ${value}`,
    );
    if (value === 0) {
      return Decimal.one;
    } else if (value === 1) {
      return this;
    } else if (value < 0) {
      return this.inv().pow(-value);
    } else {
      return new Decimal(this.mantissa ** BigInt(value), this.exponent * value);
    }
  }

  /**
   * Rounds the current value towards the nearest multiple of the specified precision.
   *
   * If the current value is exactly halfway between two multiples of the precision, it is rounded up towards positive infinity.
   *
   * @param precision The precision to round to. Defaults to `Decimal.one`, meaning it rounds to the nearest integer.
   * @returns A new Decimal instance representing the rounded value.
   */
  round(precision: DecimalType = Decimal.one): Decimal {
    return this.add(new Decimal(5n, -1).mul(precision)).floor(precision);
  }

  /**
   * Returns the sign of the current value as a Decimal instance.
   *
   * @returns A Decimal instance representing the sign: 1 for positive, -1 for negative, and 0 for zero.
   */
  sign(): Decimal {
    if (this.gt0()) {
      return Decimal.one;
    }
    if (this.lt0()) {
      return Decimal.minusOne;
    }
    return Decimal.zero;
  }

  /**
   * Subtracts the provided value from the current Decimal instance.
   *
   * @param value The value to subtract.
   * @returns A new Decimal instance representing the result of the subtraction.
   */
  sub(value: DecimalType): Decimal {
    value = Decimal.from(value);
    const { mantissa1, mantissa2, exponent } = normalize(this, value);
    return new Decimal(mantissa1 - mantissa2, exponent);
  }

  /**
   * Converts the current Decimal instance to a bigint, if it is an integer.
   *
   * Throws if the Decimal instance is not an integer.
   *
   * @returns A bigint representing the integer value of the Decimal instance.
   */
  toBigInt(): bigint {
    assert(this.isInteger(), `Decimal ${this} is not an integer`);
    return this.mantissa * 10n ** BigInt(this.exponent);
  }

  /**
   * Converts the current Decimal instance to a fixed-point notation string.
   *
   * @param precision The number of decimal places to include in the result.
   * @returns A string representing the Decimal instance in fixed-point notation.
   */
  toFixed(precision: number): string {
    assert(
      Number.isInteger(precision) && precision >= 0,
      `Precision must be a non-negative integer, got ${precision}`,
    );
    if (this.lt0()) {
      return "-" + this.neg().toFixed(precision);
    }
    const value = this.e(precision).round().e(-precision);
    if (value.exponent >= 0) {
      const result = value.mantissa.toString() + "0".repeat(value.exponent);
      return precision > 0 ? result + "." + "0".repeat(precision) : result;
    } else {
      const string = value.mantissa.toString().padStart(
        -value.exponent + 1,
        "0",
      );
      return string.slice(0, value.exponent) + "." +
        string.slice(value.exponent).padEnd(precision, "0");
    }
  }

  /**
   * Converts the current value to a fraction represented by a numerator and denominator.
   *
   * Simplifies the fraction to its lowest terms.
   *
   * @returns An object with numerator and denominator properties.
   */
  toFraction(): { numerator: bigint; denominator: bigint } {
    if (this.lt0()) {
      const { numerator, denominator } = this.neg().toFraction();
      return { numerator: -numerator, denominator };
    }
    if (this.exponent >= 0) {
      return {
        numerator: this.mantissa * 10n ** BigInt(this.exponent),
        denominator: 1n,
      };
    } else {
      const numerator = this.mantissa;
      const denominator = 10n ** BigInt(-this.exponent);
      const divisor = gcd(numerator, denominator);
      return {
        numerator: numerator / divisor,
        denominator: denominator / divisor,
      };
    }
  }

  /**
   * Converts the current value to a number.
   *
   * This may lose precision if the Decimal cannot be exactly represented as a number.
   *
   * @returns The number representation of the current Decimal value.
   */
  toNumber(): number {
    return Number(this.toString());
  }

  /**
   * Converts the current value to a string.
   *
   * @returns A string representing the current Decimal value.
   */
  toString(): string {
    if (this.lt0()) {
      return "-" + this.neg().toString();
    }
    if (this.exponent >= 0) {
      return this.mantissa.toString() + "0".repeat(this.exponent);
    } else {
      const string = this.mantissa.toString().padStart(-this.exponent + 1, "0");
      return string.slice(0, this.exponent) + "." + string.slice(this.exponent);
    }
  }

  /**
   * A static constant representing the decimal value -1.
   */
  static minusOne: Decimal = new Decimal(-1n);

  /**
   * A static constant representing the decimal value 1.
   */
  static one: Decimal = new Decimal(1n);

  /**
   * A static constant representing the decimal value 0.
   */
  static zero: Decimal = new Decimal(0n);

  /**
   * Adds multiple values together.
   *
   * @param values An array of values to add.
   * @returns A new Decimal instance representing the sum of the values.
   */
  static add(...values: DecimalType[]): Decimal {
    return values.reduce((previous: Decimal, current) => {
      return previous.add(current);
    }, Decimal.zero);
  }

  /**
   * Creates a Decimal instance from a string (in standard or scientific notation), a number or a bigint.
   *
   * @param value The value to convert.
   * @returns A Decimal instance representing the provided value.
   */
  static from(value: DecimalType): Decimal {
    if (typeof value === "string") {
      return this.fromString(value);
    }
    if (typeof value === "number") {
      return this.fromNumber(value);
    }
    if (typeof value === "bigint") {
      return this.fromBigInt(value);
    }
    return value;
  }

  /**
   * Creates a Decimal instance from a fraction.
   *
   * Throws if the fraction cannot be represented with a fixed number of decimals.
   *
   * @param numerator The numerator of the fraction.
   * @param denominator The denominator of the fraction.
   * @returns A Decimal instance representing the fraction.
   */
  static fromFraction(
    { numerator, denominator }: { numerator: bigint; denominator: bigint },
  ): Decimal {
    if (denominator < 0n) {
      numerator = -numerator;
      denominator = -denominator;
    }
    if (numerator < 0n) {
      return this.fromFraction({ numerator: -numerator, denominator }).neg();
    }
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    let value = denominator;
    let factor = 1n;
    let exponent = 0;
    while (value > 1 && (value % 2n === 0n)) {
      value /= 2n;
      factor *= 5n;
      exponent -= 1;
    }
    while (value > 1 && (value % 5n === 0n)) {
      value /= 5n;
      factor *= 2n;
      exponent -= 1;
    }
    assert(
      value === 1n,
      `Fraction ${numerator}/${denominator} cannot be represented with a fixed number of decimals`,
    );
    return new Decimal(numerator * factor, exponent);
  }

  /**
   * Creates a Decimal instance from a bigint.
   *
   * @param value The bigint value to convert.
   * @returns A Decimal instance representing the provided bigint value.
   */
  static fromBigInt(value: bigint): Decimal {
    return new Decimal(value);
  }

  /**
   * Creates a Decimal instance from a number.
   *
   * @param value The number value to convert.
   * @returns A Decimal instance representing the provided number.
   */
  static fromNumber(value: number): Decimal {
    if (Number.isInteger(value)) {
      return new Decimal(BigInt(value));
    } else {
      return this.fromString(value.toString());
    }
  }

  /**
   * Creates a Decimal instance from a string (in standard or scientific notation).
   *
   * @param string The string value to convert.
   * @returns A Decimal instance representing the provided string.
   */
  static fromString(string: string): Decimal {
    if (/^(-?[0-9]+|0x[0-9a-f]+|0o[0-7]+|0b[01]+)$/i.test(string)) {
      return this.fromBigInt(BigInt(string));
    }
    const match = string.match(/^(-?\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i);
    assert(match !== null, `Could not parse Decimal from string ${string}`);
    let exponent = 0;
    if (match[3] !== undefined) {
      exponent = Number(match[3]);
    }
    const mantissa = (() => {
      if (match[2] !== undefined) {
        exponent -= match[2].length;
        return match[1] + match[2];
      } else {
        assert(match[1] !== undefined);
        return match[1];
      }
    })();
    return new Decimal(BigInt(mantissa), exponent);
  }

  /**
   * Finds the maximum value among the provided values.
   *
   * @param first The first value to compare.
   * @param values Additional values to compare.
   * @returns A new Decimal instance representing the maximum value.
   */
  static max(values: DecimalType[]): Decimal {
    return values.slice(1).reduce((max: Decimal, value) => {
      return max.lt(value) ? this.from(value) : max;
    }, this.from(ensure(values[0])));
  }

  /**
   * Finds the minimum value among the provided values.
   *
   * @param first The first value to compare.
   * @param values Additional values to compare.
   * @returns A new Decimal instance representing the minimum value.
   */
  static min(values: DecimalType[]): Decimal {
    return values.slice(1).reduce((min: Decimal, value) => {
      return min.gt(value) ? this.from(value) : min;
    }, this.from(ensure(values[0])));
  }

  /**
   * Multiplies multiple values together.
   *
   * @param values An array of values to multiply.
   * @returns A new Decimal instance representing the product of the values.
   */
  static mul(...values: DecimalType[]): Decimal {
    return values.reduce((previous: Decimal, current) => {
      return previous.mul(current);
    }, Decimal.one);
  }

  /**
   * Calculates the greatest common divisor (GCD) of two values.
   *
   * @param a The first value.
   * @param b The second value.
   * @returns A new Decimal instance representing the GCD of the two values.
   */
  static gcd(a: DecimalType, b: DecimalType): Decimal {
    a = Decimal.from(a);
    b = Decimal.from(b);
    if (a.lt0()) {
      a = a.neg();
    }
    if (b.lt0()) {
      b = b.neg();
    }
    return ((a, b) => {
      while (b.neq0()) {
        const t = b;
        b = a.mod(b);
        a = t;
      }
      return a;
    })(a, b);
  }
}

function gcd(a: bigint, b: bigint) {
  while (b !== 0n) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function normalize(value1: Decimal, value2: Decimal) {
  const exponent = Math.min(value1.exponent, value2.exponent);
  return {
    mantissa1: value1.mantissa * 10n ** BigInt(value1.exponent - exponent),
    mantissa2: value2.mantissa * 10n ** BigInt(value2.exponent - exponent),
    exponent,
  };
}
