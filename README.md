# Yousuf Dairy — Website Code Guide

Yeh file bataati hai ke code kaise organized hai, aur kal ko kuch change
karna ho to kahan jaana hai. Teen files hain:

- `index.html` — poora page structure aur content
- `style.css` — sab design, colors, spacing, responsive rules
- `script.js` — cart, WhatsApp ordering, carousel, mobile menu, quick view modal

Jahan bhi maine recently koi change kiya hai, code mein `CHANGED` likha
hua comment milega — us se pata chal jayega ke naya kya add hua hai.

---

## 1. WhatsApp number set karna (SABSE ZAROORI)

`script.js` file ki **line 18** par:

```js
const WHATSAPP_NUMBER = "923001234567"; // <-- REPLACE with your WhatsApp business number
```

Apna real number is format mein daalein: country code + number, **no +
sign, no spaces**. Example: `92` + `3001234567` = `"923001234567"`.

Ye ek jagah change karne se poori site ke saare WhatsApp buttons (header,
hero, cart checkout, floating button, footer) automatically update ho
jayenge.

---

## 2. Logo change karna

**File:** `index.html`, header section (`<header class="site-header">` ke andar)

```html
<a href="#top" class="logo">
  <img src="logo.png" alt="Yousuf Dairy Logo" class="logo-img">
  <span class="logo-text">Yousuf <em>Dairy</em></span>
</a>
```

- `src="logo.png"` ko apni logo file ke naam/path se badal dein
  (image file `index.html` ke saath waali folder mein honi chahiye,
  ya poora path likhein jaise `images/logo.png`)
- Text hatana ho to `<span class="logo-text">...</span>` wali line delete kar dein

**Logo ka size change karna** — `style.css` mein `.logo-img` rule dhoondein:

```css
.logo-img {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 50%;   /* isko delete kar dein agar circle nahi chahiye */
  flex-shrink: 0;
}
```

Bas `width`/`height` ki value badal dein — dono hamesha barabar rakhein
taake circle shape kharab na ho.

Mobile par chhota logo dikhta hai — is size ko change karna ho to
`style.css` mein `@media (max-width: 767px)` block ke andar
`.logo-img { width: 34px; height: 34px; }` line dhoondein.

---

## 3. Background color / image change karna

**Poori site ka background color** — `style.css` ki **sabse pehli lines**
mein `:root { }` block hai:

```css
:root {
  --bg: #F7F2E7;   /* yahan koi bhi color code daal dein */
}
```

Isi `:root` block mein baaqi sab colors bhi hain (`--navy`, `--gold`,
`--ink`, wagera) — inhe change karne se poori site ka color theme
badal jata hai, kyunke har section inhi variables ko use karta hai.

**Sirf ek section ka background** — us section ke CSS selector mein
`background` add karein. Jaise "Why Us" section ka background:

```css
.section-alt {
  background: #EAF2EE;
}
```

**Background image lagani ho:**

```css
.hero {
  background-image: url('images/farm-bg.jpg');
  background-size: cover;       /* har screen size par poora fill kare */
  background-position: center;  /* image hamesha center se dikhe */
  background-repeat: no-repeat;
}
```

`background-size: cover` responsive rehne ka raaz hai — chhoti/badi
screen har jagah image sahi fit hogi.

---

## 4. Reviews section (naya add kiya gaya hai)

Yeh section `index.html` mein "Why Us" aur "Location" section ke beech
mein hai (dhoondein `<!-- CHANGED: new Reviews section` comment).

Naya review card add karna ho to yeh block copy karke `.review-grid`
ke andar paste kar dein aur text badal dein:

```html
<blockquote class="review-card">
  <p>"Apna review yahan likhein."</p>
  <cite>— Customer Name, Area</cite>
</blockquote>
```

Styling `style.css` mein `.review-grid` aur `.review-card` rules mein hai
(dhoondein `CHANGED: REVIEWS SECTION` comment).

---

## 5. Products (Cow Milk, Butter, wagera) — naya product add karna

`index.html` mein `id="products"` section ke andar, `.carousel` ke
upar hi ek comment hai jo poori tarah explain karta hai. Short version:

Har product ek `<article class="product-card">` hai jisme yeh
attributes hain:

| Attribute      | Kya karta hai                                  |
|----------------|--------------------------------------------------|
| `data-id`      | Unique key (cart isse pehchanta hai, spaces na ho) |
| `data-name`    | Cart aur WhatsApp message mein dikhta hai        |
| `data-emoji`   | Fallback icon — sirf tab dikhta hai jab `data-img` na ho |
| `data-img`     | Product ki real photo (file name ya path) — card aur Quick View modal dono jagah yehi dikhti hai |
| `data-unit`    | Price ke saath dikhta hai (Litre, kg, cup, etc.) |
| `data-price`   | Sirf number, "Rs." ya comma nahi                 |
| `data-desc`    | Quick View modal mein description                |

Naya product add karne ke liye koi bhi ek `<article>` block copy karein,
attributes + andar ka text/price badlein — cart, quick view, aur
WhatsApp message sab khud-ba-khud kaam karenge. Kisi aur file mein
kuch change karne ki zaroorat nahi.

### Product photos — CHANGED (naya system)

Ab har product card ke andar ek real `<img>` tag hai (emoji ki jagah),
aur ye photo Quick View modal mein bhi automatically dikhti hai —
kahin alag se set karne ki zaroorat nahi. Filhal ye filenames use ho
rahe hain (sab `index.html`/`style.css` waali folder mein honi
chahiye, ya poora path likhein jaise `images/cowimg.png`):

| Product          | File name (abhi placeholder hai) |
|-------------------|-----------------------------------|
| Cow Milk          | `cowimg.png` |
| Buffalo Milk       | `buffaloimg.png` |
| Goat Milk         | `goatimg.png` |
| Butter            | `butterimg.png` |
| Plain Yogurt       | `yogurtimg.png` |
| Flavoured Yogurt   | `flavouredyogurtimg.png` |
| Desi Ghee         | `gheeimg.png` |

Har product mein **do jagah** file name likhna hai (dono same rakhein):
1. Card ke andar `<img src="...">`
2. Article tag ke `data-img="..."` attribute mein

Photo automatically responsive hai — chhoti/badi screen har jagah
box ko crop-fill karti hai (stretch nahi hoti), `object-fit: cover`
ki wajah se. Agar kisi product ki photo abhi nahi hai, to `data-img`
attribute hata dein — emoji fallback wapas dikhne lag jayega, kuch
tootega nahi.

### Size options (naya system) — CHANGED

Cow Milk, Buffalo Milk, Goat Milk aur Bread — in charon mein ab
**size options** hain (Pao / Adha Litre / 1 Litre for milk, aur
Small / Medium / Large for Bread), har size ki apni price ke sath.
Customer jo size select karega, cart aur WhatsApp message usi price
aur naam ke sath jayega.

**Naya size add/edit karna** — product card ke andar `.size-select`
block dhoondein:

```html
<div class="size-select">
  <button class="size-btn" data-size="Pao" data-price="90">Pao<span>250ml</span></button>
  <button class="size-btn" data-size="Adha Litre" data-price="170">Adha Litre<span>500ml</span></button>
  <button class="size-btn active" data-size="1 Litre" data-price="330">1 Litre<span>1000ml</span></button>
</div>
```

- `data-size` — cart aur WhatsApp message mein yehi naam dikhega
- `data-price` — us size ki price (number only)
- `<span>` ke andar wala text chhota subtitle hai (jaise "250ml") — optional hai, hata bhi sakte hain
- `active` class jis button par ho, wahi size default selected hota hai jab page load ho

Naya size add karna ho, bas ek `<button class="size-btn">` copy
karke naya `data-size`/`data-price`/text likh dein — kuch aur
edit karne ki zaroorat nahi.

**Kisi product se size options hatani ho** (wapas single price par
le jana ho) — bas `.size-select` wala poora `<div>` delete kar dein.
Product khud-ba-khud purane single-price system par chala jayega
(jo `data-unit`/`data-price` attributes se aata hai).

**Quick View modal mein size** — agar product ke paas size options
hain, modal khulte hi wahi size buttons khud-ba-khud modal ke andar
bhi dikh jate hain (alag se kuch set karne ki zaroorat nahi, script.js
khud card se copy kar leta hai).



---

## 6. Cart system kaise kaam karta hai (script.js)

- `cart` naam ka ek JavaScript object sab items store karta hai
- Product card ke `+`/`−` buttons, cart drawer ke `+`/`−` buttons, aur
  Quick View modal ke `+`/`−` — teeno isi ek `cart` object ko update
  karte hain, isliye sab jagah number hamesha match karta hai
- "Checkout on WhatsApp" button click hone par `cart` se ek formatted
  message banta hai (har item + total) aur WhatsApp khul jata hai

Agar kabhi cart mein koi naya field add karna ho (jaise discount code),
`script.js` ke **Part 5: CART SYSTEM** section mein dekhein — sab cart
logic wahin hai.

---

## 7. Quick View Modal (product picture click karne se khulta hai)

`script.js` ke **Part 6: QUICK VIEW MODAL** section mein poora code hai.
Ye modal product card ke `data-*` attributes se hi apni info leta hai
— agar aap `data-desc` ya `data-price` change karte hain, modal khud
update ho jayega, alag se kuch edit nahi karna.

---

## 8. Responsive breakpoints (mobile / tablet / laptop)

`style.css` ke bilkul end mein `RESPONSIVE` comment ke neeche:

- `@media (max-width: 767px)` → **Mobile**: hamburger menu dikhta hai,
  sab grids 1-column ho jaate hain
- `@media (min-width: 768px) and (max-width: 1023px)` → **Tablet**: full
  nav (no hamburger), lekin kuch grids 2-column mein adjust hote hain
- Baaqi sab kuch (1024px se upar) → **Laptop/Desktop**: full nav, full
  multi-column grids

Naya section add karte waqt agar wo mobile par theek na dikhe, to bas
uska grid `@media (max-width: 767px)` block ke andar `1fr` kar dein
(jaise `.review-grid { grid-template-columns: 1fr; }` — yehi pattern
har jagah use hua hai `.why-grid`, `.location-wrap`, `.footer-inner`
sabke liye).

---

## 9. File structure summary

```
index.html   → Header, Hero, Products Carousel, Why Us, Reviews,
                Location/Map, CTA, Footer, Cart Drawer, Quick View Modal
style.css    → :root colors/fonts at top, then one section per
                page-section (matches index.html order)
script.js    → 6 numbered parts (see top of file):
                1. Setup   2. Mobile nav   3. WhatsApp helper
                4. Carousel   5. Cart system   6. Quick View modal
```

Har jagah `CHANGED` comment likha hai jahan recently kuch add/edit
hua — search karke dhoond sakte hain (Ctrl+F "CHANGED").