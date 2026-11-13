const sonsDoSite = {
    musicaFundo: new Audio("AUDIO/musica-natal.mp3"),
    logo: new Audio("AUDIO/ho-ho-ho-merry-christmas.mp3"),
    transicao: new Audio("AUDIO/magic-whoosh-airy-shimmering-epic-stock-media-magicgamedustwhoosh2-1-0m02s.mp3")
};
const chaveSonsAtivos = "magiaNatalSonsAtivos";

sonsDoSite.musicaFundo.loop = true;
sonsDoSite.musicaFundo.volume = 0.3;
Object.values(sonsDoSite).forEach(function(audio) {
    audio.preload = "none";
});

function salvarSonsAtivos() {
    var sons = Object.entries(sonsDoSite)
        .filter(function(e) { return !e[1].paused && !e[1].ended; })
        .map(function(e) { return { nome: e[0], tempo: e[1].currentTime }; });

    try {
        sessionStorage.setItem(chaveSonsAtivos, JSON.stringify(sons));
    } catch (e) {}
}

function restaurarSonsAtivos() {
    var sons;
    try {
        sons = JSON.parse(sessionStorage.getItem(chaveSonsAtivos) || "[]");
        sessionStorage.removeItem(chaveSonsAtivos);
    } catch (e) {
        return;
    }

    sons.forEach(function(item) {
        var audio = sonsDoSite[item.nome];
        if (!audio) return;
        if (Number.isFinite(item.tempo)) audio.currentTime = item.tempo;

        audio.play().then(function() {
            if (item.nome === "musicaFundo") {
                var btn = document.getElementById("btn-musica");
                if (btn) btn.textContent = "Pausar música de Natal";
            }
        }).catch(function() {
            if (item.nome === "musicaFundo") {
                var btn = document.getElementById("btn-musica");
                if (btn) btn.textContent = "Clique para retomar a música";
            }
            try {
                sessionStorage.setItem(chaveSonsAtivos, JSON.stringify(sons));
            } catch (e) {}
        });
    });
}

window.addEventListener("pagehide", salvarSonsAtivos);

document.addEventListener("DOMContentLoaded", function() {
    initEfeitoNeve();
    initParallax();
    initSlideShow();
    initMenu();
    initEfeitoLogo();
    initSomTrocaPagina();
    carregarProdutosDestaque();
    initCatalogo();
    initGaleria();
    initCarrinho();
    initMusicaNatal();
    initFormularioContato();
    initContagemNatal();
    initBotaoTopo();
    initAnimacaoScroll();
    initModalDetalhes();
    restaurarSonsAtivos();
});

function initParallax() {
    var banner = document.querySelector(".banner-home");
    if (!banner) return;

    window.addEventListener("scroll", function() {
        var vel = parseFloat(banner.getAttribute("data-velocidade")) || 0.5;
        banner.style.backgroundPositionY = (window.pageYOffset * vel) + "px";
    });
}

function initMenu() {
    var menu = document.querySelector(".menu");
    var btnMenu = document.querySelector(".btn-menu");
    if (!menu || !btnMenu) return;

    var pagina = window.location.pathname.split("/").pop() || "index.html";

    menu.querySelectorAll("a").forEach(function(link) {
        if (link.getAttribute("href") === pagina) {
            link.classList.add("pagina-atual");
        }
        link.addEventListener("click", function() {
            menu.classList.remove("aberto");
            btnMenu.setAttribute("aria-expanded", "false");
        });
    });

    btnMenu.addEventListener("click", function() {
        var aberto = menu.classList.toggle("aberto");
        btnMenu.setAttribute("aria-expanded", aberto);
    });
}

function initEfeitoLogo() {
    var logo = document.querySelector('header img[alt="Logo Magia do Natal"]');
    if (!logo) return;
    var som = sonsDoSite.logo;

    logo.addEventListener("click", function() {
        som.currentTime = 0;
        som.play().catch(function() {});
    });
}

function initSomTrocaPagina() {
    var som = sonsDoSite.transicao;
    var travado = false;

    document.addEventListener("click", function(evento) {
        var link = evento.target.closest("a[href]");
        if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
        if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;

        var destino = new URL(link.href, window.location.href);
        if (destino.protocol !== window.location.protocol || destino.host !== window.location.host) return;
        if (destino.pathname === window.location.pathname) return;

        evento.preventDefault();
        if (travado) return;
        travado = true;

        var feito = false;
        var timer;

        function ir() {
            if (feito) return;
            feito = true;
            clearTimeout(timer);
            window.location.href = destino.href;
        }

        som.currentTime = 0;
        som.addEventListener("ended", ir, { once: true });
        som.addEventListener("error", ir, { once: true });
        timer = setTimeout(ir, 1000);
        som.play().catch(ir);
    });
}

function carregarProdutosDestaque() {
    var lista = document.getElementById("lista-destaques");
    if (!lista || typeof produtos === "undefined") return;

    lista.innerHTML = "";
    produtos.filter(function(p) { return p.destaque; }).slice(0, 4).forEach(function(produto) {
        lista.appendChild(criarCardProduto(produto, true));
    });
}

function initSlideShow() {
    var carrossel = document.querySelector(".carrossel");
    var areaSlides = document.getElementById("slides-produtos");
    var btnAnt = document.getElementById("anterior");
    var btnProx = document.getElementById("proximo");
    var indicadores = document.getElementById("indicadores-slideshow");

    if (areaSlides && typeof produtos !== "undefined") {
        areaSlides.innerHTML = produtos.slice(0, 5).map(function(produto) {
            return '<article class="slide">' +
                '<img src="' + produto.imagem + '" alt="' + produto.nome + '">' +
                '<div class="conteudo-slide">' +
                '<span>' + produto.categoria + '</span>' +
                '<h2>' + produto.nome + '</h2>' +
                '<p>' + produto.descricao + '</p>' +
                '<strong>' + formatarMoeda(produto.preco) + '</strong>' +
                '</div></article>';
        }).join("");
    }

    var slides = document.querySelectorAll(".carrossel .slide");
    if (!slides.length || !carrossel || !btnAnt || !btnProx) return;

    var idx = 0;
    var autoPlay;

    function mostrarSlide(n) {
        idx = n;
        slides.forEach(function(slide, i) {
            slide.classList.toggle("ativo", i === n);
        });

        if (indicadores) {
            indicadores.querySelectorAll("button").forEach(function(btn, i) {
                var ativo = i === n;
                btn.classList.toggle("ativo", ativo);
                btn.setAttribute("aria-pressed", String(ativo));
            });
        }
    }

    function proximo() {
        idx = (idx + 1) % slides.length;
        mostrarSlide(idx);
    }

    function anterior() {
        idx = (idx - 1 + slides.length) % slides.length;
        mostrarSlide(idx);
    }

    function startAuto() {
        clearInterval(autoPlay);
        autoPlay = setInterval(proximo, 4000);
    }

    function stopAuto() {
        clearInterval(autoPlay);
    }

    btnAnt.addEventListener("click", function() { anterior(); startAuto(); });
    btnProx.addEventListener("click", function() { proximo(); startAuto(); });

    carrossel.addEventListener("mouseenter", stopAuto);
    carrossel.addEventListener("mouseleave", startAuto);

    if (indicadores) {
        indicadores.innerHTML = "";
        slides.forEach(function(slide, index) {
            var indicador = document.createElement("button");
            indicador.type = "button";
            indicador.className = "indicador-slide";
            indicador.setAttribute("aria-label", "Mostrar slide " + (index + 1));
            indicador.addEventListener("click", function() { mostrarSlide(index); startAuto(); });
            indicadores.appendChild(indicador);
        });
    }

    mostrarSlide(idx);
    startAuto();
}

function criarCardProduto(produto, permitir) {
    var cartao = document.createElement("article");
    var precoOk = Number.isFinite(produto.preco);
    var imgHTML = produto.imagem
        ? '<img src="' + produto.imagem + '" alt="' + produto.nome + '" loading="lazy">'
        : '<div class="imagem-indisponivel">Imagem em breve</div>';
    var botoes = permitir
        ? '<div class="acoes-card">' +
            '<button type="button" class="btn-detalhes" data-id="' + produto.id + '">Ver detalhes</button>' +
            '<button type="button" class="btn-comprar" data-id="' + produto.id + '"' + (precoOk ? "" : " disabled") + '>' + (precoOk ? "Adicionar ao carrinho" : "Preço a informar") + '</button>' +
            '</div>'
        : "";

    cartao.className = "card";
    cartao.innerHTML = imgHTML +
        '<h3>' + produto.nome + '</h3>' +
        '<p>' + produto.descricao + '</p>' +
        '<strong>' + formatarMoeda(produto.preco) + '</strong>' +
        botoes;
    return cartao;
}

function formatarMoeda(valor) {
    if (!Number.isFinite(valor)) return "Preço a informar";
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function initCatalogo() {
    var lista = document.getElementById("lista-produtos");
    var busca = document.getElementById("busca");
    var categoria = document.getElementById("categoria");
    var contador = document.getElementById("contador");
    if (!lista || !busca || !categoria || !contador) return;

    function atualizar() {
        var termo = busca.value.trim().toLocaleLowerCase("pt-BR");
        var cat = categoria.value;
        var encontrados = produtos.filter(function(produto) {
            var texto = (produto.nome + " " + produto.categoria + " " + produto.descricao).toLocaleLowerCase("pt-BR");
            var matchBusca = texto.includes(termo);
            var matchCat = cat === "Todas" || produto.categoria === cat;
            return matchBusca && matchCat;
        });

        lista.innerHTML = "";
        contador.textContent = "Mostrando " + encontrados.length + " de " + produtos.length + " produtos";

        if (!encontrados.length) {
            lista.innerHTML = '<p class="estado-vazio">Nenhum produto encontrado.</p>';
            return;
        }

        encontrados.forEach(function(produto) {
            lista.appendChild(criarCardProduto(produto, true));
        });
    }

    busca.addEventListener("input", atualizar);
    categoria.addEventListener("change", atualizar);
    atualizar();
}

function initGaleria() {
    var galeria = document.getElementById("container-produtos");
    if (!galeria) return;

    galeria.innerHTML = "";
    produtos.forEach(function(produto) {
        galeria.appendChild(criarCardProduto(produto, false));
    });

    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = '<div class="conteudo-lightbox" role="dialog" aria-modal="true" aria-label="Imagem do produto">' +
        '<button type="button" class="fechar-lightbox" aria-label="Fechar imagem">&times;</button>' +
        '<img src="" alt=""><p></p></div>';
    document.body.appendChild(lightbox);

    var imgExpandida = lightbox.querySelector("img");
    var legenda = lightbox.querySelector("p");

    function fechar() {
        lightbox.classList.remove("ativo");
        lightbox.setAttribute("aria-hidden", "true");
    }

    galeria.addEventListener("click", function(evento) {
        var img = evento.target.closest(".card img");
        if (!img) return;
        imgExpandida.src = img.src;
        imgExpandida.alt = img.alt;
        legenda.textContent = img.alt;
        lightbox.classList.add("ativo");
        lightbox.setAttribute("aria-hidden", "false");
    });

    lightbox.querySelector(".fechar-lightbox").addEventListener("click", fechar);
    lightbox.addEventListener("click", function(evento) {
        if (evento.target === lightbox) fechar();
    });
    document.addEventListener("keydown", function(evento) {
        if (evento.key === "Escape") fechar();
    });
}

function lerCarrinhoSalvo() {
    try {
        var salvo = JSON.parse(localStorage.getItem("magiaNatalCarrinho-v2") || "[]");
        if (!Array.isArray(salvo)) return [];
        return salvo.filter(function(item) {
            var prod = produtos.find(function(p) { return p.id === Number(item.id); });
            return prod && Number.isFinite(prod.preco) && Number.isInteger(item.quantidade) && item.quantidade > 0;
        });
    } catch (e) {
        return [];
    }
}

function salvarCarrinho(itens) {
    try {
        localStorage.setItem("magiaNatalCarrinho-v2", JSON.stringify(itens));
    } catch (e) {}
}

function initCarrinho() {
    var modal = document.getElementById("modal-carrinho");
    var btnAbrir = document.getElementById("btn-carrinho");
    var btnFechar = document.getElementById("btn-fechar-carrinho");
    var btnEsvaziar = document.getElementById("btn-esvaziar-carrinho");
    var painel = document.getElementById("itens-carrinho-painel");
    var linhasExtrato = document.getElementById("linhas-extrato-pedido");
    var totalExtrato = document.getElementById("total-extrato-pedido");
    if (!modal || !btnAbrir || !btnFechar || !painel) return;

    var itensCarrinho = lerCarrinhoSalvo();

    function atualizar() {
        var qtdTotal = itensCarrinho.reduce(function(s, i) { return s + i.quantidade; }, 0);
        var total = itensCarrinho.reduce(function(s, item) {
            var prod = produtos.find(function(p) { return p.id === item.id; });
            return s + (prod ? prod.preco * item.quantidade : 0);
        }, 0);

        document.getElementById("qtd-carrinho").textContent = qtdTotal;
        document.getElementById("total-carrinho").textContent = formatarMoeda(total);
        if (totalExtrato) totalExtrato.textContent = formatarMoeda(total);

        if (!itensCarrinho.length) {
            painel.innerHTML = '<p class="estado-vazio">Seu carrinho está vazio.</p>';
            if (linhasExtrato) linhasExtrato.innerHTML = '<p class="extrato-vazio">Seu pedido ainda não tem itens.</p>';
        } else {
            painel.innerHTML = itensCarrinho.map(function(item) {
                var prod = produtos.find(function(p) { return p.id === item.id; });
                return '<div class="item-painel">' +
                    '<div class="item-painel-info">' +
                    '<strong>' + prod.nome + '</strong>' +
                    '<span>' + formatarMoeda(prod.preco) + ' cada</span>' +
                    '</div>' +
                    '<div class="controles-qtd">' +
                    '<button type="button" class="btn-qtd" data-acao="diminuir" data-id="' + item.id + '" aria-label="Diminuir quantidade">-</button>' +
                    '<span>' + item.quantidade + '</span>' +
                    '<button type="button" class="btn-qtd" data-acao="aumentar" data-id="' + item.id + '" aria-label="Aumentar quantidade">+</button>' +
                    '<button type="button" class="btn-remover-item" data-acao="remover" data-id="' + item.id + '">Remover</button>' +
                    '</div></div>';
            }).join("");

            if (linhasExtrato) {
                linhasExtrato.innerHTML = itensCarrinho.map(function(item) {
                    var prod = produtos.find(function(p) { return p.id === item.id; });
                    var subtotal = prod.preco * item.quantidade;
                    return '<div class="linha-extrato"><span>' + item.quantidade + ' x ' + prod.nome + '</span><strong>' + formatarMoeda(subtotal) + '</strong></div>';
                }).join("");
            }
        }

        if (btnEsvaziar) btnEsvaziar.disabled = itensCarrinho.length === 0;
        salvarCarrinho(itensCarrinho);
    }

    function adicionar(id) {
        var prod = produtos.find(function(p) { return p.id === id; });
        if (!prod || !Number.isFinite(prod.preco)) return;

        var item = itensCarrinho.find(function(i) { return i.id === id; });
        if (item) {
            item.quantidade += 1;
        } else {
            itensCarrinho.push({ id: id, quantidade: 1 });
        }
        atualizar();
    }

    btnAbrir.addEventListener("click", function() { modal.classList.add("ativo"); });
    btnFechar.addEventListener("click", function() { modal.classList.remove("ativo"); });
    modal.addEventListener("click", function(evento) {
        if (evento.target === modal) modal.classList.remove("ativo");
    });
    document.addEventListener("keydown", function(evento) {
        if (evento.key === "Escape") modal.classList.remove("ativo");
    });

    document.addEventListener("click", function(evento) {
        var btn = evento.target.closest(".btn-comprar");
        if (!btn) return;
        adicionar(Number(btn.dataset.id));
    });

    painel.addEventListener("click", function(evento) {
        var btn = evento.target.closest("[data-acao]");
        if (!btn) return;

        var id = Number(btn.dataset.id);
        var item = itensCarrinho.find(function(i) { return i.id === id; });
        if (!item) return;

        if (btn.dataset.acao === "aumentar") item.quantidade += 1;
        if (btn.dataset.acao === "diminuir") item.quantidade -= 1;
        if (btn.dataset.acao === "remover" || item.quantidade <= 0) {
            itensCarrinho = itensCarrinho.filter(function(i) { return i.id !== id; });
        }
        atualizar();
    });

    if (btnEsvaziar) {
        btnEsvaziar.addEventListener("click", function() {
            itensCarrinho = [];
            atualizar();
        });
    }

    atualizar();
}

function initMusicaNatal() {
    var btn = document.getElementById("btn-musica");
    if (!btn) return;
    var audio = sonsDoSite.musicaFundo;

    btn.addEventListener("click", function() {
        if (audio.paused) {
            audio.play().then(function() {
                btn.textContent = "Pausar música de Natal";
            }).catch(function() {
                btn.textContent = "Não foi possível tocar a música";
            });
        } else {
            audio.pause();
            btn.textContent = "Tocar música de Natal";
        }
    });
}

function initFormularioContato() {
    var form = document.getElementById("form-contato");
    var msg = document.getElementById("mensagem-form");
    if (!form || !msg) return;

    form.querySelectorAll("input, textarea").forEach(function(campo) {
        campo.addEventListener("invalid", function() {
            msg.classList.remove("mensagem-sucesso");
            msg.classList.add("mensagem-erro");
            msg.textContent = campo.validity.typeMismatch
                ? "Digite um endereço de e-mail válido."
                : "Preencha este campo antes de enviar.";
        });
        campo.addEventListener("input", function() {
            msg.textContent = "";
            msg.classList.remove("mensagem-erro", "mensagem-sucesso");
        });
    });

    form.addEventListener("submit", function(evento) {
        evento.preventDefault();
        var nome = document.getElementById("nome").value.trim();
        var email = document.getElementById("email").value.trim();
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!nome || !emailOk || !document.getElementById("assunto").value.trim() || !document.getElementById("mensagem").value.trim()) {
            msg.classList.remove("mensagem-sucesso");
            msg.classList.add("mensagem-erro");
            msg.textContent = !emailOk ? "Digite um endereço de e-mail válido." : "Preencha todos os campos obrigatórios.";
            return;
        }

        msg.classList.remove("mensagem-erro");
        msg.classList.add("mensagem-sucesso");
        msg.textContent = "Obrigado, " + nome + "! Os dados do formulário foram validados.";
        form.reset();
    });
}

function initContagemNatal() {
    var dias = document.getElementById("dias");
    var horas = document.getElementById("horas");
    var minutos = document.getElementById("minutos");
    var segundos = document.getElementById("segundos");
    if (!dias || !horas || !minutos || !segundos) return;

    var agora = new Date();
    var natal = new Date(agora.getFullYear(), 11, 25);
    if (agora >= natal) natal = new Date(agora.getFullYear() + 1, 11, 25);

    function atualizar() {
        agora = new Date();
        if (agora >= natal) natal = new Date(natal.getFullYear() + 1, 11, 25);

        var rest = natal.getTime() - agora.getTime();
        dias.textContent = String(Math.floor(rest / 86400000)).padStart(2, "0");
        horas.textContent = String(Math.floor(rest / 3600000) % 24).padStart(2, "0");
        minutos.textContent = String(Math.floor(rest / 60000) % 60).padStart(2, "0");
        segundos.textContent = String(Math.floor(rest / 1000) % 60).padStart(2, "0");
    }

    atualizar();
    setInterval(atualizar, 1000);
}

function initBotaoTopo() {
    var btn = document.getElementById("topo");
    if (!btn) return;

    function visibilidade() {
        btn.style.display = window.scrollY > 300 ? "block" : "none";
    }

    window.addEventListener("scroll", visibilidade);
    btn.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    visibilidade();
}

function initEfeitoNeve() {
    if (!document.querySelector(".banner-home")) return;

    var container = document.createElement("div");
    container.id = "container-neve";
    container.setAttribute("aria-hidden", "true");

    for (var i = 0; i < 24; i++) {
        var floco = document.createElement("span");
        floco.className = "floco-neve";
        floco.textContent = "❄";
        floco.style.left = Math.random() * 100 + "vw";
        floco.style.fontSize = (0.6 + Math.random() * 0.9) + "rem";
        floco.style.animationDuration = (7 + Math.random() * 8) + "s";
        floco.style.animationDelay = (Math.random() * -12) + "s";
        floco.style.opacity = (0.35 + Math.random() * 0.6);
        container.appendChild(floco);
    }

    document.body.appendChild(container);
}

function initAnimacaoScroll() {
    var elems = document.querySelectorAll(
        ".carrossel, .titulo-secao, .subtitulo-secao, #lista-destaques, .historia, .caixa-contagem, .secao-equipe"
    );
    if (!elems.length) return;

    elems.forEach(function(el) { el.classList.add("revelar"); });

    if (!("IntersectionObserver" in window)) {
        elems.forEach(function(el) { el.classList.add("visivel"); });
        return;
    }

    var obs = new IntersectionObserver(function(entradas) {
        entradas.forEach(function(entrada) {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("visivel");
            obs.unobserve(entrada.target);
        });
    }, { threshold: 0.1 });

    elems.forEach(function(el) { obs.observe(el); });
}

function initModalDetalhes() {
    var modal = document.createElement("div");
    modal.className = "modal-detalhes";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = '<div class="conteudo-detalhes" role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes">' +
        '<button type="button" class="fechar-detalhes" aria-label="Fechar detalhes">&times;</button>' +
        '<img src="" alt=""><div>' +
        '<h2 id="titulo-detalhes"></h2>' +
        '<p class="categoria-detalhes"></p>' +
        '<p class="descricao-detalhes"></p>' +
        '<strong class="preco-detalhes"></strong>' +
        '<button type="button" class="btn-comprar">Adicionar ao carrinho</button>' +
        '</div></div>';
    document.body.appendChild(modal);

    var img = modal.querySelector("img");
    var titulo = modal.querySelector("#titulo-detalhes");
    var cat = modal.querySelector(".categoria-detalhes");
    var desc = modal.querySelector(".descricao-detalhes");
    var preco = modal.querySelector(".preco-detalhes");
    var btnComprar = modal.querySelector(".btn-comprar");

    function fechar() {
        modal.classList.remove("ativo");
        modal.setAttribute("aria-hidden", "true");
    }

    document.addEventListener("click", function(evento) {
        var btn = evento.target.closest(".btn-detalhes");
        if (!btn) return;

        var prod = produtos.find(function(p) { return p.id === Number(btn.dataset.id); });
        if (!prod) return;

        img.alt = prod.nome;
        img.hidden = !prod.imagem;
        if (prod.imagem) img.src = prod.imagem;
        else img.removeAttribute("src");
        titulo.textContent = prod.nome;
        cat.textContent = prod.categoria;
        desc.textContent = prod.descricao;
        preco.textContent = formatarMoeda(prod.preco);
        btnComprar.dataset.id = prod.id;
        var precoOk = Number.isFinite(prod.preco);
        btnComprar.disabled = !precoOk;
        btnComprar.textContent = precoOk ? "Adicionar ao carrinho" : "Preço a informar";
        modal.classList.add("ativo");
        modal.setAttribute("aria-hidden", "false");
    });

    modal.querySelector(".fechar-detalhes").addEventListener("click", fechar);
    modal.addEventListener("click", function(evento) {
        if (evento.target === modal) fechar();
    });
    document.addEventListener("keydown", function(evento) {
        if (evento.key === "Escape") fechar();
    });
}