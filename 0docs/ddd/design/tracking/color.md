# Color

> **파일**: `packages/domain/src/tracking/value-objects/color.ts`
> **BC**: Tracking
> **역할**: Task의 시각 구분을 위한 hex 색상 Value Object

---

## Props

```typescript
{ hex: string }
```

## 불변식

- `/^#[0-9a-f]{6}$/` (6자리 hex, 소문자 정규화)
- 입력 시 대문자는 소문자로 변환하여 저장

## Error

```typescript
export class InvalidColorError extends DomainError {
  constructor(hex: string) {
    super('INVALID_COLOR', `Invalid hex color: ${hex}`);
  }
}
```

---

## API (method 순서: factory → query → getter)

### Factory

| 메서드 | 시그니처 | 설명 |
|--------|---------|------|
| `fromHex` | `(hex: string): Result<Color, InvalidColorError>` | 검증 + 소문자 정규화 |

### Query

| 메서드 | 시그니처 | 설명 |
|--------|---------|------|
| `contrastTextColor` | `(): '#000000' \| '#ffffff'` | WCAG 상대 휘도 기반. 배경 위 텍스트 가독성 |

#### contrastTextColor() 규칙

WCAG 상대 휘도 공식:
1. sRGB → linear: `c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4`
2. 휘도: `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`
3. `L > 0.179` → `'#000000'` (어두운 텍스트), 아니면 `'#ffffff'` (밝은 텍스트)

### Getter

| 메서드 | 시그니처 | 설명 |
|--------|---------|------|
| `hex` | `get hex(): string` | 소문자 정규화된 hex 값 |
| `rgb` | `get rgb(): { r: number; g: number; b: number }` | hex에서 계산. 0-255 범위 |

---

## Equals

기본 구현 사용 (`hex` 원시값 → shallow `===` 비교). 소문자 정규화로 일관성 보장.

---

## 직렬화

없음. Repository 도입 시 추가 예정 (Domain First, Persistence Later).
