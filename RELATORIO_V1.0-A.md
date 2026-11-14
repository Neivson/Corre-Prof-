# Corre, Prof! — V1.0-A | Fundação técnica (parcial)

## Alterações realizadas

1. **Recursos PNG:** seis arquivos em `public/` estavam corrompidos (bytes UTF-8 de substituição na assinatura PNG). Os quatro ícones foram reconstruídos a partir de `src/assets/images/teacher_game_icon_1782255179654.jpg`, e as duas imagens de apresentação a partir dos JPG originais correspondentes. Os tamanhos são compatíveis com o `manifest.json`. **Nota:** as imagens de apresentação são artes pré-existentes e não prova de execução real do jogo.
2. **Recompensas de conquistas:** `checkAchievements` passou a retornar as conquistas atualizadas e o valor de recompensa, sem executar um `setTimeout` que escrevia moedas posteriormente. Compra de upgrades e conclusão de partida agora acrescentam o bônus no mesmo `saveProgress`, reduzindo o risco de perda/inconsistência ou reaparecimento de moedas após reset.
3. **Loja:** encerrada a compra de níveis acima dos cinco custos definidos; removido cálculo de custo não utilizado.
4. **Persistência:** saldo carregado do armazenamento local só é aceito se for número inteiro seguro não negativo.
5. **PWA:** versão de cache alterada para `corre-prof-v1-0-a` para invalidar cache antigo; idioma principal do HTML corrigido para `pt-BR`.

## Validações executadas

- Todos os seis PNGs abrem e passam por verificação de integridade no Pillow; dimensões conferidas.
- Arquivos `src/App.tsx` e `src/components/ActiveGame.tsx` analisados sintaticamente pelo compilador TypeScript sem diagnósticos sintáticos.
- Nenhuma alteração no balanceamento de armas, cenários, inimigos, controles e motor de combate.

## Limitações e pendências obrigatórias antes de aprovar esta etapa

- **Build completo e checagem de tipos NÃO homologados:** `npm ci` não concluiu neste ambiente; o `tsc --noEmit` reportou bibliotecas de tipos ausentes. Isso é falha de instalação de dependências no ambiente de análise, não evidência de erro ou sucesso do jogo.
- **Nenhuma partida foi executada** no navegador ou Android. Permanecem para testes reais: início, pausa, derrota, vitória, compras, conquistas, salvar/fechar/reabrir, reset e instalação PWA.
- **Refatoração do `ActiveGame.tsx` adiada:** só deve ser feita após confirmação de build e teste de regressão; mexer no motor de combate sem ambiente executável ampliaria o risco.
- A gravação continua usando múltiplas chaves `localStorage`, não uma transação atômica; a mudança elimina o atraso das recompensas, mas não garante persistência caso o armazenamento falhe.

## Como validar no computador com Node.js

```bash
npm ci
npm run lint
npm run build
npm run dev
```

No navegador, testar uma partida, uma conquista, saldo e compra; recarregar e confirmar que o progresso é preservado. Para Android, seguir o fluxo Capacitor do projeto após instalar dependências e configurar a plataforma nativa. **Não considerar a V1.0-A fechada enquanto os testes de execução não passarem.**
