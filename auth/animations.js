document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.main-title');
    const header = document.querySelector('.main-header');

    const animateTitle = () => {
        const words = title.innerHTML.split(/(<br>)/);
        title.innerHTML = '';

        let wordIndex = 0;

        const typeWord = () => {
            if (wordIndex < words.length) {
                let word = words[wordIndex];
                if (word === '<br>') {
                    title.innerHTML += word;
                    wordIndex++;
                    setTimeout(typeWord, 100);
                    return;
                }

                let i = 0;
                const typeChar = () => {
                    if (i < word.length) {
                        title.innerHTML += word[i];
                        i++;
                        setTimeout(typeChar, 50);
                    } else {
                        wordIndex++;
                        setTimeout(typeWord, 100);
                    }
                };
                typeChar();
            }
        };

        typeWord();
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
