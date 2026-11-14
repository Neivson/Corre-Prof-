# Corre, Prof! — V1.0-B.2 | Estabilidade de quadros

## Base
V1.0-B.1 (hordas), aprovada em teste funcional pelo usuário. Esta versão não altera armas, dificuldade, inimigos ou recompensas.

## Ajustes
- O ciclo de física continua com passo fixo de 60 Hz, mas limita a **duas** atualizações por quadro. Antes, podia executar até cinco atualizações completas em sequência após um atraso, criando picos adicionais de trabalho.
- Descarte controlado do atraso acumulado quando o orçamento termina; ao retornar de abas suspensas evita-se uma fila de atualizações atrasadas.
- Diagnóstico opcional `?perf=1` no URL. A cada 10 segundos, o console mostra número de quadros medidos, quadros acima de 34 ms, maior intervalo, passos de física descartados e quantidades de inimigos, projéteis e itens.
- Não há custo extra de contagem de quadros e relatório quando o diagnóstico está desativado, além das condicionais.

## Limitação importante
Em aparelhos sustentadamente abaixo de 30 FPS, limitar a duas atualizações de física por quadro pode desacelerar a simulação. Isso é um compromisso deliberado para não acumular processamento; precisa ser verificado no dispositivo real. A otimização reduz a *amplificação* de picos, não elimina necessariamente a causa original de todos os engasgos. Ainda não há benchmark real de FPS.

## Verificações feitas
- Parse TSX pelo compilador TypeScript global: OK.
- Quatro testes da separação espacial (compilados separadamente): APROVADOS.
- `npm install --offline`: não concluiu por dependência ausente no cache. Logo, `npm run lint` e `npm run build` completos seguem sem validação neste ambiente.

## Como testar no PC
No PowerShell, na pasta extraída:
```
npm.cmd install
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```
Abra o endereço local exibido. Para registrar os picos, acrescente `?perf=1` ao fim do endereço (por exemplo `http://localhost:3000/?perf=1`). Pressione F12 > Console. Jogue 2–3 minutos com hordas densas e compare os engasgos. Copie uma ou duas mensagens `[Corre, Prof! desempenho]` e informe se a movimentação e o ritmo do combate parecem normais.

## Reversão
Se houver desaceleração perceptível, engasgos mais frequentes ou alteração da sensação de combate, retorne à versão V1.0-B.1.

**Status:** candidato a teste, ainda não homologado.
