# Bank Logos

This folder contains the bank logos used across the app — the public **Pay** page,
the **admin** bank-accounts list, and the **mobile** Bank Accounts screen.

## ⚠️ The current files are PLACEHOLDERS

The PNGs in this folder are generated badges (initials on a colored gradient),
**not** the official bank logos. Replace each file with the bank's real logo,
**keeping the exact same filename** — everything updates automatically:

- Web: one deploy of the repo serves the new logos to every customer.
- Mobile: logos are loaded from the server (`/banks/<file>.png`), so the app
  picks them up with **no rebuild needed**.

## How to add a real logo

1. Download/export the bank's logo (square, PNG, ideally with a transparent
   background, at least 256×256 — 512×512 is best).
2. Save it over the placeholder with the **exact filename** from the table
   below.
3. Commit and push. Done — no code changes.

If a specific hotel needs a custom logo, they can still upload one per account
in **admin → Bank Accounts → edit → Bank Logo** (that overrides the static one).

## Filename map

| Bank | File |
|---|---|
| Commercial Bank of Ethiopia | `cbe.png` |
| Awash Bank | `awash.png` |
| Dashen Bank | `dashen.png` |
| Bank of Abyssinia | `boa.png` |
| Wegagen Bank | `wegagen.png` |
| United Bank | `united.png` |
| Zemen Bank | `zemen.png` |
| Nib International Bank | `nib.png` |
| Lion International Bank | `lib.png` |
| Cooperative Bank of Oromia | `cbo.png` |
| Oromia Bank | `oromia.png` |
| Abay Bank | `abay.png` |
| Amhara Bank | `amhara.png` |
| Enat Bank | `enat.png` |
| Ahadu Bank | `ahadu.png` |
| Hijra Bank | `hijra.png` |
| Siinqee Bank | `siinqee.png` |
| Goh Betoch Bank | `gb.png` |
| Tseday Bank | `tseday.png` |
| Aya Bank | `aya.png` |
| Addis International Bank | `addis.png` |
| Berhan Bank | `berhan.png` |
| Debub Global Bank | `dgb.png` |
| Global Bank Ethiopia | `global.png` |
| Custom / unknown bank fallback | `custom.png` |

## Where the mapping lives in code

- Web: `src/lib/ethiopian-banks.ts` → `getBankLogo(bankName)`
- Mobile: `cafe-admin-mobile/src/utils/ethiopianBanks.ts` → `getBankLogo(bankName)`

Both look up the same slug table, so a new file in this folder is instantly
available to every screen. To add a brand-new bank to the presets, add it to
**both** files (name, short code, brand color, `logo: logo('slug')`) and drop
the PNG here.
