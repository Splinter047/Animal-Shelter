#!/bin/bash

# Compile both Mermaid diagrams to PDF
npx -p @mermaid-js/mermaid-cli mmdc -i ER_Diagram_1NF.mmd -o ER_Diagram_1NF.pdf
npx -p @mermaid-js/mermaid-cli mmdc -i ER_Diagram_3NF.mmd -o ER_Diagram_3NF.pdf

# Merge PDFs
pdfunite ER_Diagram_1NF.pdf ER_Diagram_3NF.pdf ER_Diagram.pdf

rm ER_Diagram_1NF.pdf ER_Diagram_3NF.pdf
