document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.main-title');
    const header = document.querySelector('.main-header');

    const animateTitle = () => {
        // 1. Pega todos os nós filhos do elemento do título
        const nodes = Array.from(title.childNodes);
        const elementsToAnimate = [];

        // 2. Itera sobre os nós para encontrar os nós de texto e prepará-los
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Se o nó é um elemento (como <span class="highlight">),
                // pegamos o texto de dentro dele.
                const text = node.textContent;
                node.textContent = ''; // Limpa o conteúdo para a animação
                elementsToAnimate.push({ element: node, text: text, isElement: true });
            } else if (node.nodeType === Node.TEXT_NODE) {
                // Se é um nó de texto simples
                const text = node.textContent;
                node.textContent = '';
                elementsToAnimate.push({ element: node, text: text, isElement: false });
            } else {
                 // Preserva outros nós como <br>
                elementsToAnimate.push({ element: node, text: '', isElement: false });
            }
        });

        title.innerHTML = ''; // Limpa o container principal

        let elementIndex = 0;
        let charIndex = 0;

        const type = () => {
            if (elementIndex < elementsToAnimate.length) {
                const current = elementsToAnimate[elementIndex];

                // Reconstrói o DOM
                if (charIndex === 0) {
                    title.appendChild(current.element);
                }

                if (charIndex < current.text.length) {
                    current.element.textContent += current.text[charIndex];
                    charIndex++;
                    setTimeout(type, 35); // Velocidade da digitação
                } else {
                    elementIndex++;
                    charIndex = 0;
                    type();
                }
            }
        };

        type();
    };

    const handleHeaderHover = () => {
        const highlight = document.querySelector('.main-title .highlight');
        if (highlight) {
            highlight.style.color = 'var(--primary-color)';
            highlight.style.textShadow = '0 0 10px var(--primary-color), 0 0 20px var(--primary-color)';
        }
    };

    const handleHeaderMouseOut = () => {
        const highlight = document.querySelector('.main-title .highlight');
        if (highlight) {
            highlight.style.color = 'var(--secondary-color)';
            highlight.style.textShadow = '0 0 10px var(--secondary-color), 0 0 20px var(--secondary-color)';
        }
    };

    if (title) {
        animateTitle();
    }

    if(header) {
        header.addEventListener('mouseover', handleHeaderHover);
        header.addEventListener('mouseout', handleHeaderMouseOut);
    }
});
