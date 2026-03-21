# tkhwang-life-logs

## Problem

시간을 어디에 쓰고 있는지 직관적으로 파악하기 어렵다.

- **시간 사용 파악 어려움**: 하루가 끝나면 "오늘 뭐 했지?" 싶을 때가 많다. 체감과 실제 시간 사용 사이에 괴리가 크다.
- **기존 앱의 높은 마찰**: 기록을 시작하려면 앱을 열고, 카테고리를 고르고, 설명을 쓰고… 단계가 많아 습관이 안 된다.
- **인사이트 부족**: 기록만 쌓이고 "그래서 어떻게 바꿔야 하는데?"에 대한 답이 없다.

## Vision

> "한 번의 터치로 시간을 기록하고, 데이터로 시간 사용 패턴을 이해하는 앱"

최소 마찰로 기록하고, 축적된 데이터에서 패턴과 인사이트를 제공한다.

## Tech

Typescript 기반 **DDD (Domain-Drive Design)** 적극 사용

- Domain : DDD
- Backend : nest.js
- Mobile : react-native expo
- Web : next.js
- Database : Supabase(postgresql)
