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

What to write for an upload bug (minimal version):

/bug-fix
1. Current issue: upload creates duplicate athletes when name casing differs.
2. Expected behavior: Joao, JOAO, and 1. Joao must merge into one athlete.
3. Affected scope: upload ingestion flow and name matching.
4. Acceptance criteria:
5. Joao and JOAO merge.
6. Joao and Joana remain separate.
7. Stats are aggregated.
8. Use #file:docs/upload-button-feature.md as source of truth.

practical rule:

Simple bug: 5 to 8 lines.
Medium bug: 10 to 15 lines.
Complex bug: full template.
