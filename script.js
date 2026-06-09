/* ==========================================================================
   LÓGICA PRINCIPAL - GABRIELLY'S VALENTINE PAGE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  
  // Elementos do DOM
  const envelopeOverlay = document.getElementById("envelope-overlay");
  const openBtn = document.getElementById("open-btn");
  const mainContent = document.getElementById("main-content");
  const bgMusic = document.getElementById("bg-music");
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  const particleCanvas = document.getElementById("particle-canvas");
  
  // Datas dos Marcos Importantes
  const dataNamoro = "2017-05-26T00:00:00"; // 26 de Maio de 2017
  const dataCasamento = "2019-07-13T00:00:00"; // 13 de Julho de 2019

  let timerInterval = null;

  /* ==========================================================================
     1. SISTEMA DE PARTÍCULAS (Canvas de Corações Flutuantes & Cliques)
     ========================================================================== */
  const ctx = particleCanvas.getContext("2d");
  let particles = [];
  
  // Redimensionar Canvas
  function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Cores românticas para os corações
  const heartColors = [
    "rgba(183, 110, 121, ",  // Rose Gold
    "rgba(212, 175, 55, ",   // Gold
    "rgba(183, 9, 76, ",     // Deep Red / Crimson
    "rgba(224, 176, 255, ",  // Lavender Rose
    "rgba(255, 182, 193, "   // Light Pink
  ];

  // Classe das partículas de Coração
  class HeartParticle {
    constructor(x, y, isInteractive = false) {
      this.x = x;
      this.y = y;
      this.isInteractive = isInteractive;
      
      // Tamanho e velocidade baseados no tipo (ambiente vs toque)
      if (this.isInteractive) {
        this.size = Math.random() * 14 + 10; // Corações maiores no toque
        this.speedY = -(Math.random() * 3 + 2); // Sobem mais rápido
        this.speedX = (Math.random() - 0.5) * 3; // Espalham lateralmente
        this.opacity = 1;
        this.fadeSpeed = Math.random() * 0.015 + 0.01;
      } else {
        this.size = Math.random() * 8 + 6;
        this.speedY = -(Math.random() * 0.8 + 0.4); // Sobem devagar
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.2; // Mais translúcidos ao fundo
        this.fadeSpeed = 0; // Não desaparecem por tempo, renascem no topo
      }
      
      // Frequência de oscilação lateral
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.swayOffset = Math.random() * Math.PI * 2;
      
      // Cor aleatória da lista
      this.colorBase = heartColors[Math.floor(Math.random() * heartColors.length)];
    }

    update() {
      this.y += this.speedY;
      
      if (this.isInteractive) {
        this.x += this.speedX;
        this.opacity -= this.fadeSpeed;
      } else {
        // Balanço suave em seno
        this.swayOffset += this.swaySpeed;
        this.x += Math.sin(this.swayOffset) * 0.3 + this.speedX;
        
        // Recicla se sair pelo topo da tela
        if (this.y < -30) {
          this.y = particleCanvas.height + 20;
          this.x = Math.random() * particleCanvas.width;
          this.opacity = Math.random() * 0.5 + 0.2;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.fillStyle = `${this.colorBase}${this.opacity})`;
      ctx.shadowBlur = this.isInteractive ? 8 : 2;
      ctx.shadowColor = "rgba(183, 110, 121, 0.4)";
      
      // Desenhar o formato de coração
      ctx.beginPath();
      const x = this.x;
      const y = this.y;
      const size = this.size;
      
      ctx.moveTo(x, y);
      // Curva esquerda
      ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
      // Curva direita
      ctx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  }

  // Inicializar partículas de fundo (ambiente)
  function initAmbientParticles() {
    const ambientCount = 35; // Quantidade elegante para não sobrecarregar
    for (let i = 0; i < ambientCount; i++) {
      particles.push(new HeartParticle(
        Math.random() * particleCanvas.width,
        Math.random() * particleCanvas.height
      ));
    }
  }

  // Criar corações ao tocar/clicar
  function spawnHearts(e) {
    // Pegar coordenadas do toque ou clique
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Spawna 5 a 8 corações por toque
    const count = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < count; i++) {
      particles.push(new HeartParticle(clientX, clientY, true));
    }
  }

  // Loop de Animação das Partículas
  function animateParticles() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      
      // Remove partículas interativas que sumiram completamente
      if (p.isInteractive && p.opacity <= 0) {
        particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(animateParticles);
  }

  // Eventos de Toque/Clique para lançar corações
  window.addEventListener("click", spawnHearts);
  window.addEventListener("touchstart", spawnHearts);

  // Iniciar partículas
  initAmbientParticles();
  animateParticles();

  /* ==========================================================================
     2. LÓGICA DO ENVELOPE (Abertura da página)
     ========================================================================== */
  openBtn.addEventListener("click", () => {
    // Adiciona classe de abertura para rodar as transições CSS do envelope
    envelopeOverlay.classList.add("open");
    
    // Tenta iniciar a música de fundo imediatamente
    playBackgroundMusic();

    // Aguarda a animação do envelope e então faz o fadeout da overlay
    setTimeout(() => {
      envelopeOverlay.classList.add("fade-out");
      mainContent.classList.remove("hidden");
      
      // Inicia os contadores de tempo real
      startTimers();
      
      // Aciona o observer de fade-in no scroll
      initScrollObserver();
      
      // Remove o envelope do DOM após sumir para liberar memória
      setTimeout(() => {
        envelopeOverlay.style.display = "none";
      }, 1000);
    }, 1500);
  });

  /* ==========================================================================
     3. CONTADOR DINÂMICO DE TEMPO (Namoro & Casamento)
     ========================================================================== */
  function getCalendarDifference(startDateStr) {
    const now = new Date();
    const start = new Date(startDateStr);
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();
    
    // Ajustar segundos
    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    // Ajustar minutos
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    // Ajustar horas
    if (hours < 0) {
      hours += 24;
      days--;
    }
    // Ajustar dias baseado no tamanho do mês anterior
    if (days < 0) {
      // Cria um objeto correspondente ao último dia do mês anterior ao atual
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    // Ajustar meses
    if (months < 0) {
      months += 12;
      years--;
    }
    
    return { years, months, days, hours, minutes, seconds };
  }

  function formatTimeNumber(num) {
    return num.toString().padStart(2, '0');
  }

  function updateTimers() {
    // 1. Atualizar Namoro
    const diffNamoro = getCalendarDifference(dataNamoro);
    document.getElementById("n-years").textContent = formatTimeNumber(diffNamoro.years);
    document.getElementById("n-months").textContent = formatTimeNumber(diffNamoro.months);
    document.getElementById("n-days").textContent = formatTimeNumber(diffNamoro.days);
    document.getElementById("n-hours").textContent = formatTimeNumber(diffNamoro.hours);
    document.getElementById("n-minutes").textContent = formatTimeNumber(diffNamoro.minutes);
    document.getElementById("n-seconds").textContent = formatTimeNumber(diffNamoro.seconds);

    // 2. Atualizar Casamento
    const diffCasamento = getCalendarDifference(dataCasamento);
    document.getElementById("c-years").textContent = formatTimeNumber(diffCasamento.years);
    document.getElementById("c-months").textContent = formatTimeNumber(diffCasamento.months);
    document.getElementById("c-days").textContent = formatTimeNumber(diffCasamento.days);
    document.getElementById("c-hours").textContent = formatTimeNumber(diffCasamento.hours);
    document.getElementById("c-minutes").textContent = formatTimeNumber(diffCasamento.minutes);
    document.getElementById("c-seconds").textContent = formatTimeNumber(diffCasamento.seconds);
  }

  function startTimers() {
    updateTimers(); // Executa a primeira vez imediatamente
    timerInterval = setInterval(updateTimers, 1000);
  }

  /* ==========================================================================
     4. CONTROLES DE MÚSICA DE FUNDO
     ========================================================================== */
  function playBackgroundMusic() {
    bgMusic.play()
      .then(() => {
        musicToggleBtn.classList.remove("paused");
      })
      .catch((err) => {
        console.log("Autoplay bloqueado pelo navegador ou arquivo ausente. O áudio tocará no primeiro clique.");
        musicToggleBtn.classList.add("paused");
      });
  }

  musicToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita lançar corações ao tocar no botão de música
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggleBtn.classList.remove("paused");
    } else {
      bgMusic.pause();
      musicToggleBtn.classList.add("paused");
    }
  });

  /* ==========================================================================
     5. CARROSSEL TOUCH-SWIPE (Galeria de Fotos)
     ========================================================================== */
  const viewport = document.getElementById("carousel-viewport");
  const slides = document.querySelectorAll(".carousel-slide");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const indicatorsContainer = document.getElementById("carousel-indicators");
  
  let carouselIndex = 0;
  const totalSlides = slides.length;
  let autoSlideTimer = null;

  // Criar indicadores dinâmicos
  function createCarouselIndicators() {
    indicatorsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
      const indicator = document.createElement("div");
      indicator.classList.add("indicator");
      if (i === 0) indicator.classList.add("active");
      indicator.addEventListener("click", () => {
        goToSlide(i);
        resetAutoSlide();
      });
      indicatorsContainer.appendChild(indicator);
    }
  }

  function updateCarouselState() {
    // Desloca o viewport horizontalmente
    viewport.style.transform = `translateX(-${carouselIndex * 100}%)`;
    
    // Atualiza classe dos indicadores
    const indicators = document.querySelectorAll(".indicator");
    indicators.forEach((ind, index) => {
      if (index === carouselIndex) {
        ind.classList.add("active");
      } else {
        ind.classList.remove("active");
      }
    });
  }

  function goToSlide(index) {
    carouselIndex = (index + totalSlides) % totalSlides;
    updateCarouselState();
  }

  function nextSlide() {
    goToSlide(carouselIndex + 1);
  }

  function prevSlide() {
    goToSlide(carouselIndex - 1);
  }

  // Eventos de clique nos controles
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    nextSlide();
    resetAutoSlide();
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    prevSlide();
    resetAutoSlide();
  });

  // Gestos de Toque (Swipe) no Carrossel para Celular
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;

  viewport.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    viewport.style.transition = "none"; // Desliga a transição durante o arrasto físico
    resetAutoSlide();
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    
    // Calcula a posição em pixel baseado no índice atual e no arrasto
    const width = viewport.offsetWidth;
    const baseTranslate = -carouselIndex * width;
    const targetTranslate = baseTranslate + diffX;
    
    viewport.style.transform = `translateX(${targetTranslate}px)`;
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"; // Devolve a suavidade
    
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    const threshold = viewport.offsetWidth * 0.18; // Deslizar pelo menos 18% da largura para mudar

    if (diffX < -threshold) {
      nextSlide();
    } else if (diffX > threshold) {
      prevSlide();
    } else {
      goToSlide(carouselIndex); // Volta para o slide atual
    }
  });

  // Auto Slide a cada 4 segundos
  function startAutoSlide() {
    autoSlideTimer = setInterval(nextSlide, 4500);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  createCarouselIndicators();
  startAutoSlide();

  /* ==========================================================================
     6. SISTEMA LIGHTBOX (Zoom de Fotos)
     ========================================================================== */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  window.openLightbox = function(src) {
    lightboxImg.src = src;
    lightbox.classList.add("active");
    // Previne rolagem no fundo enquanto o lightbox está ativo
    document.body.style.overflow = "hidden";
  };

  window.closeLightbox = function() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
      lightboxImg.src = ""; // Limpa a fonte após fechar
    }, 400);
  };

  // Fecha lightbox pressionando ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ==========================================================================
     7. INTERSECTION OBSERVER (Fade-in suave durante scroll)
     ========================================================================== */
  function initScrollObserver() {
    const fadeSections = document.querySelectorAll(".fade-in-section");
    
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.12 // Elemento surge quando 12% dele estiver visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Deixa de observar após animar
        }
      });
    }, observerOptions);

    fadeSections.forEach(section => {
      observer.observe(section);
    });
  }

});
