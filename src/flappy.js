 function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
 }

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)// verifica se a barreira esta em pe ou de cabeça para baixo
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`//define a altura das barreiras 
}

// const b = new Barreira(true)
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function parBarreiras(altura, abertura, posicao) {
    this.elemento = novoElemento('div', 'par-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getPosicao = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setPosicao = posicao => this.elemento.style.left = `${posicao}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setPosicao(posicao)
}

// const b = new parBarreiras(400, 100, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parBarreiras(altura, abertura, largura),
        new parBarreiras(altura, abertura, largura + espaco),
        new parBarreiras(altura, abertura, largura + espaco * 2),
        new parBarreiras(altura, abertura, largura + espaco *3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setPosicao(par.getPosicao() - deslocamento)

            //quando o elemento sair da área do jogo as barreiras vão sumir e vão ser sorteadas de novo
            if (par.getPosicao() < -par.getLargura()) {
                par.setPosicao(par.getPosicao() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getPosicao() + deslocamento >= meio 
                && par.getPosicao() < meio
            if (cruzouOMeio) {
                notificarPonto()
            }  
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = './imgs/passaro.png'

    this.getPosicaoPassaro = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setPosicaoPassaro = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getPosicaoPassaro() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight
        //Faz com que o passaro não ultrapasse o teto e nem o chão do jogo
        if (novoY <= 0) {
            this.setPosicaoPassaro(0)
        } else if (novoY >= alturaMaxima) {
            this.setPosicaoPassaro(alturaMaxima)
        } else {
            this.setPosicaoPassaro(novoY)
        }
    }

    this.setPosicaoPassaro(alturaJogo / 2)
}

// const barreiras = new Barreiras(400, 1200, 150, 400)
// const passaro = new Passaro(480)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(passaro.elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
}

function colisao(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parBarreiras => {
        if (!colidiu) {
            const superior = parBarreiras.superior.elemento
            const inferior = parBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) 
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 260 , 350,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colisao(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()