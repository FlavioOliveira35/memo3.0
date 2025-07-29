document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.main-title');
    const header = document.querySelector('.main-header');

    const animateTitle = () => {
        const originalHTML = title.innerHTML;
        const textNodes = [];

        // Função para extrair nós de texto e seus pais
        const extractTextNodes = (element) => {
            element.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                    textNodes.push({
                        text: node.textContent,
                        parent: node.parentNode
                    });
                    node.textContent = '';
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    extractTextNodes(node);
                }
            });
        };

        extractTextNodes(title);

        let nodeIndex = 0;
        let textIndex = 0;

        const type = () => {
            if (nodeIndex < textNodes.length) {
                const currentNode = textNodes[nodeIndex];
                if (textIndex < currentNode.text.length) {
                    currentNode.parent.innerHTML += currentNode.text[textIndex];
                    textIndex++;
                    setTimeout(type, 50); // Velocidade da digitação
                } else {
                    nodeIndex++;
                    textIndex = 0;
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
