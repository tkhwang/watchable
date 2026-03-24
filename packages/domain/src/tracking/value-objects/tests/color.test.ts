import { describe, it, expect } from 'vitest';
import { Color, InvalidColorError } from '../color';

describe('Color', () => {
  describe('정상적인 경우 생성에 성공한다', () => {
    it('fromHex("#ff5733" orange-red)이면 hex === "#ff5733"', () => {
      const ORANGE_RED = '#ff5733';
      const result = Color.fromHex(ORANGE_RED);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.hex).toBe(ORANGE_RED);
      }
    });

    it('fromHex("#FF5733" orange-red uppercase)이면 소문자 정규화되어 hex === "#ff5733"', () => {
      const result = Color.fromHex('#FF5733');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.hex).toBe('#ff5733');
      }
    });

    it('fromHex("#000000" black)이면 성공', () => {
      const BLACK = '#000000';
      const result = Color.fromHex(BLACK);

      expect(result.ok).toBe(true);
    });

    it('fromHex("#ffffff" white)이면 성공', () => {
      const WHITE = '#ffffff';
      const result = Color.fromHex(WHITE);

      expect(result.ok).toBe(true);
    });
  });

  describe('비정상적인 경우 생성에 실패한다', () => {
    it('"ff5733" (#없음)이면 InvalidColorError', () => {
      const COLOR_WO_HASH = 'ff5733';
      const result = Color.fromHex(COLOR_WO_HASH);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidColorError);
        expect(result.error.code).toBe('INVALID_COLOR');
      }
    });

    it('"#fff" (3자리)이면 InvalidColorError', () => {
      const result = Color.fromHex('#fff');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidColorError);
      }
    });

    it('"#gggggg" (잘못된 문자)이면 InvalidColorError', () => {
      const result = Color.fromHex('#gggggg');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidColorError);
      }
    });

    it('"" (빈 문자열)이면 InvalidColorError', () => {
      const result = Color.fromHex('');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidColorError);
      }
    });
  });

  // ── query ───────────────────────────────────────

  describe('query', () => {
    describe('contrastTextColor', () => {
      it('어두운 배경(#000000 black)이면 "#ffffff"', () => {
        const result = Color.fromHex('#000000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.contrastTextColor()).toBe('#ffffff');
        }
      });

      it('밝은 배경(#ffffff white)이면 "#000000"', () => {
        const result = Color.fromHex('#ffffff');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.contrastTextColor()).toBe('#000000');
        }
      });

      it('중간 색상(#ff5733 orange-red)이면 올바른 대비색 반환', () => {
        const result = Color.fromHex('#ff5733');

        expect(result.ok).toBe(true);
        if (result.ok) {
          const contrast = result.value.contrastTextColor();
          expect(['#000000', '#ffffff']).toContain(contrast);
        }
      });
    });
  });

  // ── getter ──────────────────────────────────────

  describe('getter', () => {
    it('hex는 소문자 정규화된 값을 반환한다', () => {
      const result = Color.fromHex('#FF5733');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.hex).toBe('#ff5733');
      }
    });

    it('rgb "#ff5733" orange-red는 { r: 255, g: 87, b: 51 }을 반환한다', () => {
      const result = Color.fromHex('#ff5733');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.rgb).toEqual({ r: 255, g: 87, b: 51 });
      }
    });

    it('rgb "#000000" black은 { r: 0, g: 0, b: 0 }을 반환한다', () => {
      const result = Color.fromHex('#000000');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.rgb).toEqual({ r: 0, g: 0, b: 0 });
      }
    });
  });

  // ── equals & 불변성 ─────────────────────────────

  describe('equals & 불변성', () => {
    it('같은 hex(#ff5733 orange-red)이면 equals true', () => {
      const ORANGE_RED = '#ff5733';
      const a = Color.fromHex(ORANGE_RED);
      const b = Color.fromHex(ORANGE_RED);

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it('다른 hex(orange-red vs black)이면 equals false', () => {
      const ORANGE_RED = '#ff5733';
      const BLACK = '#000000';
      const a = Color.fromHex(ORANGE_RED);
      const b = Color.fromHex(BLACK);

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
    });

    it('대소문자 다르게 생성해도 정규화되어 equals true', () => {
      const a = Color.fromHex('#FF5733');
      const b = Color.fromHex('#ff5733');

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });
  });
});
