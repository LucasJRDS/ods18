# ODS 18 Brasil - Dashboard de Paridade Étnico-Racial

![ODS 18](https://img.shields.io/badge/ODS-18-007bff?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

Este projeto é um dashboard analítico focado no **ODS 18 (Igualdade Racial)**, especificamente nos indicadores de paridade de rendimento no Brasil. Desenvolvido para apoiar a visualização de dados do **Censo Demográfico 2022 (IBGE)**, o dashboard oferece uma visão imersiva das desigualdades étnico-raciais e de gênero através de mapas dinâmicos e gráficos avançados.

## 🚀 Tecnologias

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualização de Dados**: [Recharts](https://recharts.org/)
- **Cartografia**: [React Simple Maps](https://www.react-simple-maps.io/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)

## 📊 Fontes de Dados e Metodologia

Os dados são consumidos em tempo real via **API SIDRA (IBGE)**:
- **Tabela Principal**: 10281 (Censo Demográfico 2022)
- **Variáveis**: 
  - `13536`: Rendimento nominal médio mensal das pessoas de 14 anos ou mais de idade, ocupadas na semana de referência.
  - `13535`: Pessoas de 14 anos ou mais de idade, ocupadas na semana de referência.
- **Cálculo de Paridade**: O dashboard utiliza a **Média Ponderada Populacional** para calcular a paridade nacional e regional, garantindo rigor estatístico ao ponderar o rendimento pelo tamanho da população ocupada de cada Unidade da Federação.

## 🛠️ Configuração Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/LucasJRDS/ods18.git
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📄 Licença

Este projeto foi desenvolvido sob orientação técnica para fins de disseminação de indicadores ODS. Sinta-se à vontade para utilizar e contribuir seguindo as diretrizes de dados abertos.
