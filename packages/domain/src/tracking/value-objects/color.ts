import { DomainError } from '../../core/domain-error';
import { type Result, ok, fail } from '../../core/result';
import { ValueObject } from '../../core/value-object';

const HEX_REGEX = /^#[0-9a-f]{6}$/;

// ── Error ──────────────────────────────────────────

export class InvalidColorError extends DomainError {
  constructor(hex: string) {
    super('INVALID_COLOR', `Invalid hex color: ${hex}`);
  }
}

// ── Color VO ───────────────────────────────────────

export class Color extends ValueObject<{ hex: string }> {
  private constructor(hex: string) {
    super({ hex });
  }

  /*
   *  Factory
   */

  static fromHex(hex: string): Result<Color, InvalidColorError> {
    const normalized = hex.toLowerCase();
    if (!HEX_REGEX.test(normalized)) return fail(new InvalidColorError(hex));
    return ok(new Color(normalized));
  }

  /*
   *  Query
   */

  contrastTextColor(): '#000000' | '#ffffff' {
    const { r, g, b } = this.rgb;

    const toLinear = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };

    const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    return luminance > 0.179 ? '#000000' : '#ffffff';
  }

  /*
   *  Getter
   */

  get hex(): string {
    return this.props.hex;
  }

  get rgb(): { r: number; g: number; b: number } {
    const hex = this.props.hex;
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }
}
