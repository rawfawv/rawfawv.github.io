# 레퍼런스 선반 · 코드 작업

이 폴더에 올린 HTML 작업은 [레퍼런스 선반](https://rawfawv.github.io/refs/)에 카드로 올라가요.
`https://rawfawv.github.io/refs/entries/폴더이름/` 주소로 열려요.

## 올리는 법

1. 선반에서 **+ 코드 폴더 올리기** → 제목·분류·메모를 쓰고 **카드 정보 파일 받기**
2. 받은 `card.json`을 작업 폴더 안(`index.html` 옆)에 넣기. 이미지·JS·CSS도 같은 폴더에
3. 이 폴더 화면에서 **Add file → Upload files** → 작업 폴더를 통째로 끌어놓고 **Commit changes**

1~2분 뒤 선반을 새로고침하면 보여요. 파일 하나(`작업이름.html`)만 올려도 되지만, 그때는 `card.json`을 쓸 수 없어서
제목·분류·메모를 HTML `<head>`에 적어야 해요.

## card.json

```json
{
  "title": "카드에 보일 제목",
  "category": "모션",
  "note": "한 줄 설명",
  "thumb": "thumb.png"
}
```

`thumb`는 선택이에요. 없으면 작업 화면을 그대로 줄여서 미리보기로 보여줘요.
나중에 고치려면 선반 카드의 **수정**을 누르면 `card.json` 편집 화면이 열려요.

## card.json 없이 쓰기 (HTML head)

```html
<title>카드에 보일 제목</title>
<meta name="description" content="한 줄 설명">
<meta name="category" content="모션">
<meta property="og:image" content="thumb.png">
```

둘 다 있으면 `card.json`이 먼저예요.
