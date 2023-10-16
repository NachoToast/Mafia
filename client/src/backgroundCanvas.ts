/** Size (in pixels) of each background square. */
const SIZE = 20;

/** Space (in pixels) between each background square. */
const SPACING = 1;

let currentY = 0;
let currentX = 0;

function makeCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.backgroundColor = 'black';

    canvas.oncontextmenu = () => false;

    canvas.id = 'background-canvas';
    document.body.appendChild(canvas);

    return canvas;
}

export function initialiseBackgroundCanvas(): void {
    const canvas = makeCanvas();

    const context = canvas.getContext('2d');

    if (context === null) {
        console.error('Unable to get 2D context for background canvas.');
        return;
    }

    const ctx = context;

    let currentTime = Date.now();

    function regenerateCanvas(): void {
        const now = Date.now();
        const delta = now - currentTime;
        currentTime = now;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const squaresPerRow = Math.ceil(
            (canvas.width - SPACING) / (SIZE + SPACING),
        );
        const squaresPerCol = Math.ceil(
            (canvas.height - SPACING) / (SIZE + SPACING),
        );

        for (let i = -1; i < squaresPerCol; i++) {
            for (let j = -1; j < squaresPerRow; j++) {
                const x = currentX + SPACING + j * (SIZE + SPACING);
                const y = currentY + SPACING + i * (SIZE + SPACING);

                ctx.fillStyle = 'rgba(23, 23, 23, 0.3)';
                ctx.fillRect(x, y, SIZE, SIZE);
            }
        }

        currentY = (currentY + 0.025 * delta) % (SIZE + SPACING);
        currentX = (currentX + 0.025 * delta) % (SIZE + SPACING);

        window.requestAnimationFrame(regenerateCanvas);
    }

    regenerateCanvas();
}
