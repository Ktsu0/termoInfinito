const CROSSWORD_THEMES = {
  animais: [
    {
      word: "ORNITORRINCO",
      clue: "Mamífero ovíparo australiano com bico de pato.",
    },
    {
      word: "CAMALEAO",
      clue: "Réptil famoso por sua habilidade de mudar de cor.",
    },
    {
      word: "AXOLOTE",
      clue: "Anfíbio mexicano capaz de regenerar partes do corpo.",
    },
    {
      word: "PANGOLIM",
      clue: "Mamífero coberto de escamas que se enrola como bola.",
    },
    { word: "GUEPARDO", clue: "O animal terrestre mais rápido do mundo." },
    {
      word: "NARVAL",
      clue: "O 'unicórnio do mar', cetáceo com uma longa presa.",
    },
    {
      word: "KOMODO",
      clue: "Ilha onde vive o maior lagarto do mundo.",
    },
    {
      word: "POLVO",
      clue: "Molusco cefalópode com três corações e sangue azul.",
    },
    {
      word: "SURICATO",
      clue: "Pequeno mamífero africano que vive em sentinela.",
    },
    {
      word: "HIENA",
      clue: "Predador africano conhecido por seu som semelhante a uma risada.",
    },
    {
      word: "OCAPI",
      clue: "Parente da girafa que parece uma mistura com zebra.",
    },
    {
      word: "COALA",
      clue: "Marsupial que se alimenta exclusivamente de eucalipto.",
    },
    {
      word: "LONTRA",
      clue: "Mamífero semiaquático famoso por dormir de mãos dadas.",
    },
    {
      word: "MORCEGO",
      clue: "O único mamífero capaz de voar verdadeiramente.",
    },
    { word: "ALCE", clue: "O maior membro da família dos cervos." },
    {
      word: "ORCA",
      clue: "Conhecida como baleia assassina, mas é um golfinho.",
    },
    { word: "TUCANO", clue: "Ave tropical com um bico enorme e colorido." },
    { word: "AVESTRUZ", clue: "A maior ave do mundo, mas não pode voar." },
    { word: "PINGUIM", clue: "Ave marinha que 'voa' debaixo d'água." },
    {
      word: "GOLFINHO",
      clue: "Mamífero marinho extremamente inteligente e sociável.",
    },
    {
      word: "CAPIVARA",
      clue: "O maior roedor do mundo, símbolo de carisma e tranquilidade.",
    },
    {
      word: "PANDA",
      clue: "Urso chinês que se alimenta quase exclusivamente de bambu.",
    },
    {
      word: "RINOCERONTE",
      clue: "Grande mamífero herbívoro com um ou dois chifres no nariz.",
    },
    {
      word: "TARTARUGA",
      clue: "Réptil com carapaça conhecido pela longevidade e lentidão.",
    },
    {
      word: "CANGURU",
      clue: "Marsupial australiano famoso por seus saltos poderosos.",
    },
    {
      word: "BALEIA",
      clue: "O maior animal que já existiu no planeta.",
    },
    {
      word: "ESQUILO",
      clue: "Pequeno roedor que enterra sementes e tem cauda peluda.",
    },
    {
      word: "CORUJA",
      clue: "Ave de rapina noturna símbolo da sabedoria.",
    },
    {
      word: "CROCODILO",
      clue: "Grande réptil semiaquático com a mordida mais forte da natureza.",
    },
    {
      word: "FLAMINGO",
      clue: "Ave pernalta de cor rosa devido à sua alimentação.",
    },
    {
      word: "ARARA",
      clue: "Ave colorida da floresta tropical com bico forte para quebrar nozes.",
    },
    {
      word: "MICO",
      clue: "Pequeno primata brasileiro muito comum em matas urbanas.",
    },
    {
      word: "JACARE",
      clue: "Réptil comum no Pantanal brasileiro, parente do crocodilo.",
    },
    {
      word: "TAMANDUA",
      clue: "Animal que usa sua língua longa para comer formigas e cupins.",
    },
    {
      word: "TATU",
      clue: "Mamífero com armadura que se enrola para se proteger.",
    },
    {
      word: "BORBOLETA",
      clue: "Inseto que passa por uma metamorfose completa a partir de uma lagarta.",
    },
    {
      word: "MORSA",
      clue: "Grande mamífero marinho do Ártico com presas longas de marfim.",
    },
    {
      word: "CISNE",
      clue: "Ave aquática elegante famosa por sua fidelidade e beleza.",
    },
    {
      word: "LOBO",
      clue: "Canídeo selvagem que vive e caça em alcateias hierarquizadas.",
    },
    {
      word: "RAPOSA",
      clue: "Animal astuto da família dos cães, com cauda fofa e orelhas pontudas.",
    },
  ],
  comidas: [
    { word: "GUACAMOLE", clue: "Iguaria mexicana feita à base de abacate." },
    {
      word: "RISOTO",
      clue: "Prato italiano de arroz cremoso cozido em caldo.",
    },
    {
      word: "ESTROGONOFE",
      clue: "Prato de origem russa com carne e creme de leite.",
    },
    {
      word: "RATATOUILLE",
      clue: "Clássico cozido de legumes da culinária francesa.",
    },
    {
      word: "TIRAMISU",
      clue: "Sobremesa italiana que leva café e queijo mascarpone.",
    },
    { word: "SUSHI", clue: "Prato japonês à base de arroz temperado e peixe." },
    {
      word: "PAELLA",
      clue: "Famoso prato espanhol de arroz com frutos do mar.",
    },
    {
      word: "CROISSANT",
      clue: "Pão de massa folhada em formato de lua crescente.",
    },
    { word: "CEVICHE", clue: "Prato peruano de peixe cru marinado em limão." },
    {
      word: "FONDUE",
      clue: "Experiência suíça de mergulhar pão em queijo derretido.",
    },
    { word: "TRUFA", clue: "Fungo subterrâneo raríssimo e muito valorizado." },
    {
      word: "QUICHE",
      clue: "Torta aberta francesa recheada com creme e ovos.",
    },
    {
      word: "PROFITEROLE",
      clue: "Carolinas recheadas com creme e calda de chocolate.",
    },
    { word: "CARPACCIO", clue: "Lâminas finíssimas de carne crua temperada." },
    {
      word: "BRUSCHETTA",
      clue: "Antepasto italiano de pão torrado com tomate e alho.",
    },
    {
      word: "FALAFEL",
      clue: "Bolinho de grão-de-bico frito típico do oriente médio.",
    },
    {
      word: "CURRY",
      clue: "Prato indiano com molho temperado à base de especiarias.",
    },
    {
      word: "CHURRASCO",
      clue: "Carne assada no fogo, paixão nacional no Brasil.",
    },
    {
      word: "BACALHAU",
      clue: "Peixe salgado e seco, estrela da culinária portuguesa.",
    },
    {
      word: "PUDIM",
      clue: "Sobremesa de leite condensado com calda de caramelo.",
    },
    {
      word: "COXINHA",
      clue: "Salgado brasileiro frito recheado com frango desfiado.",
    },
    {
      word: "FEIJOADA",
      clue: "Prato brasileiro completo com feijão preto e carnes de porco.",
    },
    {
      word: "TAPIOCA",
      clue: "Iguaria de goma de mandioca, popular no café da manhã brasileiro.",
    },
    {
      word: "LASANHA",
      clue: "Massa italiana em camadas com queijo, presunto e molho.",
    },
    {
      word: "PIZZA",
      clue: "Disco de massa coberto com molho de tomate e queijo.",
    },
    {
      word: "HAMBURGUER",
      clue: "Sanduíche circular com carne grelhada e diversos acompanhamentos.",
    },
    {
      word: "OMELETE",
      clue: "Prato feito com ovos batidos e fritos na frigideira.",
    },
    {
      word: "MOQUECA",
      clue: "Cozido de peixe brasileiro feito em panela de barro.",
    },
    {
      word: "BRIGADEIRO",
      clue: "O doce de chocolate mais famoso das festas brasileiras.",
    },
    {
      word: "SORVETE",
      clue: "Sobremesa gelada e cremosa disponível em diversos sabores.",
    },
    {
      word: "CANELONE",
      clue: "Massa cilíndrica recheada e coberta com molho e queijo.",
    },
    {
      word: "PAMONHA",
      clue: "Pequeno pacote de massa de milho verde cozido.",
    },
    {
      word: "PASTEL",
      clue: "Massa frita crocante com recheios variados, clássico de feira.",
    },
    {
      word: "CHURROS",
      clue: "Massa frita alongada recheada com doce de leite.",
    },
    {
      word: "ACARAGE",
      clue: "Bolinho de feijão fradinho frito no dendê, típico da Bahia.",
    },
    {
      word: "EMPADA",
      clue: "Pequena torta de massa podre recheada com palmito ou frango.",
    },
    {
      word: "GNOCCHI",
      clue: "Pequenas bolinhas de massa de batata cozidas, servidas com molho.",
    },
    {
      word: "CANJICA",
      clue: "Doce de milho branco cozido com leite e canela.",
    },
    {
      word: "MANDIOCA",
      clue: "Raiz comestível muito versátil na culinária brasileira.",
    },
    {
      word: "FAROFA",
      clue: "Acompanhamento brasileiro de farinha de mandioca ou milho temperada.",
    },
    {
      word: "WAFFLE",
      clue: "Massa prensada entre duas placas quentes com relevo quadriculado.",
    },
    {
      word: "CUPCAKE",
      clue: "Pequeno bolo individual decorado e recheado.",
    },
    {
      word: "YAKISOBA",
      clue: "Macarrão frito japonês com legumes e carne ao molho shoyu.",
    },
    {
      word: "TACO",
      clue: "Tortilha de milho mexicana recheada com carne e temperos.",
    },
  ],
  tecnologia: [
    {
      word: "CRIPTOGRAFIA",
      clue: "Técnica de codificar mensagens para torná-las secretas.",
    },
    {
      word: "BLOCKCHAIN",
      clue: "Tecnologia de registro descentralizado das criptomoedas.",
    },
    {
      word: "PROCESSADOR",
      clue: "O 'cérebro' do computador que executa instruções.",
    },
    {
      word: "FIBRAOTICA",
      clue: "Tecnologia que transmite dados na velocidade da luz.",
    },
    {
      word: "FIREWALL",
      clue: "Dispositivo de segurança que controla o tráfego de rede.",
    },
    {
      word: "METAVERSO",
      clue: "Mundo virtual imersivo que integra realidade física e digital.",
    },
    {
      word: "LINUX",
      clue: "Sistema operacional de código aberto e núcleo gratuito.",
    },
    {
      word: "ALGORITMO",
      clue: "Conjunto lógico de instruções para realizar uma tarefa.",
    },
    {
      word: "FIRMWARE",
      clue: "Software de baixo nível gravado diretamente no hardware.",
    },
    {
      word: "PROTOCOLO",
      clue: "Conjunto de regras que permite a comunicação em rede.",
    },
    {
      word: "RECONHECIMENTO",
      clue: "Tecnologia que permite identificar rostos ou vozes automaticamente.",
    },
    {
      word: "PERIFERICO",
      clue: "Dispositivo externo conectado ao computador.",
    },
    {
      word: "SATELITE",
      clue: "Equipamento em órbita que permite o GPS e TV.",
    },
    { word: "DATASET", clue: "Coleção de dados usada para treinar IAs." },
    {
      word: "SERVIDOR",
      clue: "Computador potente que fornece serviços a outros.",
    },
    { word: "BROWSER", clue: "Programa usado para navegar na Web." },
    { word: "DOWNLOAD", clue: "Ato de baixar um arquivo da internet." },
    {
      word: "DATABASE",
      clue: "Repositório organizado de informações digitais.",
    },
    {
      word: "PHISHING",
      clue: "Tentativa fraudulenta de obter dados confidenciais.",
    },
    {
      word: "COOKIES",
      clue: "Pequenos arquivos que sites salvam no seu navegador.",
    },
  ],
  escola: [
    {
      word: "PALEONTOLOGIA",
      clue: "Ciência que estuda os fósseis e a vida antiga.",
    },
    {
      word: "FILOSOFIA",
      clue: "Estudo das questões fundamentais sobre existência, conhecimento e ética.",
    },
    { word: "LITERATURA", clue: "Arte de escrever livros, poemas e romances." },
    {
      word: "GRAMATICA",
      clue: "Conjunto de regras que regem o uso de uma língua.",
    },
    {
      word: "GEOMETRIA",
      clue: "Ramo da matemática que estuda formas e tamanhos.",
    },
    {
      word: "ASTRONOMIA",
      clue: "Ciência que estuda os corpos celestes e o universo.",
    },
    {
      word: "ALGEBRA",
      clue: "Parte da matemática que usa letras para representar números.",
    },
    { word: "MITOLOGIA", clue: "Conjunto de lendas e mitos de um povo." },
    {
      word: "SOCIOLOGIA",
      clue: "Ciência que estuda o comportamento humano em sociedade.",
    },
    {
      word: "ANTROPOLOGIA",
      clue: "Estudo das culturas e origens da humanidade.",
    },
    { word: "BIOLOGIA", clue: "Ciência que estuda os seres vivos e a vida." },
    {
      word: "QUIMICA",
      clue: "Ciência que estuda a matéria e suas transformações.",
    },
    {
      word: "FISICA",
      clue: "Ciência que estuda as leis da natureza, energia e matéria.",
    },
    { word: "PSICOLOGIA", clue: "Estudo da mente e do comportamento humano." },
    {
      word: "DICIONARIO",
      clue: "Obra de referência com definições de palavras.",
    },
    {
      word: "TABELAPERIODICA",
      clue: "A tabela que organiza todos os elementos químicos.",
    },
    { word: "CALIGRAFIA", clue: "A arte de escrever à mão de forma bela." },
    {
      word: "ESTATISTICA",
      clue: "Ciência que coleta e analisa dados numéricos.",
    },
    { word: "RETORICA", clue: "A arte do convencimento através da fala." },
    { word: "PEDAGOGIA", clue: "Ciência que estuda os métodos de ensino." },
    { word: "CADERNO", clue: "Objeto usado para fazer anotações nas aulas." },
    { word: "LAPIS", clue: "Instrumento básico de escrita feito de grafite e madeira." },
    { word: "BORRACHA", clue: "Usada para apagar erros cometidos com o lápis." },
    { word: "MOCHILA", clue: "Bolsa usada para carregar livros e materiais escolares." },
    { word: "RECREIO", clue: "Intervalo entre as aulas para descanso e lanche." },
    { word: "PROFESSOR", clue: "Aquele que transmite conhecimento aos alunos." },
    { word: "BIBLIOTECA", clue: "Local da escola onde ficam guardados os livros." },
    { word: "CANETA", clue: "Instrumento de escrita que utiliza tinta." },
    { word: "REGUA", clue: "Objeto usado para medir e traçar linhas retas." },
    { word: "ESTOJO", clue: "Pequena bolsa para guardar lápis, canetas e borracha." },
    { word: "APONTADOR", clue: "Usado para fazer a ponta do lápis." },
    { word: "MERENDA", clue: "Refeição servida aos alunos durante o intervalo." },
    { word: "QUADRO", clue: "Superfície onde o professor escreve a matéria." },
    { word: "GIZ", clue: "Bastão de calcário usado para escrever no quadro negro." },
    { word: "UNIFORME", clue: "Roupa padrão usada pelos estudantes da escola." },
    { word: "EXAME", clue: "Avaliação formal do conhecimento do aluno." },
    { word: "HISTORIA", clue: "Matéria que estuda os acontecimentos do passado." },
    { word: "MATEMATICA", clue: "Matéria que estuda os números e cálculos." },
    { word: "GEOGRAFIA", clue: "Matéria que estuda a Terra e suas características." },
    { word: "ALUNO", clue: "Aquele que frequenta a escola para aprender." },
  ],
  objetos: [
    {
      word: "TELESCOPIO",
      clue: "Instrumento usado para observar estrelas e planetas.",
    },
    {
      word: "AMPULHETA",
      clue: "Antigo relógio que usa areia para medir o tempo.",
    },
    {
      word: "MICROSCOPIO",
      clue: "Usado para ver seres minúsculos invisíveis a olho nu.",
    },
    {
      word: "BUSSOLA",
      clue: "Instrumento de navegação com uma agulha magnética.",
    },
    { word: "BAROMETRO", clue: "Instrumento que mede a pressão atmosférica." },
    {
      word: "ESTETOSCOPIO",
      clue: "Aparelho médico usado para ouvir o coração.",
    },
    {
      word: "SISMOGRAFO",
      clue: "Aparelho que registra a intensidade de terremotos.",
    },
    {
      word: "EXTINTOR",
      clue: "Equipamento usado para combater princípios de incêndio.",
    },
    { word: "PARAFUSO", clue: "Peça metálica em espiral usada para fixação." },
    {
      word: "ALAVANCA",
      clue: "Máquina simples usada para mover objetos pesados.",
    },
    {
      word: "PRISMA",
      clue: "Objeto de vidro que decompõe a luz nas cores do arco-íris.",
    },
    {
      word: "CALEIDOSCOPIO",
      clue: "Brinquedo que cria padrões simétricos com espelhos.",
    },
    {
      word: "CANIVETE",
      clue: "Ferramenta de corte dobrável com várias funções.",
    },
    {
      word: "CADEADO",
      clue: "Dispositivo de metal usado para trancar portas.",
    },
    { word: "LANTERNA", clue: "Dispositivo portátil que produz luz." },
    { word: "MOCHILA", clue: "Usada para carregar pertences nas costas." },
    { word: "RELOGIO", clue: "Instrumento que marca a passagem das horas." },
    {
      word: "TERMOMETRO",
      clue: "Instrumento que mede a temperatura corporal ou ambiente.",
    },
    { word: "GUARDACHUVA", clue: "Objeto usado para se proteger da chuva." },
    { word: "FONE", clue: "Aparelho usado nos ouvidos para escutar música." },
  ],
  cinema: [
    {
      word: "DIRETOR",
      clue: "Responsável por comandar a produção de um filme.",
    },
    { word: "ROTEIRO", clue: "Texto que contém falas e cenas de um filme." },
    { word: "ATOR", clue: "Pessoa que interpreta personagens no cinema." },
    { word: "ATRIZ", clue: "Mulher que atua em filmes." },
    { word: "CENARIO", clue: "Ambiente onde a cena do filme acontece." },
    { word: "TRILHA", clue: "Música de fundo de um filme." },
    {
      word: "GENERO",
      clue: "Classificação de filmes como ação, drama ou comédia.",
    },
    { word: "ESTREIA", clue: "Primeira exibição pública de um filme." },
    { word: "BILHETERIA", clue: "Valor arrecadado por um filme nos cinemas." },
    {
      word: "ANIMACAO",
      clue: "Filme criado a partir de desenhos ou computação gráfica.",
    },
    { word: "DOCUMENTARIO", clue: "Filme baseado em fatos reais." },
    {
      word: "LEGENDAS",
      clue: "Texto exibido na tela com as falas traduzidas.",
    },
    {
      word: "DUBLAGEM",
      clue: "Substituição das falas originais por outro idioma.",
    },
    { word: "CAMERA", clue: "Equipamento usado para gravar as cenas." },
    { word: "EDICAO", clue: "Processo de montagem das cenas do filme." },
    {
      word: "EFEITOS",
      clue: "Recursos visuais usados para criar cenas especiais.",
    },
    { word: "ELENCO", clue: "Conjunto de atores de um filme." },
    { word: "CINEMA", clue: "Local onde filmes são exibidos." },
    { word: "TELA", clue: "Superfície onde o filme é projetado." },
    { word: "CLAQUETE", clue: "Objeto usado para marcar início das cenas." },
  ],
  geografia: [
    {
      word: "CONTINENTE",
      clue: "Grande massa de terra como África ou América.",
    },
    { word: "OCEANO", clue: "Grande massa de água salgada." },
    { word: "MONTANHA", clue: "Elevação natural alta do terreno." },
    { word: "DESERTO", clue: "Região com pouca chuva e vegetação." },
    { word: "RIO", clue: "Curso natural de água doce." },
    { word: "ILHA", clue: "Porção de terra cercada por água." },
    { word: "PLANICIE", clue: "Área de terreno plano e baixo." },
    { word: "PLANALTO", clue: "Região elevada com topo relativamente plano." },
    { word: "CLIMA", clue: "Condições médias do tempo em uma região." },
    { word: "LATITUDE", clue: "Distância em graus em relação ao Equador." },
    {
      word: "LONGITUDE",
      clue: "Distância em graus em relação ao meridiano de Greenwich.",
    },
    { word: "MAPA", clue: "Representação gráfica de uma região." },
    { word: "FUSO", clue: "Divisão da Terra baseada no horário." },
    { word: "TROPICO", clue: "Linha imaginária que marca zonas climáticas." },
    { word: "EQUADOR", clue: "Linha que divide a Terra em hemisférios." },
    { word: "GLACIAL", clue: "Relacionado a gelo permanente." },
    { word: "VEGETACAO", clue: "Conjunto de plantas de uma região." },
    { word: "URBANO", clue: "Relativo à cidade." },
    { word: "RURAL", clue: "Relativo ao campo." },
    { word: "CAPITAL", clue: "Cidade principal de um país ou estado." },
  ],
  jogos: [
    { word: "CONTROLE", clue: "Dispositivo usado para jogar videogame." },
    { word: "FASE", clue: "Etapa de um jogo." },
    { word: "CHEFE", clue: "Inimigo mais forte no final de uma fase." },
    { word: "VIDA", clue: "Quantidade de chances antes de perder o jogo." },
    { word: "PONTOS", clue: "Sistema de pontuação em jogos." },
    { word: "NIVEL", clue: "Grau de dificuldade ou progresso no jogo." },
    { word: "MULTIPLAYER", clue: "Modo com vários jogadores." },
    { word: "ONLINE", clue: "Modo conectado à internet." },
    { word: "OFFLINE", clue: "Modo sem conexão com a internet." },
    { word: "AVATAR", clue: "Personagem que representa o jogador." },
    { word: "INVENTARIO", clue: "Lista de itens do jogador." },
    { word: "MISSAO", clue: "Objetivo a ser cumprido no jogo." },
    { word: "MAPA", clue: "Área onde o jogo acontece." },
    { word: "HABILIDADE", clue: "Capacidade especial do personagem." },
    { word: "XP", clue: "Pontos de experiência." },
    { word: "LEVELUP", clue: "Ato de subir de nível." },
    { word: "SKIN", clue: "Aparência visual de personagem." },
    { word: "LOOT", clue: "Itens obtidos durante o jogo." },
    { word: "ARENA", clue: "Local de combate entre jogadores." },
    { word: "RESPAWN", clue: "Retorno ao jogo após ser derrotado." },
  ],
  musica: [
    { word: "MELODIA", clue: "Sequência de notas musicais agradáveis." },
    { word: "RITMO", clue: "Padrão de tempo na música." },
    { word: "HARMONIA", clue: "Combinação de sons simultâneos." },
    { word: "ACORDE", clue: "Conjunto de notas tocadas juntas." },
    { word: "INSTRUMENTO", clue: "Objeto usado para produzir som musical." },
    { word: "VIOLAO", clue: "Instrumento de cordas muito popular." },
    { word: "BATERIA", clue: "Conjunto de instrumentos de percussão." },
    { word: "PIANO", clue: "Instrumento de teclas com cordas internas." },
    { word: "CANTOR", clue: "Pessoa que canta músicas." },
    { word: "BANDA", clue: "Grupo de músicos." },
    { word: "SHOW", clue: "Apresentação musical ao vivo." },
    { word: "ALBUM", clue: "Coleção de músicas lançadas juntas." },
    { word: "LETRA", clue: "Texto de uma música." },
    { word: "NOTA", clue: "Unidade básica do som musical." },
    { word: "ESCALA", clue: "Sequência ordenada de notas." },
    { word: "TOM", clue: "Altura do som." },
    { word: "GRAVACAO", clue: "Registro de áudio de uma música." },
    { word: "MICROFONE", clue: "Equipamento que capta som." },
    { word: "PLAYLIST", clue: "Lista de músicas." },
    { word: "DJ", clue: "Profissional que mistura músicas." },
  ],
  esportes: [
    { word: "FUTEBOL", clue: "Esporte jogado com os pes usando uma bola." },
    { word: "BASQUETE", clue: "Esporte onde se marca pontos com cestas." },
    { word: "VOLEI", clue: "Esporte de rede jogado com as maos." },
    { word: "TENIS", clue: "Esporte com raquete e bola pequena." },
    { word: "NATACAO", clue: "Esporte praticado na agua." },
    { word: "CORRIDA", clue: "Disputa de velocidade a pe." },
    { word: "MARATONA", clue: "Corrida de longa distancia." },
    { word: "GOL", clue: "Ponto no futebol." },
    { word: "ARBITRO", clue: "Responsavel por aplicar as regras do jogo." },
    { word: "ESTADIO", clue: "Local onde acontecem grandes jogos." },
    { word: "ATLETA", clue: "Pessoa que pratica esportes." },
    { word: "TREINO", clue: "Preparacao fisica para competicao." },
    { word: "EQUIPE", clue: "Grupo de jogadores." },
    { word: "TORCIDA", clue: "Grupo de apoiadores de um time." },
    { word: "CAMPEAO", clue: "Vencedor de uma competicao." },
    { word: "MEDALHA", clue: "Premio dado ao vencedor." },
    { word: "OLIMPIADA", clue: "Maior evento esportivo mundial." },
    { word: "PENALTI", clue: "Cobranca direta ao gol no futebol." },
    { word: "CARTAO", clue: "Advertencia no futebol." },
    { word: "JOGADOR", clue: "Participante de uma partida." },
  ],
  viagem: [
    { word: "PASSAGEM", clue: "Bilhete para viajar." },
    { word: "AEROPORTO", clue: "Local de embarque de avioes." },
    { word: "HOTEL", clue: "Lugar para hospedagem." },
    { word: "RESERVA", clue: "Agendamento antecipado de hospedagem." },
    { word: "DESTINO", clue: "Local para onde se viaja." },
    { word: "TURISMO", clue: "Atividade de visitar lugares." },
    { word: "BAGAGEM", clue: "Conjunto de malas do viajante." },
    { word: "MOCHILEIRO", clue: "Viajante que carrega tudo nas costas." },
    { word: "GUIA", clue: "Pessoa que orienta turistas." },
    { word: "MAPA", clue: "Representacao de locais." },
    { word: "ROTEIRO", clue: "Plano de viagem." },
    { word: "EXCURSAO", clue: "Viagem em grupo." },
    { word: "CHECKIN", clue: "Registro de entrada no hotel ou voo." },
    { word: "EMBARQUE", clue: "Ato de entrar no transporte." },
    { word: "DESEMBARQUE", clue: "Ato de sair do transporte." },
    { word: "VISTO", clue: "Autorizacao para entrar em um pais." },
    { word: "FRONTEIRA", clue: "Limite entre paises." },
    { word: "CAMBIO", clue: "Troca de moeda." },
    { word: "GUIATURISTICO", clue: "Material com informacoes de viagem." },
    { word: "PASSEIO", clue: "Atividade de lazer durante a viagem." },
  ],
};
