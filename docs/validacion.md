# Matriz de Validación

| Unidad | Caso de prueba | Entradas | Resultado Analítico | Resultado Simulador | Estado |
|--------|----------------|----------|---------------------|---------------------|--------|
| U1 | Potencial de una carga | q=1uC, r=1m | 8.98e3 V | ~8987.55 V | Pasó |
| U1 | Dipolo en plano medio | q1=1uC(x=-1), q2=-1uC(x=1), r=(0,1) | 0 V | 0 V | Pasó |
| U2 | Duplicar área | A=100cm2 a 200cm2 | C_2 = 2 * C_1 | C_2 = 2 * C_1 | Pasó |
| U2 | Dieléctrico en V fijo | V=10V, er=1 a 2 | Q, C y U aumentan; V constante | Q, C, U aumentan; V cte | Pasó |
| U2 | Dieléctrico en Q fijo | er=1 a 2, Q fijo | C aumenta, V, E, U disminuyen | C aumenta, V, E, U disminuyen | Pasó |
