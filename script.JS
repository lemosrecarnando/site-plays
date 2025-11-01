// Estoque inicial
let estoque = [
  { nome: "Arroz", preco: 12.50, qtd: 20, codigo: "7891234567890" },
  { nome: "Feijão", preco: 8.99, qtd: 15, codigo: "7891234567891" },
  { nome: "Refrigerante", preco: 6.50, qtd: 10, codigo: "7891234567892" },
  { nome: "Macarrão", preco: 4.50, qtd: 25, codigo: "7891234567893" },
  { nome: "Leite", preco: 5.20, qtd: 30, codigo: "7891234567894" }
];

let carrinho = [];
let total = 0;
let filtro = "";
let fiados = [];
let historico = [];

// DOM
const botoesDiv=document.getElementById("botoesProdutos");
const listaCarrinho=document.getElementById("listaCarrinho");
const totalLabel=document.getElementById("total");
const produtoSelect=document.getElementById("produtoSelect");
const listaFiado=document.getElementById("listaFiado");
const listaHistorico=document.getElementById("listaHistorico");

// ----- CAIXA -----
function criarBotoes(){
  botoesDiv.innerHTML="";
  estoque.forEach((prod,index)=>{
    if(prod.qtd>0 && prod.nome.toLowerCase().includes(filtro)){
      const btn=document.createElement("button");
      btn.innerText=`${prod.nome} - R$${prod.preco.toFixed(2)} (${prod.qtd} em estoque)`;
      btn.onclick=()=> adicionarAoCarrinho(index);
      botoesDiv.appendChild(btn);
    }
  });
}

function adicionarAoCarrinho(index){
  const produto=estoque[index];
  if(produto.qtd<=0){ alert("Estoque insuficiente!"); return; }
  produto.qtd-=1;
  total+=produto.preco;
  const itemCarrinho=carrinho.find(item=>item.nome===produto.nome && !item.peso);
  if(itemCarrinho){ itemCarrinho.qtd+=1; itemCarrinho.subtotal+=produto.preco; }
  else{ carrinho.push({ nome:produto.nome, qtd:1, subtotal:produto.preco }); }
  atualizarTela();
}

// ----- PRODUTOS POR PESO -----
function adicionarPorPeso(){
  const codigo=document.getElementById("codigoPeso").value.trim();
  const peso=parseFloat(document.getElementById("pesoProduto").value);
  if(!codigo || isNaN(peso)||peso<=0){ alert("Informe código e peso válido!"); return; }
  const index=estoque.findIndex(prod=>prod.codigo===codigo);
  if(index===-1){ alert("Produto não encontrado!"); return; }
  const produto=estoque[index];
  const subtotal=produto.preco*peso;
  const itemCarrinho=carrinho.find(item=>item.nome===produto.nome && item.peso);
  if(itemCarrinho){ itemCarrinho.peso+=peso; itemCarrinho.subtotal+=subtotal; }
  else{ carrinho.push({ nome:produto.nome, peso:peso, subtotal:subtotal }); }
  total+=subtotal;
  atualizarTela();
  document.getElementById("codigoPeso").value="";
  document.getElementById("pesoProduto").value="";
}

// ----- SCANNER -----
function escanearProduto(){
  const codigo=document.getElementById("codigoScanner").value.trim();
  if(!codigo){ alert("Digite o código do produto!"); return; }
  const index=estoque.findIndex(prod=>prod.codigo===codigo);
  if(index===-1){ alert("Produto não encontrado!"); return; }
  adicionarAoCarrinho(index);
  document.getElementById("codigoScanner").value="";
}

// ----- PESQUISA -----
function filtrarProdutos(){ filtro=document.getElementById("pesquisaProduto").value.toLowerCase(); criarBotoes(); }

// ----- ADMIN -----
function atualizarDropdown(){
  produtoSelect.innerHTML="";
  estoque.forEach((prod,index)=>{
    const option=document.createElement("option");
    option.value=index;
    option.innerText=`${prod.nome} - ${prod.qtd} em estoque`;
    produtoSelect.appendChild(option);
  });
}

function adicionarProduto(){
  const nome=document.getElementById("novoNome").value.trim();
  const preco=parseFloat(document.getElementById("novoPreco").value);
  const qtd=parseInt(document.getElementById("novoQtd").value);
  if(!nome||isNaN(preco)||isNaN(qtd)){ alert("Preencha todos os campos!"); return; }
  const codigo="C"+Date.now();
  estoque.push({nome, preco, qtd, codigo});
  atualizarTela();
  document.getElementById("novoNome").value=""; 
  document.getElementById("novoPreco").value=""; 
  document.getElementById("novoQtd").value="";
}

function modificarEstoque(){
  const index=parseInt(produtoSelect.value);
  const qtd=parseInt(document.getElementById("novaQtd").value);
  if(isNaN(qtd)||index<0){ alert("Informe quantidade válida!"); return; }
  estoque[index].qtd=qtd;
  atualizarTela();
  document.getElementById("novaQtd").value="";
}

// ----- CARRINHO / TABELA -----
function atualizarTela(){
  listaCarrinho.innerHTML="";
  carrinho.forEach(item=>{
    if(item.peso){ listaCarrinho.innerHTML+=`<li>${item.nome} - ${item.peso.toFixed(2)} kg - R$${item.subtotal.toFixed(2)}</li>`; }
    else{ listaCarrinho.innerHTML+=`<li>${item.nome} x${item.qtd} - R$${item.subtotal.toFixed(2)}</li>`; }
  });
  totalLabel.innerText=`Total: R$${total.toFixed(2)}`;
  criarBotoes();
  atualizarDropdown();
  atualizarFiado();
  atualizarHistorico();
}

function finalizarVenda() {
  if (carrinho.length === 0) { alert("Carrinho vazio!"); return; }
  document.getElementById("pagamentoModal").style.display = "flex";
}

// ----- PAGAMENTO -----
function confirmarPagamento(metodo) {
  if(metodo==="Fiado"){
    document.getElementById("fiadoForm").style.display="block";
    return;
  }
  alert(`Venda finalizada com pagamento em: ${metodo}`);
  historico.push({itens:[...carrinho], total:total, metodo:metodo});
  carrinho=[];
  total=0;
  atualizarTela();
  fecharModal();
}

function salvarFiado(){
  const nome = document.getElementById("clienteFiado").value.trim();
  if(!nome){ alert("Informe o nome do cliente!"); return; }
  let fiadoCliente = fiados.find(f=>f.nome===nome);
  if(fiadoCliente){ fiadoCliente.deve += total; }
  else{ fiados.push({nome:nome, deve:total}); }
  historico.push({itens:[...carrinho], total:total, metodo:"Fiado", cliente:nome});
  carrinho=[]; total=0;
  atualizarTela();
  fecharModal();
}

function fecharModal(){
  document.getElementById("pagamentoModal").style.display="none";
  document.getElementById("fiadoForm").style.display="none";
  document.getElementById("clienteFiado").value="";
}

// ----- FIADO / HISTORICO -----
function atualizarFiado(){
  listaFiado.innerHTML="";
  fiados.forEach(f=>{
    listaFiado.innerHTML+=`<li>${f.nome} - Saldo: R$${f.deve.toFixed(2)}</li>`;
  });
}

function atualizarHistorico(){
  listaHistorico.innerHTML="";
  historico.forEach(h=>{
    listaHistorico.innerHTML+=`<li>${h.itens.map(i=>i.nome).join(", ")} - R$${h.total.toFixed(2)} - ${h.metodo}${h.cliente?(" ("+h.cliente+")"):""}</li>`;
  });
}

// ----- ADMIN COLAPSÁVEL -----
function toggleAdmin(){
  const content=document.getElementById("adminContent");
  content.style.display = content.style.display==="none"?"block":"none";
}

// ----- INICIALIZAÇÃO -----
criarBotoes();
atualizarTela();
atualizarDropdown();
