document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.main-title');
    const header = document.querySelector('.main-header');

    const animateTitle = () => {
        const text = title.innerHTML;
        title.innerHTML = '';
        let i = 0;

        const typing = () => {
            if (i < text.length) {
                title.innerHTML += text.charAt(i);
                i++;
                setTimeout(typing, 100);
            }
        };
        typing();
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
