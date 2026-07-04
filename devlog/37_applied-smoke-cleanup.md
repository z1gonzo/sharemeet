# 37: Applied smoke-test data cleanup

Data: 2026-07-04

## Zmiana

Wykonano realny cleanup starych lokalnych smoke-test records po wcześniejszym dry-run review.

Komendy:

```bash
cd backend
npm run cleanup:smoke
npm run cleanup:smoke:apply
npm run cleanup:smoke
npm run seed:demo
```

## Wynik przed apply

Dry-run wykazał stare smoke-test records:

| Typ | Liczba |
| --- | ---: |
| Users | 12 |
| Posts | 6 |
| Comments | 2 |
| Follows | 2 |

Kandydaci pasowali do znanych patternów smoke-testów, m.in. `smoke*`, `feed*`, `composer*`, `ui<digits>*`, `myposts*`, `following*`, `followed*`, `comments*`, `profilefollower*`, `owneractions*`, `uiowner*` oraz `@example.com`.

## Wynik apply

`npm run cleanup:smoke:apply` usunął:

```text
Deleted 12 user(s) and their cascaded records.
```

Następny dry-run zwrócił:

```text
No smoke-test candidate users found.
✅ Nothing to clean up.
```

## Demo seed po cleanupie

Po cleanupie uruchomiono ponownie:

```bash
npm run seed:demo
```

Finalny stan lokalnej DB:

| Typ | Liczba |
| --- | ---: |
| Users | 4 |
| Posts | 8 |
| Comments | 4 |
| Follows | 4 |
| `@example.com` users | 0 |

Pozostały tylko demo konta:

- `z1gonzo@sharemeet.local`
- `maria@sharemeet.local`
- `adam@sharemeet.local`
- `kasia@sharemeet.local`

Wszystkie demo konta mają hasło:

```text
DemoPass123!
```

## Ryzyka / ograniczenia

- Operacja dotyczy lokalnej DB dev, nie zmienia kodu aplikacji.
- Nie uruchamiano globalnego resetu bazy.
- Skrypt cleanup nadal pozostaje dostępny jako dry-run-first narzędzie na przyszłość.
