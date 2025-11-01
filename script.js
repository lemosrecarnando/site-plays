const ADMIN_PASSWORD = "@lemos13";
let editingIndex = null;

// Carrega playlists do localStorage
let playlists = JSON.parse(localStorage.getItem("playlists")) || [];

// Salva no localStorage
function savePlaylists() {
  localStorage.setItem("playlists", JSON.stringify(playlists));
}

// Renderiza as playlists
function renderPlaylists() {
  const grid = document.getElementById("playlistGrid");
  grid.innerHTML = "";
  playlists.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = p.cover_url;
    img.alt = p.name;
    card.appendChild(img);

    const title = document.createElement("strong");
    title.textContent = p.name;
    card.appendChild(title);

    const btnContainer = document.createElement("div");
    btnContainer.className = "btnContainer";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.onclick = (e) => {
      e.stopPropagation();
      document.getElementById("hiddenForm").classList.add("show");
      document.getElementById("name").value = p.name;
      document.getElementById("cover").value = p.cover_url;
      document.getElementById("link").value = p.link_url;
      editingIndex = index;
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Apagar";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if(confirm(`Deseja apagar a playlist "${p.name}"?`)){
        playlists.splice(index, 1);
        savePlaylists();
        renderPlaylists();
      }
    };

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    card.appendChild(btnContainer);

    card.onclick = () => window.open(p.link_url, "_blank");
    grid.appendChild(card);
  });
}

// Toggle do formulário
document.getElementById("toggleForm").addEventListener("click", () => {
  document.getElementById("hiddenForm").classList.toggle("show");
  editingIndex = null;
});

// Função para buscar capa via oEmbed
async function fetchSpotifyCover(link){
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(link)}`;
    const res = await fetch(oembedUrl);
    if(!res.ok) throw new Error("oEmbed não disponível");
    const data = await res.json();
    return data.thumbnail_url || "https://via.placeholder.com/400x400?text=Sem+Capa";
  } catch(e){
    console.warn("Não foi possível pegar capa automaticamente:", e);
    return "https://via.placeholder.com/400x400?text=Sem+Capa";
  }
}

// Submit do formulário
document.getElementById("addForm").addEventListener("submit", async function(e){
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const link = document.getElementById("link").value.trim();
  const coverInput = document.getElementById("cover").value.trim();
  const password = document.getElementById("password").value;

  if(password !== ADMIN_PASSWORD){
    alert("❌ Senha incorreta!");
    return;
  }
  if(!link){
    alert("Coloque o link da playlist.");
    return;
  }

  // pega capa automaticamente se usuário não colocou
  const cover_url = coverInput || await fetchSpotifyCover(link);

  if(editingIndex !== null){
    playlists[editingIndex] = {name, cover_url, link_url: link};
  } else {
    playlists.push({name, cover_url, link_url: link});
  }

  savePlaylists();
  renderPlaylists();
  this.reset();
  document.getElementById("hiddenForm").classList.remove("show");
  editingIndex = null;
});

// inicializa
renderPlaylists();
