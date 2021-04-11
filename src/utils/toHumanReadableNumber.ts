const units = ['', 'k', 'M', 'G', 'T'];

const defaultFormatter: (num: number) => string | number = (num: number) => num;

export function toHumanReadableNumber(
    num: number,
    baseUnit: string = 'B',
    prefix: 1000 | 1024 = 1000,
    formatter = defaultFormatter
) {
    let iterations = 0;

    do {
        num /= prefix;
        iterations++;
    } while (num >= prefix)

    return `${formatter(num)} ${units[iterations]}${prefix === 1024 ? 'i' : ''}${baseUnit}`;
}