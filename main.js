
document.getElementById('form').addEventListener('submit', (event) => {
    event.preventDefault();
    let expression = document.getElementById('expressionInput').value;
    exec(expression);
});

function exec(expression) {

    let tokens = [];
    let currentToken = null;

    // Token initialization
    // types: function, variable, number, operator, bracket, unknown

    for (let i = 0; i <= expression.length; i++) {

        let char = expression.charAt(i);

        if (char == ' ') {
            continue;
        }

        // Editing current token
        if (currentToken != null) {

            // TODO: user-defined functions
            if (/^(sin|cos|tg|ctg)$/.test(currentToken.value)) {
                currentToken.value += char;
                currentToken.type = 'function';
            }

            else if (currentToken.type == 'variable' && /^[\d|a-z]$/.test(char)) {
                currentToken.value += char;
            }

            else if (currentToken.type == 'number' && /^[\d|.]$/.test(char)) {
                currentToken.value += char;
            }

            // for variable error
            else if (currentToken.type == 'number' && /^[a-z]$/.test(char)) {
                currentToken.value += char;
                currentToken.type = 'variable';
            }

            else if (currentToken.type == 'function') {
                currentToken.value += char;
                if (char == ')') {
                    tokens.push(currentToken);
                    currentToken = null;
                    continue;
                }
            }

            else {
                tokens.push(currentToken);
                currentToken = null;
            }
        }

        // New token
        if (currentToken == null) {

            if (/^[+\-*\/]$/.test(char)) {
                tokens.push({ type: 'operator', value: char, startPos: i });
            }

            else if (/^[()]$/.test(char)) {
                tokens.push({ type: 'bracket', value: char, startPos: i });
            }

            else if (/^[a-z]$/.test(char)) {
                currentToken = { type: 'variable', value: char, startPos: i };
            }

            else if (/^[\d]$/.test(char)) {
                currentToken = { type: 'number', value: char, startPos: i };
            }

            else if (char != '') {
                tokens.push({ type: 'unknown', value: char, startPos: i });
            }
        }
    }

    console.log(tokens);

    let errorMessages = [];

    // Error handling

    let bracketQueue = [];
    let openedBracketsCount = 0, closedBracketsCount = 0;
    for (let i = 0; i < tokens.length; i++) {

        let token = tokens[i];
        let nextToken = tokens[i + 1];
        let previousToken = tokens[i - 1];

        if (token.type == 'unknown') {
            errorMessages.push(`Позиція ${token.startPos}: Невідомий символ.`);
        }

        let startsWithOperator = i == 0 && token.type == 'operator' && token.value != '-';
        if (startsWithOperator) {
            errorMessages.push(`Позиція ${token.startPos}: Вираз не може починатися з математичних операцій крім '-'.`);
        }

        let startsWithClosingBracket = i == 0 && token.type == 'bracket' && token.value == ')';
        if (startsWithClosingBracket) {
            errorMessages.push(`Позиція ${token.startPos}: Вираз не може починатися із закритої дужки.`);
        }

        let endsWithOperator = i == tokens.length - 1 && token.type == 'operator';
        if (endsWithOperator) {
            errorMessages.push(`Позиція ${token.startPos}: Вираз не може закінчуватись математичною операцією.`);
        }

        let endsWithOpeningBracket = i == tokens.length - 1 && token.type == 'bracket' && token.value == '(';
        if (endsWithOpeningBracket) {
            errorMessages.push(`Позиція ${token.startPos}: Вираз не може закінчуватись відкритою дужкою.`);
        }

        let variableStartsWithDigit = token.type == 'variable' && /^\d$/.test(token.value.charAt(0));
        if (variableStartsWithDigit) {
            errorMessages.push(`Позиція ${token.startPos}: Змінна не може починатися з цифри.`);
        }

        let numberIsInvalid = token.type == 'number' && (token.value.match(/\./) || []).length > 1;
        if (numberIsInvalid) {
            errorMessages.push(`Позиція ${token.startPos}: Зайві символи '.' в числі.`);
        }

        let duplicateOperators = token.type == 'operator' && previousToken && previousToken.type == 'operator';
        if (duplicateOperators) {
            errorMessages.push(`Позиція ${token.startPos}: Подвійна операція.`);
        }

        let isOperand = token.type == 'function' || token.type == 'variable' || token.type == 'number';
        let missingOperator = isOperand && nextToken && nextToken.type != 'operator' && nextToken.type != 'bracket';
        if (missingOperator) {
            errorMessages.push(`Позиція ${token.startPos}: Відсутня математична операція після операнда.`);
        }

        let missingOperatorOpeningBracket = i != 0 && token.type == 'bracket' && token.value == '(' && previousToken.type != 'operator' && previousToken.value != '(';
        if (missingOperatorOpeningBracket) {
            errorMessages.push(`Позиція ${token.startPos}: Відсутня математична операція перед дужкою.`);
        }

        let missingOperatorClosingBracket = i != tokens.length - 1 && token.type == 'bracket' && token.value == ')' && nextToken.type != 'operator' && nextToken.value != ')';
        if (missingOperatorClosingBracket) {
            errorMessages.push(`Позиція ${token.startPos}: Відсутня математична операція після дужки.`);
        }

        let extraOperatorBrackets = token.type == 'bracket' && token.value == '(' && nextToken && nextToken.type == 'operator' && nextToken.value != '-';
        if (extraOperatorBrackets) {
            errorMessages.push(`Позиція ${token.startPos}: Неприпустима математична операція після дужки.`);
        }

        let emptyBrackets = token.type == 'bracket' && token.value == ')' && previousToken && previousToken.type == 'bracket' && previousToken.value == '(';
        if (emptyBrackets) {
            errorMessages.push(`Позиція ${token.startPos}: Пусті дужки.`);
        }

        if (token.type == 'bracket') {
            if (token.value == '(') {
                bracketQueue.push(token);
                openedBracketsCount++;
            } else {
                if (bracketQueue.pop() == undefined) {
                    // extra closing bracket
                    errorMessages.push(`Позиція ${token.startPos}: Зайва закриваюча дужка.`);
                }
                closedBracketsCount++;
            }
        }

        let bracketsDifference = i == (tokens.length - 1) && (openedBracketsCount != closedBracketsCount);
        if (bracketsDifference) {
            errorMessages.push(`Позиція ${token.startPos}: Нерівна кількість відкритих та закритих дужок.`);
        }
    }

    console.log(errorMessages);
}