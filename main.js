
document.getElementById('form').addEventListener('submit', (event) => {
    event.preventDefault();
    let expression = document.getElementById('expressionInput').value;
    exec(expression);
});

function exec(expression) {

    let tokens = [];
    let currentToken = null;

    for (let i = 0; i <= expression.length; i++) {

        let char = expression.charAt(i);

        if (char == ' ') {
            continue;
        }

        // Filling token
        if (currentToken != null) {

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
}