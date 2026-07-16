Para um bug novo, faça assim:

1. Mantenha o arquivo base igual
   Deixe bug-fix.prompt.md como template fixo.

2. Coloque a informação nova no chat, ao chamar o prompt
   Use /bug-fix e escreva o bug logo abaixo.
   Esse texto vira o conteúdo de {{input}} automaticamente.

3. Se o bug tiver muitos detalhes, coloque em um plano separado
   Crie um arquivo como .github/plans/Bug-X.md e no chat envie:

- /bug-fix
- Use #file:.github/plans/Bug-X.md as source of truth

4. Estrutura recomendada para o texto do bug

- Problema atual
- Comportamento esperado
- Arquivos/área afetada
- Critérios de aceite

---

Use um plano em .github/docs quando houver muitas regras.
No chat, envie:

/bug-fix ou /enhancement ou /ui-polish
Use #file:.github/plans/Nome-do-plano.md as source of truth
