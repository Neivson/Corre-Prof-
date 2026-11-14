# Corre, Prof! — V1.0-A.1 | Revisão técnica da fundação

## Escopo desta revisão

- Mantidas todas as mecânicas, mapas, armas e personagens da V1.0-A.
- Criado `src/utils/progress.ts`: um único registro JSON `correprof_progress_v1` grava moedas, níveis de melhorias, conquistas e cenários concluídos juntos, reduzindo inconsistências entre chaves.
- Migração automática dos quatro registros antigos no primeiro carregamento; os dados legados não são apagados pela migração, e o reset limpa tanto o registro novo quanto os anteriores.
- Normalização de dados carregados: moedas como inteiros seguros não negativos; melhorias entre níveis 0 e 5; conquistas conhecidas e seus valores de progresso; cenários válidos e únicos.
- As recompensas concedidas no fim da partida agora são gravadas no mesmo registro que a conclusão do cenário.

## Verificações realizadas

- Teste isolado em Node.js: escrita/leitura, migração, limpeza, validação de dados inválidos e cenários duplicados: APROVADO.
- Transpilação sintática com TypeScript global de `App.tsx`, `ActiveGame.tsx` e `progress.ts`: sem erros sintáticos.
- Verificação de estrutura do pacote e PNGs válidos herdados da V1.0-A.

## Limitações e pendências para homologação

- `npm ci` falhou neste ambiente com `Exit handler never called!`; os pacotes não estão disponíveis. Consequentemente, `npm run build`, `npm run lint` e execução do jogo NÃO foram homologados.
- Não foram executados testes end-to-end no navegador ou no Android.
- Registro JSON único reduz inconsistências, mas não fornece garantia de gravação quando o `localStorage` está indisponível ou cheio. O código registra erro no console.
- O escopo desta revisão NÃO inclui balanceamento, novas artes nem reestruturação do motor.

## Testes manuais obrigatórios

1. Executar `npm ci`, `npm run lint` e `npm run build` em um ambiente com acesso funcional às dependências.
2. Iniciar partida, pausar e retomar; perder e ganhar; confirmar recompensas.
3. Ganhar moedas e desbloquear uma conquista, recarregar o jogo, verificar valores e ausência de recompensa duplicada.
4. Comprar uma melhoria, recarregar, conferir nível e saldo.
5. Completar cenário, recarregar, conferir conclusão.
6. Validar preservação de progresso de uma instalação com chaves antigas.
7. Executar reset e confirmar ausência de reaparecimento de moedas ou conquistas após recarga.
8. Verificar controles e FPS em Android real.

**Estado:** V1.0-A.1 é candidata à homologação técnica; não avançar à V1.0-B sem validação de execução.
