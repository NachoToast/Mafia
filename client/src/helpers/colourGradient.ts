/** Valid values are from 0 to 255 (inclusive) */
export interface Colour {
    red: number;
    blue: number;
    green: number;
}

/** Calculates an intermediary colour between 2 or 3 colours.
 * @returns {Colour} Object with red, green, and blue number fields.
 * @example -> {red: 123, blue: 255, green: 0}
 */
export default function colourGradient(
    min: number,
    max: number,
    current: number,
    colorA: Colour,
    colorB: Colour,
    colorC?: Colour,
): Colour {
    let progression;
    if (current >= max) progression = 1;
    else progression = (current - min) / (max - min); // Standardize as decimal [0-1 (inc)].
    if (colorC) {
        progression *= 2;
        if (progression >= 1) {
            progression -= 1;
            colorA = colorB;
            colorB = colorC;
        }
    }

    const newRed = colorA.red + progression * (colorB.red - colorA.red);
    const newGreen = colorA.green + progression * (colorB.green - colorA.green);
    const newBlue = colorA.blue + progression * (colorB.blue - colorA.blue);

    const red = Math.floor(newRed);
    const green = Math.floor(newGreen);
    const blue = Math.floor(newBlue);

    return { red, green, blue };
}
