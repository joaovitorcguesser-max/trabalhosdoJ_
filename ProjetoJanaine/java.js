 // =======================================================================
// ===================== PRODUTO 1 – ONIX ================================
// =======================================================================

// Pegamos o elemento <span> do HTML onde aparece o número do Onix.
// Esse span tem o id="span", por isso usamos getElementById("span").
let spanOnix = document.getElementById("span");
// Pegamos o valor do Onix e aplicamos na variavel
let valorOnix = document.getElementById("Oni");

// Aqui criamos uma variável para guardar a quantidade atual do Onix.
// Começa em 1 porque é o valor inicial mostrado na tela.
let quantidadeOnix = 1;
// Aqui definimos o valor inicial para ser alterado futuramente.
let preçoOnix = 68.900;

// Esta função serve para ATUALIZAR o número que aparece na tela.
// Ela pega a variável quantidadeOnix e coloca dentro do span.
function atualizarOnix() {
  spanOnix.textContent = quantidadeOnix;   // Mostra o novo número no HTML
}

function alterarOnix() {
  let valorTotalOnix = quantidadeOnix * preçoOnix
  valorOnix.textContent = valorTotalOnix + "R$"
}

// Esta função SOMA +1 quando clicamos no botão "+" do Onix.
function somar() {
  if (quantidadeOnix < 5){
  quantidadeOnix = quantidadeOnix + 1;     // Aumenta a quantidade
  atualizarOnix(); // Atualiza o número na tela
  alterarOnix(); //Atualiza o valor na tela
}
}

// Esta função SUBTRAI -1 quando clicamos no botão "-" do Onix.
// Ela também impede que o valor fique abaixo de 1.
function subtrair() {
  if (quantidadeOnix > 1) {                 // Só deixa diminuir se for maior que 1
    quantidadeOnix = quantidadeOnix - 1;    // Diminui a quantidade
    atualizarOnix();// Atualiza o número na tela
    alterarOnix();// Atualizar o valor na tela
  }
}



// =======================================================================
// ===================== PRODUTO 2 – NEW FIESTA ==========================
// =======================================================================

// Pegamos o span onde aparece a quantidade do Fiesta.
// Span tem id="yag".
let spanFiesta = document.getElementById("yag");
// Pegamos o valor do New Fiesta e aplicamos na variavel
let valorFiesta = document.getElementById("New");

// Variável que guarda a quantidade do Fiesta.
let quantidadeFiesta = 1;
// Aqui definimos o valor inicial para ser alterado futuramente.
let preçoFiesta = 49.900;

// Atualiza o número do Fiesta na tela.
function atualizarFiesta() {
  spanFiesta.textContent = quantidadeFiesta;
}

function alterarFiesta() {
  let valorTotalFiesta = quantidadeFiesta * preçoFiesta
  valorFiesta.textContent = valorTotalFiesta + "R$"
}

// Função para aumentar a quantidade ao clicar em "+"
function mais() {
  if (quantidadeFiesta < 10) {
  quantidadeFiesta = quantidadeFiesta + 1;
  atualizarFiesta();
  alterarFiesta();
}
}

// Função para diminuir a quantidade ao clicar em "-"
function menos() {
  if (quantidadeFiesta > 1) {  // Impede números menores que 1
    quantidadeFiesta = quantidadeFiesta - 1;
    atualizarFiesta();
    alterarFiesta();
  }
}



// =======================================================================
// ===================== PRODUTO 3 – HB20S ===============================
// =======================================================================

// Pegamos o span onde aparece o número do HB20S.
// id="kratos"
let spanHB20 = document.getElementById("kratos");
// Pegamos o valor do HB20S e aplicamos na variavel
let preçoHb20 = document.getElementById("Hyun")

// Quantidade inicial do HB20S.
let quantidadeHB20 = 1;
// Aqui definimos o valor inicial para ser alterado futuramente.
let valorHb20 = 72.900

// Função para atualizar o número na tela do HB20S.
function atualizarHB20() {
  spanHB20.textContent = quantidadeHB20;
}

function alterarHb20()  {
  valorTotalHb20 = quantidadeHB20 * valorHb20
  preçoHb20.textContent = valorTotalHb20
}

// Função que soma ao clicar em "+"
function adição() {
  if (quantidadeHB20 < 6) {
  quantidadeHB20 = quantidadeHB20 + 1;
  atualizarHB20();
  alterarHb20();
}
}

// Função que subtrai ao clicar em "-"
function menorizar() {
  if (quantidadeHB20 > 1) {  // Impede que vá para 0 ou negativo
    quantidadeHB20 = quantidadeHB20 - 1;
    atualizarHB20();
    alterarHb20();
  }
}