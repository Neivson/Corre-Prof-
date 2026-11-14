# Corre, Prof! — V1.0-B.1 | Otimização da separação das hordas

## Escopo

Primeira intervenção controlada na jogabilidade, baseada na V1.0-A.1 aprovada nos sete testes manuais no navegador. **Não altera** dano, velocidade, geração de inimigos, recompensas, armas ou progressão.

## Alterações

- Eliminada a primeira passagem de separação inimigo-inimigo que comparava todos os pares de inimigos vivos a **cada tick**. Era redundante com a segunda passagem.
- A segunda passagem, antes feita entre todos os inimigos na área próxima, foi substituída por `src/utils/enemySeparation.ts`, que usa uma grade espacial de 96 px e compara apenas os ocupantes da mesma célula ou de células vizinhas. Mantidos o raio local original de 220 px e a execução a cada dois ticks.
- Mantido o comportamento especial de deslocar apenas inimigos normais quando encostam em chefes. Sobreposição exata recebe uma direção determinística para evitar coordenadas inválidas.
- Incluídos testes automatizados em `tests/enemySeparation.test.mjs`.

## Verificações locais

- Compilação isolada da nova função com TypeScript: OK.
- 4 testes automatizados: OK (sobreposição exata, chefe imóvel, exclusão de inimigos mortos/distantes e fronteira de célula).
- Análise sintática isolada de `ActiveGame.tsx` e novo utilitário: OK.
- **Ainda não executados:** `npm run lint`, `npm run build`, benchmark real de FPS e partida no navegador/Android. Não há dependências npm instaladas neste ambiente.

## Como testar no PC (PowerShell)

```powershell
npm.cmd install
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Depois, no endereço apresentado pelo terminal, repetir os sete testes da V1.0-A.1 e observar se as hordas continuam se espalhando, sem agrupamentos excessivos, tanto com inimigos comuns quanto com chefes. Testar ao menos uma fase com uma horda numerosa. Se houver comportamento estranho, reverter à V1.0-A.1.

## Estado

**V1.0-B.1 candidata a teste, não homologada.** Balanceamento, chefes e controles permanecem para próximas intervenções, após validação deste pacote.
