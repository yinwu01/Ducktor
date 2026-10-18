# Test fixtures

`grad-project/` is a fictional student project (block-skipping attention, "BlockSkip") used by
`tests/e2e/flow.js`. Nothing in it is a real result, and the paper, code and notes describe no
real system. The files inside do not say so themselves, on purpose: in the first e2e runs a
model that saw "fictional" in the notes treated every number as fake, which made the run
unlike a real student's. Planted problems: a single-run accuracy gain, an em-dash, a claim
against "existing sparse attention methods" with no such baseline in the table, and a Method
section that says "attention mass" while the code scores blocks by mean dot products.
