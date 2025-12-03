wimport SQLite from 'react-native-sqlite-storage';
import React, { useState  } from 'react' ;

import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native' ;

const { width, height } = Dimensions.get('window');

// Dados iniciais atualizados com unidades
const produtosIniciais = [
  { id: '1', nome: 'Arroz branco Kika 1kg', entrada: '30 unidades', saida: '20 unidades', estoque: '10 unidades', categoria: 'Alimentos', unidade: 'unidades' },
  { id: '2', nome: 'Arroz amarelo Kika 1kg', entrada: '20 unidades', saida: '15 unidades', estoque: '5 unidades', categoria: 'Alimentos', unidade: 'unidades' },
  { id: '3', nome: 'Leite Tirol', entrada: '50 unidades', saida: '30 unidades', estoque: '20 unidades', categoria: 'Laticínios', unidade: 'unidades' },
  { id: '4', nome: 'Açúcar Caravelas 1kg', entrada: '80 unidades', saida: '60 unidades', estoque: '20 unidades', categoria: 'Alimentos', unidade: 'unidades' },
  { id: '5', nome: 'Coca Cola 2L', entrada: '100 unidades', saida: '80 unidades', estoque: '20 unidades', categoria: 'Bebidas', unidade: 'unidades' },
  { id: '6', nome: 'Sabão em pó Omo', entrada: '12 unidades', saida: '4 unidades', estoque: '8 unidades', categoria: 'Limpeza', unidade: 'unidades' },
  { id: '7', nome: 'Tomate', entrada: '25 kg', saida: '18 kg', estoque: '7 kg', categoria: 'Hortifruti', unidade: 'kg' },
  { id: '8', nome: 'Cebola', entrada: '30 kg', saida: '22 kg', estoque: '8 kg', categoria: 'Hortifruti', unidade: 'kg' },
  { id: '9', nome: 'Batata', entrada: '50 kg', saida: '35 kg', estoque: '15 kg', categoria: 'Hortifruti', unidade: 'kg' },
  { id: '10', nome: 'Alface', entrada: '15 unidades', saida: '12 unidades', estoque: '3 unidades', categoria: 'Hortifruti', unidade: 'unidades' },
];

// Ícones e cores por categoria
const categoriaConfig = {
  'Alimentos': { icone: '🍕', cor: '#FF6B6B', unidadePadrao: 'unidades' },
  'Bebidas': { icone: '🥤', cor: '#4ECDC4', unidadePadrao: 'unidades' },
  'Laticínios': { icone: '🥛', cor: '#45B7D1', unidadePadrao: 'unidades' },
  'Limpeza': { icone: '🧼', cor: '#96CEB4', unidadePadrao: 'unidades' },
  'Hortifruti': { icone: '🥦', cor: '#FFEAA7', unidadePadrao: 'kg' },
  'Congelados': { icone: '🧊', cor: '#DDA0DD', unidadePadrao: 'unidades' },
  'Todos': { icone: '📦', cor: '#667eea' }
};

const categoriasDisponiveis = ['Alimentos', 'Bebidas', 'Laticínios', 'Limpeza', 'Hortifruti', 'Congelados'];

// Unidades disponíveis por categoria
const unidadesPorCategoria = {
  'Alimentos': ['unidades', 'kg', 'g', 'litros'],
  'Bebidas': ['unidades', 'litros', 'ml'],
  'Laticínios': ['unidades', 'litros', 'ml'],
  'Limpeza': ['unidades', 'litros', 'ml'],
  'Hortifruti': ['kg', 'g', 'unidades', 'caixas'],
  'Congelados': ['unidades', 'kg', 'g']
};

// Cores do tema escuro
const theme = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  primary: '#667eea',
  primaryLight: '#764ba2',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#666666',
  success: '#2ED573',
  warning: '#FFA502',
  danger: '#FF4757',
  border: '#333333'
};

const App: React.FC = () => {
  const [produtos, setProdutos] = useState(produtosIniciais);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);
  const [modalEditarEstoqueVisivel, setModalEditarEstoqueVisivel] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('estoque'); // 'estoque' ou 'movimentacao'
  const [fadeAnim] = useState(new Animated.Value(0));

  // Estados para formulários
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    entrada: '',
    saida: '',
    estoque: '',
    categoria: 'Alimentos',
    unidade: 'unidades'
  });

  const [estoqueEditado, setEstoqueEditado] = useState({
    tipo: 'entrada',
    quantidade: '',
    produtoId: '',
    unidade: ''
  });

  const categorias = ['Todos', ...categoriasDisponiveis];

  // Animação de entrada
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Atualizar unidade quando categoria mudar
  React.useEffect(() => {
    if (novoProduto.categoria) {
      setNovoProduto(prev => ({
        ...prev,
        unidade: categoriaConfig[novoProduto.categoria]?.unidadePadrao || 'unidades'
      }));
    }
  }, [novoProduto.categoria]);

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const buscaMatch = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const categoriaMatch = categoriaFiltro === 'Todos' || produto.categoria === categoriaFiltro;
    return buscaMatch && categoriaMatch;
  });

  // Função para extrair valor numérico do estoque
  const extrairValorNumerico = (valor: string) => {
    const numeroMatch = valor.match(/\d+(\.\d+)?/);
    return numeroMatch ? parseFloat(numeroMatch[0]) : 0;
  };

  // Função para verificar status do estoque
  const getEstoqueStatus = (estoque: string) => {
    const numero = extrairValorNumerico(estoque);
    
    if (numero === 0) return { status: 'zerado', cor: theme.danger, icone: '🔴' };
    if (numero <= 5) return { status: 'baixo', cor: theme.warning, icone: '🟡' };
    return { status: 'normal', cor: theme.success, icone: '🟢' };
  };

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const total = produtosFiltrados.length;
    const estoqueBaixo = produtosFiltrados.filter(p => 
      getEstoqueStatus(p.estoque).status === 'baixo'
    ).length;
    const estoqueZerado = produtosFiltrados.filter(p => 
      getEstoqueStatus(p.estoque).status === 'zerado'
    ).length;

    return { total, estoqueBaixo, estoqueZerado };
  };

  // FUNÇÃO PARA EXCLUIR PRODUTO
  const excluirProduto = (produtoId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            setProdutos(produtos.filter(p => p.id !== produtoId));
            setModalVisivel(false);
            Alert.alert('Sucesso', 'Produto excluído com sucesso!');
          }
        }
      ]
    );
  };

  // FUNÇÃO PARA ADICIONAR PRODUTO
  const adicionarProduto = () => {
    if (!novoProduto.nome || !novoProduto.estoque) {
      Alert.alert('Erro', 'Preencha pelo menos o nome e estoque do produto');
      return;
    }

    // Formatar os valores com a unidade
    const formatarComUnidade = (valor: string) => {
      if (!valor) return '';
      return `${valor} ${novoProduto.unidade}`;
    };

    const novoItem = {
      id: Date.now().toString(),
      nome: novoProduto.nome,
      entrada: formatarComUnidade(novoProduto.entrada),
      saida: formatarComUnidade(novoProduto.saida),
      estoque: formatarComUnidade(novoProduto.estoque),
      categoria: novoProduto.categoria,
      unidade: novoProduto.unidade
    };

    setProdutos([...produtos, novoItem]);
    setModalAdicionarVisivel(false);
    setNovoProduto({
      nome: '',
      entrada: '',
      saida: '',
      estoque: '',
      categoria: 'Alimentos',
      unidade: 'unidades'
    });
    Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
  };

  // FUNÇÃO PARA SOMAR ESTOQUE (ENTRADA)
  const somarEstoque = () => {
    if (!estoqueEditado.quantidade) {
      Alert.alert('Erro', 'Informe a quantidade para adicionar');
      return;
    }

    const produtoIndex = produtos.findIndex(p => p.id === estoqueEditado.produtoId);
    if (produtoIndex === -1) return;

    const produto = produtos[produtoIndex];
    const novosProdutos = [...produtos];

    // Extrair valores numéricos
    const estoqueAtual = extrairValorNumerico(produto.estoque);
    const quantidadeAdicionar = parseFloat(estoqueEditado.quantidade);
    
    if (isNaN(quantidadeAdicionar)) {
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }

    // Calcular novo estoque
    const novoEstoqueValor = estoqueAtual + quantidadeAdicionar;
    const novoEstoque = `${novoEstoqueValor} ${produto.unidade}`;

    // Atualizar entrada (histórico de entradas)
    const entradaAtual = extrairValorNumerico(produto.entrada);
    const novaEntradaValor = entradaAtual + quantidadeAdicionar;
    const novaEntrada = `${novaEntradaValor} ${produto.unidade}`;

    novosProdutos[produtoIndex] = {
      ...produto,
      estoque: novoEstoque,
      entrada: novaEntrada
    };

    setProdutos(novosProdutos);
    setModalEditarEstoqueVisivel(false);
    setEstoqueEditado({
      tipo: 'entrada',
      quantidade: '',
      produtoId: '',
      unidade: ''
    });
    Alert.alert('Sucesso', `${quantidadeAdicionar} ${produto.unidade} adicionados ao estoque!`);
  };

  // FUNÇÃO PARA SUBTRAIR ESTOQUE (SAÍDA)
  const subtrairEstoque = () => {
    if (!estoqueEditado.quantidade) {
      Alert.alert('Erro', 'Informe a quantidade para retirar');
      return;
    }

    const produtoIndex = produtos.findIndex(p => p.id === estoqueEditado.produtoId);
    if (produtoIndex === -1) return;

    const produto = produtos[produtoIndex];
    const novosProdutos = [...produtos];

    // Extrair valores numéricos
    const estoqueAtual = extrairValorNumerico(produto.estoque);
    const quantidadeRetirar = parseFloat(estoqueEditado.quantidade);
    
    if (isNaN(quantidadeRetirar)) {
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }

    // Verificar se há estoque suficiente
    if (quantidadeRetirar > estoqueAtual) {
      Alert.alert('Erro', `Estoque insuficiente! Disponível: ${estoqueAtual} ${produto.unidade}`);
      return;
    }

    // Calcular novo estoque
    const novoEstoqueValor = estoqueAtual - quantidadeRetirar;
    const novoEstoque = `${novoEstoqueValor} ${produto.unidade}`;

    // Atualizar saída (histórico de saídas)
    const saidaAtual = extrairValorNumerico(produto.saida);
    const novaSaidaValor = saidaAtual + quantidadeRetirar;
    const novaSaida = `${novaSaidaValor} ${produto.unidade}`;

    novosProdutos[produtoIndex] = {
      ...produto,
      estoque: novoEstoque,
      saida: novaSaida
    };

    setProdutos(novosProdutos);
    setModalEditarEstoqueVisivel(false);
    setEstoqueEditado({
      tipo: 'entrada',
      quantidade: '',
      produtoId: '',
      unidade: ''
    });
    Alert.alert('Sucesso', `${quantidadeRetirar} ${produto.unidade} retirados do estoque!`);
  };

  // ABRIR MODAL DE EDIÇÃO DE ESTOQUE
  const abrirModalEditarEstoque = (produto: any, tipo: 'entrada' | 'saida') => {
    setEstoqueEditado({
      tipo,
      quantidade: '',
      produtoId: produto.id,
      unidade: produto.unidade
    });
    setModalEditarEstoqueVisivel(true);
    setModalVisivel(false);
  };

  const estatisticas = calcularEstatisticas();

  // Componente Card do Produto
  const CardProduto = ({ produto, index }) => {
    const status = getEstoqueStatus(produto.estoque);
    const categoria = categoriaConfig[produto.categoria];
    
    return (
      <TouchableOpacity 
        style={[
          styles.card,
          index % 2 === 0 ? styles.cardEven : styles.cardOdd
        ]}
        onPress={() => {
          setProdutoSelecionado(produto);
          setModalVisivel(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.produtoInfo}>
            <Text style={styles.nomeProduto}>{produto.nome}</Text>
            <View style={styles.categoriaContainer}>
              <View style={[styles.categoriaBadge, { backgroundColor: categoria.cor + '20' }]}>
                <Text style={styles.categoriaIcon}>{categoria.icone}</Text>
                <Text style={[styles.categoria, { color: categoria.cor }]}>
                  {produto.categoria}
                </Text>
              </View>
              <View style={styles.unidadeBadge}>
                <Text style={styles.unidadeTexto}>{produto.unidade}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.estoqueBadge, { backgroundColor: status.cor + '20' }]}>
            <Text style={styles.estoqueIcon}>{status.icone}</Text>
            <Text style={[styles.estoqueTexto, { color: status.cor }]}>
              {produto.estoque}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Entrada Total</Text>
            <Text style={styles.detailValue}>{produto.entrada}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Saída Total</Text>
            <Text style={styles.detailValue}>{produto.saida}</Text>
          </View>
        </View>

        {/* Botões de ação rápida */}
        <View style={styles.acoesRapidas}>
          <TouchableOpacity 
            style={[styles.acaoBtn, styles.entradaBtn]}
            onPress={() => abrirModalEditarEstoque(produto, 'entrada')}
          >
            <Text style={styles.acaoTexto}>📥 Adicionar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.acaoBtn, styles.saidaBtn]}
            onPress={() => abrirModalEditarEstoque(produto, 'saida')}
          >
            <Text style={styles.acaoTexto}>📤 Retirar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar backgroundColor={theme.background} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>📦 PotatoOrganizator</Text>
            <Text style={styles.subtitle}>Controle Inteligente de Estoque</Text>
          </View>
          <TouchableOpacity 
            style={styles.btnAdicionar}
            onPress={() => setModalAdicionarVisivel(true)}
          >
            <Text style={styles.btnAdicionarTexto}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Abas */}
        <View style={styles.abasContainer}>
          <TouchableOpacity 
            style={[styles.aba, abaAtiva === 'estoque' && styles.abaAtiva]}
            onPress={() => setAbaAtiva('estoque')}
          >
            <Text style={[styles.abaTexto, abaAtiva === 'estoque' && styles.abaTextoAtiva]}>
              📊 Estoque
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.aba, abaAtiva === 'movimentacao' && styles.abaAtiva]}
            onPress={() => setAbaAtiva('movimentacao')}
          >
            <Text style={[styles.abaTexto, abaAtiva === 'movimentacao' && styles.abaTextoAtiva]}>
              🔄 Movimentação
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{estatisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.statWarning]}>{estatisticas.estoqueBaixo}</Text>
          <Text style={styles.statLabel}>Baixo</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.statDanger]}>{estatisticas.estoqueZerado}</Text>
          <Text style={styles.statLabel}>Zerado</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.buscaContainer}>
          <TextInput
            style={styles.buscaInput}
            placeholder="🔍 Buscar produto..."
            placeholderTextColor={theme.textMuted}
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity 
              style={styles.limparBusca}
              onPress={() => setBusca('')}
            >
              <Text style={styles.limparTexto}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriasScroll}
        >
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              style={[
                styles.categoriaButton,
                categoriaFiltro === categoria && styles.categoriaButtonActive
              ]}
              onPress={() => setCategoriaFiltro(categoria)}
            >
              <Text style={styles.categoriaButtonIcon}>
                {categoriaConfig[categoria].icone}
              </Text>
              <Text style={[
                styles.categoriaButtonText,
                categoriaFiltro === categoria && styles.categoriaButtonTextActive
              ]}>
                {categoria}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Produtos */}
      <ScrollView 
        style={styles.listaContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
      >
        {produtosFiltrados.map((produto, index) => (
          <CardProduto key={produto.id} produto={produto} index={index} />
        ))}
        
        {produtosFiltrados.length === 0 && (
          <View style={styles.semResultados}>
            <Text style={styles.semResultadosIcon}>🔍</Text>
            <Text style={styles.semResultadosText}>Nenhum produto encontrado</Text>
            <Text style={styles.semResultadosSubtext}>
              {busca ? 'Tente alterar a busca' : 'Adicione seu primeiro produto'}
            </Text>
            {!busca && (
              <TouchableOpacity 
                style={styles.btnAdicionarPrimeiro}
                onPress={() => setModalAdicionarVisivel(true)}
              >
                <Text style={styles.btnAdicionarPrimeiroTexto}>+ Adicionar Produto</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal de Detalhes do Produto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{produtoSelecionado?.nome}</Text>
              <TouchableOpacity 
                style={styles.fecharModal}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.fecharTexto}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Categoria</Text>
                <View style={styles.modalValueContainer}>
                  <Text style={styles.modalValue}>{produtoSelecionado?.categoria}</Text>
                  <Text style={styles.modalIcon}>
                    {categoriaConfig[produtoSelecionado?.categoria]?.icone}
                  </Text>
                </View>
              </View>

              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Unidade</Text>
                <Text style={styles.modalValue}>{produtoSelecionado?.unidade}</Text>
              </View>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Entrada Total</Text>
                <Text style={styles.modalValue}>{produtoSelecionado?.entrada}</Text>
              </View>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Saída Total</Text>
                <Text style={styles.modalValue}>{produtoSelecionado?.saida}</Text>
              </View>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Estoque Atual</Text>
                <Text style={[
                  styles.modalValue,
                  styles.estoqueDestaque,
                  { color: getEstoqueStatus(produtoSelecionado?.estoque || '').cor }
                ]}>
                  {produtoSelecionado?.estoque}
                </Text>
              </View>

              {/* Botões de ação no modal */}
              <View style={styles.modalAcoes}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.editarBtn]}
                  onPress={() => abrirModalEditarEstoque(produtoSelecionado, 'entrada')}
                >
                  <Text style={styles.modalBtnTexto}>📥 Adicionar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.retirarBtn]}
                  onPress={() => abrirModalEditarEstoque(produtoSelecionado, 'saida')}
                >
                  <Text style={styles.modalBtnTexto}>📤 Retirar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.excluirBtn]}
                  onPress={() => excluirProduto(produtoSelecionado?.id)}
                >
                  <Text style={styles.modalBtnTexto}>🗑️ Excluir</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para Adicionar Produto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAdicionarVisivel}
        onRequestClose={() => setModalAdicionarVisivel(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>➕ Novo Produto</Text>
              <TouchableOpacity 
                style={styles.fecharModal}
                onPress={() => setModalAdicionarVisivel(false)}
              >
                <Text style={styles.fecharTexto}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Nome do produto"
                placeholderTextColor={theme.textMuted}
                value={novoProduto.nome}
                onChangeText={(text) => setNovoProduto({...novoProduto, nome: text})}
              />
              
              <Text style={styles.label}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasForm}>
                {categoriasDisponiveis.map(categoria => (
                  <TouchableOpacity
                    key={categoria}
                    style={[
                      styles.categoriaOption,
                      novoProduto.categoria === categoria && styles.categoriaOptionSelected
                    ]}
                    onPress={() => setNovoProduto({...novoProduto, categoria})}
                  >
                    <Text style={[
                      styles.categoriaOptionText,
                      novoProduto.categoria === categoria && styles.categoriaOptionTextSelected
                    ]}>
                      {categoriaConfig[categoria].icone} {categoria}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Unidade de Medida</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasForm}>
                {unidadesPorCategoria[novoProduto.categoria]?.map(unidade => (
                  <TouchableOpacity
                    key={unidade}
                    style={[
                      styles.categoriaOption,
                      novoProduto.unidade === unidade && styles.categoriaOptionSelected
                    ]}
                    onPress={() => setNovoProduto({...novoProduto, unidade})}
                  >
                    <Text style={[
                      styles.categoriaOptionText,
                      novoProduto.unidade === unidade && styles.categoriaOptionTextSelected
                    ]}>
                      {unidade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TextInput
                style={styles.input}
                placeholder={`Estoque inicial (ex: 10 ${novoProduto.unidade})`}
                placeholderTextColor={theme.textMuted}
                value={novoProduto.estoque}
                onChangeText={(text) => setNovoProduto({...novoProduto, estoque: text})}
                keyboardType="numeric"
              />

              <TouchableOpacity 
                style={styles.btnConfirmar}
                onPress={adicionarProduto}
              >
                <Text style={styles.btnConfirmarTexto}>Adicionar Produto</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para Editar Estoque */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditarEstoqueVisivel}
        onRequestClose={() => setModalEditarEstoqueVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {estoqueEditado.tipo === 'entrada' ? '📥 Adicionar Estoque' : '📤 Retirar Estoque'}
              </Text>
              <TouchableOpacity 
                style={styles.fecharModal}
                onPress={() => setModalEditarEstoqueVisivel(false)}
              >
                <Text style={styles.fecharTexto}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.label}>
                {estoqueEditado.tipo === 'entrada' ? 'Quantidade para adicionar:' : 'Quantidade para retirar:'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder={`Quantidade em ${estoqueEditado.unidade}`}
                placeholderTextColor={theme.textMuted}
                value={estoqueEditado.quantidade}
                onChangeText={(text) => setEstoqueEditado({...estoqueEditado, quantidade: text})}
                keyboardType="numeric"
              />
              
              <Text style={styles.unidadeInfo}>
                Unidade: {estoqueEditado.unidade}
              </Text>

              {/* Mostrar estoque atual */}
              {estoqueEditado.produtoId && (
                <View style={styles.estoqueAtualInfo}>
                  <Text style={styles.estoqueAtualLabel}>Estoque atual:</Text>
                  <Text style={styles.estoqueAtualValor}>
                    {produtos.find(p => p.id === estoqueEditado.produtoId)?.estoque}
                  </Text>
                </View>
              )}
              
              <View style={styles.botoesEstoque}>
                <TouchableOpacity 
                  style={[styles.btnEstoque, styles.btnCancelar]}
                  onPress={() => setModalEditarEstoqueVisivel(false)}
                >
                  <Text style={styles.btnEstoqueTexto}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.btnEstoque, 
                    estoqueEditado.tipo === 'entrada' ? styles.btnConfirmar : styles.btnRetirar
                  ]}
                  onPress={estoqueEditado.tipo === 'entrada' ? somarEstoque : subtrairEstoque}
                >
                  <Text style={styles.btnEstoqueTexto}>
                    {estoqueEditado.tipo === 'entrada' ? 'Adicionar' : 'Retirar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

// ESTILOS COM TEMA ESCURO
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  btnAdicionar: {
    backgroundColor: theme.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnAdicionarTexto: {
    color: theme.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  abasContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceLight,
    borderRadius: 12,
    padding: 4,
  },
  aba: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  abaAtiva: {
    backgroundColor: theme.primary,
  },
  abaTexto: {
    color: theme.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  abaTextoAtiva: {
    color: theme.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 4,
  },
  statWarning: {
    color: theme.warning,
  },
  statDanger: {
    color: theme.danger,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  filtrosContainer: {
    backgroundColor: theme.surface,
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  buscaContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  buscaInput: {
    backgroundColor: theme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
  },
  limparBusca: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: theme.textMuted,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limparTexto: {
    color: theme.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriasScroll: {
    marginHorizontal: -5,
  },
  categoriaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.surfaceLight,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoriaButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoriaButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoriaButtonText: {
    color: theme.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  categoriaButtonTextActive: {
    color: theme.text,
  },
  listaContainer: {
    flex: 1,
  },
  listaContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardEven: {
    backgroundColor: theme.surface,
  },
  cardOdd: {
    backgroundColor: theme.surfaceLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  produtoInfo: {
    flex: 1,
  },
  nomeProduto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoriaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  categoriaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoria: {
    fontSize: 12,
    fontWeight: '500',
  },
  unidadeBadge: {
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  unidadeTexto: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.primary,
  },
  estoqueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estoqueIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  estoqueTexto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 15,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  acoesRapidas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  acaoBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  entradaBtn: {
    backgroundColor: theme.success + '20',
    borderWidth: 1,
    borderColor: theme.success,
  },
  saidaBtn: {
    backgroundColor: theme.warning + '20',
    borderWidth: 1,
    borderColor: theme.warning,
  },
  acaoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },
  semResultados: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  semResultadosIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: theme.textSecondary,
  },
  semResultadosText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  semResultadosSubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnAdicionarPrimeiro: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  btnAdicionarPrimeiroTexto: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    flex: 1,
  },
  fecharModal: {
    padding: 4,
  },
  fecharTexto: {
    fontSize: 18,
    color: theme.textSecondary,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalLabel: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  modalValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalValue: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
  },
  modalIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  estoqueDestaque: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  editarBtn: {
    backgroundColor: theme.success + '20',
    borderWidth: 1,
    borderColor: theme.success,
  },
  retirarBtn: {
    backgroundColor: theme.warning + '20',
    borderWidth: 1,
    borderColor: theme.warning,
  },
  excluirBtn: {
    backgroundColor: theme.danger + '20',
    borderWidth: 1,
    borderColor: theme.danger,
  },
  modalBtnTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },
  input: {
    backgroundColor: theme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 16,
    color: theme.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
    marginTop: 8,
  },
  categoriasForm: {
    marginBottom: 16,
  },
  categoriaOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.surfaceLight,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoriaOptionSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoriaOptionText: {
    color: theme.textSecondary,
    fontWeight: '500',
    fontSize: 14,
  },
  categoriaOptionTextSelected: {
    color: theme.text,
  },
  btnConfirmar: {
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnRetirar: {
    backgroundColor: theme.warning,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnConfirmarTexto: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  botoesEstoque: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btnEstoque: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  btnCancelar: {
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  btnEstoqueTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  unidadeInfo: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  estoqueAtualInfo: {
    backgroundColor: theme.surfaceLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  estoqueAtualLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  estoqueAtualValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
});

export default App;
