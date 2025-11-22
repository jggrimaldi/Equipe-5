import { db } from './db';
import { articles as articlesTable } from './schema';

const CATEGORIES = [
  "Tecnologia",
  "Saúde",
  "Política",
  "Economia",
  "Esportes",
  "Entretenimento",
  "Educação",
  "Cultura",
];

const articles = [
  {
    title: "# Inteligência Artificial revoluciona o diagnóstico médico",
    content: `# Inteligência Artificial revoluciona o diagnóstico médico 

A inteligência artificial está transformando a forma como os médicos diagnosticam doenças. Com algoritmos cada vez mais sofisticados, sistemas de IA conseguem identificar câncer e outras condições com precisão superior à dos radiologistas. 

## Resultados impressionantes 

Estudos recentes mostram que a IA consegue detectar tumores com até 94% de precisão. Isso significa que milhões de vidas podem ser salvas através de diagnósticos mais rápidos e acurados. 

## Implementação global 

Hospitais em todo o mundo já estão adotando essas tecnologias. No Brasil, o Hospital das Clínicas em São Paulo iniciou um projeto piloto com resultados promissores. 

Os pacientes chegam 30% mais rápido ao diagnóstico, reduzindo significativamente o tempo de tratamento.`,
    category: "Tecnologia",
    excerpt: "Algoritmos de IA superam radiologistas na precisão de diagnósticos, prometendo salvar milhões de vidas com detecção precoce de doenças.",
    image_url: "https://picsum.photos/seed/ai-medical/800/600"
  },
  {
    title: "# Novo tratamento para diabetes apresenta resultados promissores",
    content: `# Novo tratamento para diabetes apresenta resultados promissores 

Pesquisadores brasileiros desenvolveram uma nova abordagem para tratar diabetes tipo 2. O tratamento combina terapia gênica com medicamentos inovadores. 

## Fases de teste 

O estudo está em fase 2 dos testes clínicos, com resultados que surpreendem a comunidade científica. Pacientes relatam melhora significativa nos níveis de glicose. 

## Esperança para milhões 

No Brasil, mais de 15 milhões de pessoas têm diabetes. Este novo tratamento pode oferecer uma solução definitiva para muitos deles. 

A previsão é que o medicamento chegue ao mercado em 2026.`,
    category: "Saúde",
    excerpt: "Pesquisadores brasileiros avançam com terapia gênica e novos medicamentos que mostram resultados surpreendentes no controle da diabetes tipo 2.",
    image_url: "https://picsum.photos/seed/diabetes-research/800/600"
  },
  {
    title: "# Eleições municipais: os principais candidatos ao executivo",
    content: `# Eleições municipais: os principais candidatos ao executivo 

As eleições municipais estão se aproximando e os candidatos já começam a apresentar suas propostas. A campanha promete ser acirrada em várias cidades. 

## Propostas principais 

Os candidatos discutem temas como segurança pública, transporte público e educação. Cada um apresenta soluções distintas para os problemas locais. 

## Participação esperada 

Espera-se que a participação do eleitorado seja maior este ano, com campanhas mais digitais e próximas ao público.`,
    category: "Política",
    excerpt: "Com campanhas digitais e foco em segurança e transporte, candidatos municipais acirram a disputa pelo executivo nas próximas eleições.",
    image_url: "https://picsum.photos/seed/elections-vote/800/600"
  },
  {
    title: "# Bolsa de Valores atinge maior alta em 5 anos",
    content: `# Bolsa de Valores atinge maior alta em 5 anos 

O Índice Bovespa atingiu seu pico mais alto nos últimos 5 anos, refletindo a recuperação da economia brasileira. Investidores estrangeiros aumentaram suas posições no mercado. 

## Setores em destaque 

Os setores de tecnologia e energia lideram os ganhos. Empresas de siderurgia também apresentam bom desempenho. 

## Perspectivas futuras 

Analistas projetam continuação do crescimento, dependendo da aprovação de reformas fiscais no Congresso.`,
    category: "Economia",
    excerpt: "Impulsionado pelos setores de tecnologia e energia, o Índice Bovespa registra seu pico mais alto dos últimos cinco anos.",
    image_url: "https://picsum.photos/seed/stock-market/800/600"
  },
  {
    title: "# Brasil avança para as semi-finais da Copa América",
    content: `# Brasil avança para as semi-finais da Copa América 

A seleção brasileira conquistou uma vitória emocionante na fase de grupos e agora avança para as semi-finais da Copa América. O desempenho do time impressionou críticos e torcedores. 

## Destaques da partida 

Neymar foi eleito o melhor jogador do jogo, com atuação brilhante. A defesa também se destacou, concedendo apenas um gol. 

## Próximos desafios 

Na semi-final, a seleção enfrentará um adversário forte. A torcida já se prepara para mais uma noite de futebol intenso.`,
    category: "Esportes",
    excerpt: "Com atuação de gala e defesa sólida, a seleção brasileira garante vaga nas semi-finais e empolga a torcida.",
    image_url: "https://picsum.photos/seed/soccer-brazil/800/600"
  },
  {
    title: "# Novo filme de ficção científica quebra recorde de bilheteria",
    content: `# Novo filme de ficção científica quebra recorde de bilheteria 

O filme mais esperado do ano ultrapassou US$ 1 bilhão em arrecadação mundial. A produção, que custou US$ 300 milhões, já se tornou a mais bem-sucedida da história do cinema. 

## Crítica positiva 

Críticos elogiaram os efeitos especiais e a história envolvente. O filme mantém uma classificação de 9.2 no IMDb. 

## Impacto cultural 

Além do sucesso financeiro, o filme influenciou a cultura pop e gerou uma série de memes na internet.`,
    category: "Entretenimento",
    excerpt: "Superprodução de ficção científica ultrapassa US$ 1 bilhão em bilheteria e se torna fenômeno cultural global.",
    image_url: "https://picsum.photos/seed/scifi-movie/800/600"
  },
  {
    title: "# Educação digital transforma o aprendizado nas escolas brasileiras",
    content: `# Educação digital transforma o aprendizado nas escolas brasileiras 

As escolas brasileiras estão acelerando a adoção de tecnologias digitais. Tablets, lousas interativas e plataformas de aprendizado virtual já estão em 60% das escolas urbanas. 

## Resultados esperados 

Estudantes que utilizam ferramentas digitais mostram 25% de melhora no desempenho acadêmico. O engajamento também aumenta significativamente. 

## Desafios 

Ainda há desigualdade digital entre escolas públicas e privadas. O governo trabalha em programas para reduzir essa lacuna.`,
    category: "Educação",
    excerpt: "O uso de tablets e plataformas digitais em 60% das escolas urbanas já reflete em uma melhora de 25% no desempenho dos alunos.",
    image_url: "https://picsum.photos/seed/digital-education/800/600"
  },
  {
    title: "# Festival de Cinema reúne diretores renomados em São Paulo",
    content: `# Festival de Cinema reúne diretores renomados em São Paulo 

O maior festival de cinema da América Latina começa este mês. Mais de 300 filmes de todo o mundo concorrem a prêmios na mostra competitiva. 

## Sessões especiais 

Diretores como Denis Villeneuve e Greta Gerwig apresentam suas obras recentes. Haverá homenagens a cineastas brasileiros consagrados. 

## Ingressos 

Os ingressos estão à venda e já com 70% dos espaços preenchidos.`,
    category: "Cultura",
    excerpt: "São Paulo recebe o maior festival de cinema da América Latina, reunindo mais de 300 obras e diretores consagrados internacionalmente.",
    image_url: "https://picsum.photos/seed/film-festival/800/600"
  },
  {
    title: "# 5G chega a cidades do interior do Brasil",
    content: `# 5G chega a cidades do interior do Brasil 

A tecnologia 5G, que começou em cidades grandes, agora alcança o interior do país. Operadoras de telefonia expandem suas redes para municipalidades menores. 

## Impacto econômico 

Com 5G, pequenas empresas podem acessar tecnologias antes restritas às grandes cidades. Prevê-se criação de 50 mil novos empregos. 

## Velocidade 

A conexão 5G oferece velocidades 100 vezes mais rápidas que 4G, revolucionando o acesso à internet nas regiões.`,
    category: "Tecnologia",
    excerpt: "Expansão da rede 5G para o interior promete revolucionar a economia local e gerar 50 mil novos empregos.",
    image_url: "https://picsum.photos/seed/5g-network/800/600"
  },
  {
    title: "# Pandemia deixa legado na saúde mental dos brasileiros",
    content: `# Pandemia deixa legado na saúde mental dos brasileiros 

Três anos após o início da pandemia, estudos mostram que a saúde mental dos brasileiros ainda está afetada. Diagnósticos de ansiedade e depressão aumentaram 40%. 

## Apoio necessário 

Psicólogos alertam sobre a necessidade de políticas públicas para cuidar da saúde mental. Muitos municípios ainda carecem de centros de atendimento. 

## Iniciativas 

ONGs e voluntários trabalham oferecendo suporte gratuito à população.`,
    category: "Saúde",
    excerpt: "Estudos apontam um aumento de 40% nos diagnósticos de ansiedade e depressão, evidenciando o impacto duradouro da pandemia.",
    image_url: "https://picsum.photos/seed/mental-health/800/600"
  },
  {
    title: "# Reforma tributária enfrenta votação no Congresso",
    content: `# Reforma tributária enfrenta votação no Congresso 

Um dos projetos mais importantes do governo entra na fase final de votação. A reforma tributária promete simplificar o sistema de impostos e incentivar investimentos. 

## Pontos principais 

A proposta unifica diversos impostos em um único imposto sobre valor agregado. Empresas e economistas divergem sobre os efeitos. 

## Cronograma 

A votação está marcada para as próximas semanas, e espera-se que o texto seja aprovado.`,
    category: "Política",
    excerpt: "Congresso Nacional prepara votação final da reforma que visa simplificar impostos e estimular novos investimentos.",
    image_url: "https://picsum.photos/seed/tax-reform/800/600"
  },
  {
    title: "# Inflação segue em queda no Brasil",
    content: `# Inflação segue em queda no Brasil 

O índice de inflação registrou sua menor taxa em 12 meses. Alimentos, energia e transporte tiveram reduções significativas de preço. 

## Análise econômica 

O Banco Central atribui o resultado a políticas monetárias adequadas. A tendência deve continuar nos próximos meses. 

## Renda das famílias 

Com preços mais baixos, as famílias brasileiras ganham poder de compra. O varejo espera aumento de vendas.`,
    category: "Economia",
    excerpt: "Menor taxa inflacionária em 12 meses aumenta o poder de compra das famílias e anima o setor varejista.",
    image_url: "https://picsum.photos/seed/inflation-down/800/600"
  },
  {
    title: "# Campeonato Mundial de Vôlei tem Brasil como favorito",
    content: `# Campeonato Mundial de Vôlei tem Brasil como favorito 

A seleção feminina de vôlei é apontada como favorita para vencer o campeonato mundial. O time reúne as melhores jogadoras do país. 

## Trajetória 

O Brasil conquistou três títulos mundiais e busca seu quarto. A técnica Zé Roberto acredita na possibilidade. 

## Cronograma 

Os jogos começam em duas semanas, com o Brasil enfrentando adversários históricos.`,
    category: "Esportes",
    excerpt: "Em busca do tetracampeonato, seleção feminina de vôlei chega como grande favorita ao Mundial.",
    image_url: "https://picsum.photos/seed/volleyball/800/600"
  },
  {
    title: "# Série brasileira lidera audiência na plataforma de streaming",
    content: `# Série brasileira lidera audiência na plataforma de streaming 

Uma produção original brasileira conquistou o primeiro lugar em audiência global de uma plataforma de streaming. É a primeira vez que uma série nacional atinge essa posição. 

## Reconhecimento 

A série retrata a vida na periferia de São Paulo e conquistou críticos internacionais. Múltiplas temporadas foram já encomendadas. 

## Impacto 

O sucesso abre portas para mais produções brasileiras no cenário internacional.`,
    category: "Entretenimento",
    excerpt: "Produção nacional sobre a periferia de SP alcança o topo global do streaming e conquista a crítica internacional.",
    image_url: "https://picsum.photos/seed/streaming-series/800/600"
  },
  {
    title: "# Universidade brasileira entra no ranking das melhores do mundo",
    content: `# Universidade brasileira entra no ranking das melhores do mundo 

Uma universidade federal brasileira entrou no top 100 do ranking mundial de instituições de ensino. É um grande salto na classificação internacional. 

## Pesquisa 

O reconhecimento vem pelo destaque em pesquisa, especialmente nas áreas de medicina e engenharia. Parcerias internacionais também contribuem. 

## Bolsas 

A universidade anunciou novas bolsas para atrair pesquisadores de excelência.`,
    category: "Educação",
    excerpt: "Destaque em medicina e engenharia coloca universidade federal brasileira entre as 100 melhores do mundo.",
    image_url: "https://picsum.photos/seed/university-rank/800/600"
  },
  {
    title: "# Museu de arte abre exposição revolucionária",
    content: `# Museu de arte abre exposição revolucionária 

Um museu de arte brasileira inaugura uma exposição que reúne obras de artistas contemporâneos revolucionários. A mostra promete desafiar conceitos tradicionais de arte. 

## Artistas participantes 

Mais de 50 artistas contribuem com suas obras. A exposição permanecerá aberta por 6 meses. 

## Visitação 

Espera-se receber 200 mil visitantes durante o período.`,
    category: "Cultura",
    excerpt: "Nova exposição reúne 50 artistas contemporâneos para desafiar conceitos tradicionais e espera 200 mil visitantes.",
    image_url: "https://picsum.photos/seed/art-museum/800/600"
  },
  {
    title: "# Computação quântica faz avanços significativos",
    content: `# Computação quântica faz avanços significativos 

Cientistas brasileiros fazem avanços importantes na pesquisa de computação quântica. Um novo algoritmo consegue processar dados 10 vezes mais rápido. 

## Aplicações práticas 

A tecnologia pode revolucionar criptografia, desenvolvimento de medicamentos e análise de dados. Empresas multinacionais já demonstram interesse. 

## Futuro 

Espera-se que computadores quânticos comerciais apareçam nos próximos 5 anos.`,
    category: "Tecnologia",
    excerpt: "Cientistas brasileiros criam algoritmo quântico 10 vezes mais rápido, atraindo interesse de multinacionais.",
    image_url: "https://picsum.photos/seed/quantum-computing/800/600"
  },
  {
    title: "# Vacina brasileira contra dengue passa em testes clínicos",
    content: `# Vacina brasileira contra dengue passa em testes clínicos 

Uma vacina desenvolvida no Brasil contra dengue completou com sucesso seus testes clínicos. A eficácia atingiu 95% contra os quatro tipos do vírus. 

## Importância 

Com milhões de casos de dengue por ano na região tropical, a vacina pode salvar muitas vidas. 

## Disponibilidade 

O processo de aprovação regulatória está em andamento, com previsão de liberação em 2025.`,
    category: "Saúde",
    excerpt: "Com 95% de eficácia nos testes clínicos, nova vacina brasileira contra a dengue deve ser liberada em 2025.",
    image_url: "https://picsum.photos/seed/dengue-vaccine/800/600"
  },
  {
    title: "# Congresso aprova lei para proteger meio ambiente",
    content: `# Congresso aprova lei para proteger meio ambiente 

O Congresso Nacional aprovou uma legislação ambiental que expande as áreas de proteção na Amazônia. A lei foi aprovada com apoio bipartidário. 

## Objetivos 

A legislação visa reduzir o desmatamento em 50% nos próximos 5 anos. Multas para infratores aumentaram significativamente. 

## Reações 

Ambientalistas comemoram a aprovação, enquanto alguns setores da economia expressam preocupações.`,
    category: "Política",
    excerpt: "Nova legislação ambiental visa reduzir o desmatamento na Amazônia em 50% e endurece multas para infratores.",
    image_url: "https://picsum.photos/seed/amazon-forest/800/600"
  },
  {
    title: "# PIB brasileiro cresce acima das expectativas",
    content: `# PIB brasileiro cresce acima das expectativas 

O PIB brasileiro registrou crescimento de 3.5% no último trimestre, superando as previsões de analistas. Setores de serviços e indústria lideraram o crescimento. 

## Indicadores positivos 

Desemprego caiu para 8%, o menor nível em 5 anos. Investimento estrangeiro direto também aumentou. 

## Perspectivas 

Analistas elevaram a previsão de crescimento para 2024 em 2.5%.`,
    category: "Economia",
    excerpt: "PIB cresce 3.5% impulsionado por serviços e indústria, superando expectativas e reduzindo o desemprego.",
    image_url: "https://picsum.photos/seed/gdp-growth/800/600"
  },
  {
    title: "# Jogadora brasileira é eleita melhor do mundo",
    content: `# Jogadora brasileira é eleita melhor do mundo 

Uma jogadora brasileira de futebol foi eleita a melhor do mundo em sua posição. O prêmio reconhece seus 25 gols marcados esta temporada. 

## Reconhecimento 

Este é o segundo prêmio individual de destaque para o Brasil no futebol. A jogadora também foi nomeada capitã da seleção. 

## Expectativas 

Com essa formação, o Brasil espera conquistar ouro na próxima Olimpíada.`,
    category: "Esportes",
    excerpt: "Autora de 25 gols na temporada, brasileira é eleita a melhor jogadora do mundo e assume a capitania da seleção.",
    image_url: "https://picsum.photos/seed/best-player/800/600"
  },
  {
    title: "# Reality show brasileiro bate recorde de audiência",
    content: `# Reality show brasileiro bate recorde de audiência 

Um reality show de TV conquistou 40 milhões de espectadores em sua final. É o maior número de viewers de um programa brasileiro. 

## Participantes 

O programa acompanhou 20 participantes em um desafio de 3 meses. A competição foi acirrada do início ao fim. 

## Sequência 

Uma segunda temporada foi imediatamente encomendada pela emissora.`,
    category: "Entretenimento",
    excerpt: "Final de reality show alcança marca histórica de 40 milhões de espectadores e garante nova temporada.",
    image_url: "https://picsum.photos/seed/reality-tv/800/600"
  },
  {
    title: "# Programa de bolsas internacionais abre inscrições",
    content: `# Programa de bolsas internacionais abre inscrições 

O governo brasileiro anuncia abertura de inscrições para bolsas de estudo no exterior. São 5 mil bolsas totais para pós-graduação em universidades de ponta. 

## Beneficiários 

Estudantes de todas as regiões do país podem se candidatar. O programa inclui custeio total e bolsa mensal. 

## Prazos 

As inscrições ficarão abertas por 2 meses.`,
    category: "Educação",
    excerpt: "Governo lança programa com 5 mil bolsas integrais para pós-graduação nas melhores universidades do mundo.",
    image_url: "https://picsum.photos/seed/scholarships/800/600"
  },
  {
    title: "# Teatro brasileiro conquista prêmios internacionais",
    content: `# Teatro brasileiro conquista prêmios internacionais 

Uma companhia de teatro brasileira conquistou 3 prêmios em festival internacional. A peça retrata a história colonial do Brasil com linguagem contemporânea. 

## Crítica 

A montagem foi elogiada por sua criatividade e sensibilidade. Críticos internacionais a chamaram de "obra-prima". 

## Apresentações 

A companhia realizará turnê por 15 países europeus.`,
    category: "Cultura",
    excerpt: "Peça sobre a história colonial do Brasil vence três prêmios internacionais e é aclamada como 'obra-prima'.",
    image_url: "https://picsum.photos/seed/theater-awards/800/600"
  },
  {
    title: "# App brasileiro é adquirido por gigante da tecnologia",
    content: `# App brasileiro é adquirido por gigante da tecnologia 

Um aplicativo desenvolvido por startuppers brasileiros foi adquirido por uma das maiores empresas de tecnologia do mundo. O valor da transação não foi divulgado, mas fontes falam em bilhões. 

## Impacto 

O app oferecia soluções inovadoras para produtividade. Seus 50 milhões de usuários serão integrados à plataforma da empresa multinacional. 

## Fundadores 

Os fundadores anunciaram que investirão em novas startups brasileiras.`,
    category: "Tecnologia",
    excerpt: "Startup brasileira de produtividade é adquirida por gigante tech em transação bilionária.",
    image_url: "https://picsum.photos/seed/app-acquisition/800/600"
  },
  {
    title: "# Estudo revela hábitos alimentares mais saudáveis entre jovens",
    content: `# Estudo revela hábitos alimentares mais saudáveis entre jovens 

Uma pesquisa com 10 mil jovens brasileiros mostra que 60% deles adotam hábitos alimentares mais saudáveis. Vegetarianismo e veganismo crescem entre a população mais jovem. 

## Causas 

Conscientização ambiental e saúde são as principais razões para mudanças alimentares. Redes sociais têm papel importante na disseminação de informações. 

## Indústria alimentar 

Empresas de alimentos lançam novos produtos alinhados com essas tendências.`,
    category: "Saúde",
    excerpt: "Pesquisa revela que 60% dos jovens estão adotando dietas mais saudáveis, impulsionados por consciência ambiental.",
    image_url: "https://picsum.photos/seed/healthy-food/800/600"
  },
  {
    title: "# Banco Central anuncia novas medidas de política monetária",
    content: `# Banco Central anuncia novas medidas de política monetária 

O Banco Central divulgou sua nova política monetária para o ano. As taxas de juros devem permanecer estáveis, com possível redução em caso de inflação. 

## Comunicado 

Em coletiva de imprensa, o presidente do BC afirmou confiança na estabilidade econômica. Ele alertou, porém, para riscos externos. 

## Reações 

O mercado financeiro reagiu positivamente ao anúncio, com a bolsa subindo 2%.`,
    category: "Economia",
    excerpt: "Banco Central mantém juros estáveis e sinaliza confiança na economia, gerando alta de 2% na bolsa.",
    image_url: "https://picsum.photos/seed/central-bank/800/600"
  },
  {
    title: "# Nadador brasileiro quebra recorde sul-americano",
    content: `# Nadador brasileiro quebra recorde sul-americano 

Um nadador brasileiro completou a prova de 1500m estilo livre em tempo que quebra o recorde sul-americano. Seu tempo qualifica-o automaticamente para as próximas Olimpíadas. 

## Treinamento 

O atleta treinou por 5 anos para essa marca. Ele também bateu seu próprio recorde pessoal anterior. 

## Próximos passos 

Com a classificação garantida, o foco agora é a preparação para as Olimpíadas.`,
    category: "Esportes",
    excerpt: "Nadador brasileiro bate recorde sul-americano nos 1500m livres e carimba passaporte para as Olimpíadas.",
    image_url: "https://picsum.photos/seed/swimmer-record/800/600"
  },
  {
    title: "# Festival de música reúne artistas internacionais",
    content: `# Festival de música reúne artistas internacionais 

Um festival de música que acontecerá em São Paulo reunirá 80 artistas internacionais e nacionais. O evento durará 4 dias e promete atrair 500 mil pessoas. 

## Programação 

Artistas de diversos gêneros se apresentarão, do pop ao rock, passando por música eletrônica e samba. 

## Ingressos 

Os ingressos já estão sendo vendidos e 60% dos assentos foram preenchidos.`,
    category: "Entretenimento",
    excerpt: "Mega festival em São Paulo espera 500 mil pessoas para curtir 4 dias de shows com 80 artistas.",
    image_url: "https://picsum.photos/seed/music-concert/800/600"
  },
];

export const seed = async () => {
  try {
    console.log('🌱 Iniciando seed de artigos...');
    
    for (const article of articles) {
      const id = Math.random().toString(36).slice(2, 10);
      const randomViews = Math.floor(Math.random() * 5000) + 100;

      try {
        await db.insert(articlesTable).values({
          id,
          title: article.title,
          content: article.content,
          category: article.category,
          excerpt: article.excerpt,
          imageUrl: article.image_url,
          views: 0,
          author: 'Sistema de Seed',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`✅ Artigo inserido: ${article.title}`);
      } catch (error) {
        console.error(`❌ Erro ao inserir artigo: ${article.title}`);
        console.error(error);
      }
    }

    console.log('🎉 Seed completo! Artigos inseridos com sucesso.');
  } catch (err) {
    console.error('❌ Erro fatal durante seed:', err);
    process.exit(1);
  }
}

seed();