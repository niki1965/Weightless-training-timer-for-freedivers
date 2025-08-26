# 음성 파일 사용 가이드

## 권장 파일 형식

### 1. MP3 (.mp3) - 가장 권장 ⭐
- **장점**: 가장 널리 지원되는 형식, 압축률이 좋아 파일 크기가 작음
- **브라우저 호환성**: 최고
- **웹 성능**: 버벅임이 가장 적음
- **권장 설정**: 128kbps, 44.1kHz

### 2. WebM (.webm) - 대안
- **장점**: 더 작은 파일 크기, 모던 브라우저에서 좋은 성능
- **단점**: 일부 브라우저에서 지원하지 않을 수 있음
- **권장 설정**: 128kbps, 44.1kHz

### 3. OGG (.ogg) - 대안
- **장점**: 오픈소스 형식, 작은 파일 크기
- **단점**: 브라우저 지원이 제한적
- **권장 설정**: 128kbps, 44.1kHz

## 파일 명명 규칙

현재 코드에서 사용하는 파일명:
- `round1-starts-soon.mp3` - "Round 1 starts soon" 메시지용
- `get-ready-to-hold.mp3` - "Get ready to hold" 메시지용
- `get-ready-to-breathe.mp3` - "Get ready to breathe" 메시지용
- `breathe-gently-round-begun.mp3` - "Breathe gently. The round has begun." 메시지용
- `final-round-closing.mp3` - "The final round is closing." 메시지용

## 파일 크기 권장사항

- **최대 파일 크기**: 500KB 이하
- **재생 시간**: 3-5초 이하
- **품질**: 128kbps (MP3) 또는 동등한 품질

## 브라우저 호환성

| 브라우저 | MP3 | WebM | OGG |
|---------|-----|------|-----|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ❌ | ❌ |
| Edge | ✅ | ✅ | ✅ |

## 사용법

1. 음성 파일들을 이 폴더에 다음 이름으로 저장:
   - `round1-starts-soon.mp3` - "Round 1 starts soon" 메시지용
   - `get-ready-to-hold.mp3` - "Get ready to hold" 메시지용
   - `get-ready-to-breathe.mp3` - "Get ready to breathe" 메시지용
   - `breathe-gently-round-begun.mp3` - "Breathe gently. The round has begun." 메시지용
   - `final-round-closing.mp3` - "The final round is closing." 메시지용
2. 웹페이지에서 해당 메시지들이 나타날 때 자동으로 재생됨
3. 사용자가 처음 페이지를 방문할 때는 사용자 상호작용(클릭 등)이 필요할 수 있음

## 음성 파일 제작 팁

1. **명확한 발음**: 각 메시지를 명확하게 발음
   - "Round 1 starts soon"
   - "Get ready to hold"
   - "Get ready to breathe"
   - "Breathe gently. The round has begun."
   - "The final round is closing."
2. **적절한 속도**: 너무 빠르지 않게, 이해하기 쉬운 속도로
3. **음량**: 너무 크지 않게, 배경음악과 조화롭게
4. **포맷**: MP3 형식으로 변환하여 사용
5. **일관성**: 모든 음성 파일의 톤과 스타일을 일관되게 유지
