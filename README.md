# 요괴산하국 (妖怪山河國)

캐릭터 챗 세계관 소개 사이트 + 캐릭터 CG 이미지 호스팅.

## 사이트

GitHub Pages로 배포 시 루트의 `index.html`이 메인 페이지로 제공됩니다.

- **세계관** — 요괴산하국의 설정·법칙
- **대요괴** — 백연 / 카르한 / 적호 프로필·탭 전환·스와이프
- **영역** — 북·남·동 삼방 지도 (탭하면 해당 캐릭터로 이동)
- **CG 갤러리** — 146장 전체, 캐릭터 필터, 라이트박스

### 로컬 미리보기

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

브라우저에서 `http://localhost:8080` 접속.

## CG 이미지

| 캐릭터 | 폴더 | stem 수 |
|--------|------|---------|
| 백연 | `백연/` | 56 |
| 적호 | `적호/` | 43 |
| 카르한 | `카르한/` | 47 |

경로 규칙: `img_rules.json` · `IMG_SYSTEM_PROMPT.md` 참고.

```
BASE + {캐릭터폴더} + / + {캐릭터}_{stem}.webp
```

예: `https://raw.githubusercontent.com/dungdung22/dungdung22.github.io/main/백연/백연_미소.webp`

## 파일 구조

```
├── index.html          # 메인 소개 페이지
├── css/style.css
├── js/main.js
├── img_rules.json      # CG stem 규칙 (기계용)
├── IMG_SYSTEM_PROMPT.md
├── 백연/
├── 적호/
└── 카르한/
```

## 라이선스

창작 콘텐츠 · 성인(19+) 대상.
