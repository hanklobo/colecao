# Validação dos cromos — pré-v1

Fonte dos dados: checklist oficial Panini FIFA World Cup 2026 (ChecklistInsider),
conferido contra **fotos do álbum físico** enviadas pelo usuário.

## O que foi verificado contra as fotos
- **Estrutura**: 980 cromos = 9 Abertura + 11 FIFA Museum + 48 seleções × 20
  (#1 escudo, #13 foto da equipe, 18 jogadores). ✓
- **Abertura/Sedes**: `00` Logo, `FWC1` Emblema, `FWC3` Mascote, `FWC4` Slogan,
  `FWC5` Bola (Trionda), `FWC6/7/8` Canadá/México/EUA. ✓
- **Grupos (A–L)**: extraídos da página-índice do álbum e aplicados às 48
  seleções. ✓
- **Conferência por foto (amostra)**: México (1–20 exato), Coreia do Sul,
  Inglaterra (Grupo L), Argentina (Grupo J) — todas batem com o JSON. ✓

## Correções aplicadas (typos herdados da fonte, nomes conhecidos)
| Seleção | # | Antes | Depois |
|---|---|---|---|
| Canadá | 6 | Riche Larvea | Richie Laryea |
| EUA | 2 | Math Freese | Matt Freese |
| EUA | 10 | Weston McKenny | Weston McKennie |
| Equador | 14 | John Veboah | John Yeboah |
| Arábia Saudita | 18 | Feras Akbrikan | Firas Al-Buraikan |
| Argélia | 9 | Houssem Aquar | Houssem Aouar |
| Iraque | 11 | Ibrahim Bavesh | Ibrahim Bayesh |
| Coreia do Sul | 16 | Dongg-yeong Lee | Dong-gyeong Lee |
| Nova Zelândia | 2 | Max Crocombe Payne | Max Crocombe |
| Panamá | 19 | Jose Luiz Rodriguez | Jose Luis Rodriguez |

## Observação
Os nomes restantes vêm do checklist oficial e conferem com a amostra de fotos.
Como as fotos são de celular (nomes pequenos, sobretudo grafias coreanas/árabes/
africanas), não foi feita uma redigitação cega dos 980 — isso adicionaria risco
de erro a uma base já correta. Se algum nome específico estiver divergente no
álbum, basta informar a seleção + número que ajustamos pontualmente.
