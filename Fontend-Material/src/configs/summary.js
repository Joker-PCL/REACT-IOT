// หาผลรวม ['17,684', '18,588', '19,864', '18,952'] = 75088;
export const sumStringNumber = (strNumberArr) => {
    const summary = strNumberArr.reduce((total, str) => {
        const number = parseFloat(str.replace(/,/g, ""));
        return total + number;
    }, 0);

    return summary;
}

// หาค่าเฉลี่ย ['83.81', '70.95', '82.42', '78.64'] = 64.80;
export const avgStringDecimal = (strDecimalArr) => {
    const floatNumbers = strDecimalArr.map(Number);
    const sum = floatNumbers.reduce((total, number) => total + number, 0);
    const average = sum / floatNumbers.length;

    return average.toFixed(2);
}

// หาค่าเฉลี่ย ['45.20%', '35.79%', '44.86%', '42.09%', '1.99%'] = 41.25%;
export const avgStringPercentage = (strPercentageArr) => {
    const percentage = strPercentageArr.map(percent => parseFloat(percent.replace('%', '')));
    const sum = percentage.reduce((total, number) => total + number, 0);
    const average = sum / percentage.length;

    return average.toFixed(2) + '%';
}