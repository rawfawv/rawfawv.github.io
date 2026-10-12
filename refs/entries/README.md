# 레퍼런스 선반 · 코드 작업

이 폴더에 올린 HTML 작업은 [레퍼런스 선반](https://rawfawv.github.io/refs/)에 카드로 올라가요.

- **폴더로 올리기**: 폴더 안에 `index.html`을 두고, 이미지·JS·CSS는 같은 폴더에 함께 넣어요.
  `https://rawfawv.github.io/refs/entries/폴더이름/` 주소로 열려요.
- **파일 하나 올리기**: `작업이름.html`을 그대로 올려요.

GitHub 웹에서는 이 폴더 화면에서 **Add file → Upload files**로 폴더나 파일을 끌어놓고 **Commit changes**를 누르면 돼요.
1~2분 뒤 선반을 새로고침하면 보여요.

카드 제목·설명·분류는 HTML의 `<head>`에서 읽어요. 없으면 폴더(파일) 이름으로 보여요.

```html
<title>카드에 보일 제목</title>
<meta name="description" content="한 줄 설명">
<meta name="category" content="모션">
<!-- 선택: 미리보기 대신 쓸 썸네일 이미지 -->
<meta property="og:image" content="thumb.png">
```
