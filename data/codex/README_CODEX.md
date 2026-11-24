# 📖 Códice do Olimpo — Enciclopédia & Lore Mitológico

O **Códice do Olimpo** é o compêndio canônico de história, lendas mitológicas, dados táticos de unidades, construções, tecnologias e panteões do *Age of Mythology: Olympus*.

## Estrutura do Banco de Dados (`olympus_codex_database.json`)

O arquivo compilado centraliza **805 verbetes**:
- **`civilizations`** (5): Grécia, Egito, Nórdicos, Atlântida e China.
- **`gods`** (91): Deuses Maiores (T5) e Deuses Menores de todas as mitologias.
- **`heroes`** (28): Campeões épicos e heróis semideuses (Ájax, Quíron, Telamon, Nefertari, etc.).
- **`units_military`** (180): Infantaria, arqueiros, cavalaria, navios de guerra e armas de cerco.
- **`units_myth`** (106): Criaturas mitológicas, autômatos, colossos, titãs e monstros lendários.
- **`buildings`** (29): Centros urbanos, templos, quartéis, fortalezas, altares divinos e maravilhas.
- **`techs`** (343): Tecnologias, relíquias sagradas e bênçãos divinas das Eras T1 a T5.
- **`mechanics`** (23): Conceitos de jogo (Favor, Linha de Visão, Eras, Formações e Recursos).

## Estrutura de Cada Verbete (Schema)

```json
{
  "id": "zeus",
  "title": "Zeus",
  "pantheon": "greek",
  "category": "god",
  "summary": "Breve resumo de 1-2 frases para tooltips e cards rápidos mobile...",
  "lore": "Texto completo em Português com a lenda mitológica e papel histórico...",
  "metadata": {
    "ocupação": "Rei dos Deuses do Olimpo",
    "poder_divino": "Relâmpago Fulminante"
  }
}
```

## Como o Engine (Godot 4) Consome o Códice
- **Autoload `OlympusCodex`** (`scripts/autoload/olympus_codex.gd`): provê acesso global e cache indexado.
- **Tela de Consulta `OlympusCodexScreen`** (`scenes/ui/olympus_codex_screen.tscn`): acessível via Menu Principal.
- **Tooltip Tático In-Game**: acessível através de toque longo ou botão `[ ? ]` nas cartas de unidade do `MobileHUD`.
