const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let currentExpression = '0';
let justEvaluated = false;

function updateDisplay() {
    let displayString = currentExpression;
    // Limit display length for very long expressions, actual expression remains full length
    if (displayString.length > 15) {
        displayString = "..." + displayString.slice(displayString.length - 12);
    }
    display.textContent = displayString;
}

function appendNumber(number) {
    if (currentExpression === 'Error' || justEvaluated) {
        currentExpression = (number === '.' ? '0.' : number);
        justEvaluated = false;
    } else {
        if (number === '.') {
            const segments = currentExpression.split(/([+\-*\/])/); // Split by operators, keeping them
            const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';

            // Prevent adding decimal if current number segment already has one
            if (lastSegment.includes('.')) {
                return;
            }

            if (currentExpression === '0') {
                currentExpression = '0.';
            } else if (currentExpression === '' || ['+', '-', '*', '/'].includes(currentExpression.slice(-1))) {
                // If expression is empty or ends with an operator, start new number with "0."
                currentExpression += '0.';
            } else {
                currentExpression += '.';
            }
        } else { // Appending a digit
            if (currentExpression === '0') {
                currentExpression = number; // Replace "0" with the number
            } else {
                currentExpression += number;
            }
        }
    }
    updateDisplay();
}

function handleOperator(op) {
    if (currentExpression === 'Error') {
        return; // Don't allow operations on an error state, clear first
    }
    justEvaluated = false; // Any operator press means we are continuing or starting new calculation
    const lastChar = currentExpression.slice(-1);

    if (['+', '-', '*', '/'].includes(lastChar)) {
        // If last char is an operator, replace it (e.g. 5+- becomes 5-)
        currentExpression = currentExpression.slice(0, -1) + op;
    } else if (currentExpression === '' && op !== '-') {
         // Cannot start with *, /, + if expression is empty
         return;
    } else {
        // Append the operator
        currentExpression += op;
    }
    updateDisplay();
}

function calculate() {
    if (currentExpression === 'Error' || justEvaluated) {
        // If already evaluated or in error state, pressing equals again does nothing new
        // or keeps the error. Allow clearing.
        return;
    }

    let expressionToEvaluate = currentExpression;
    const lastChar = expressionToEvaluate.slice(-1);

    // If expression ends with an operator, remove it (e.g. "5+ =" becomes "5")
    if (['+', '-', '*', '/'].includes(lastChar)) {
        expressionToEvaluate = expressionToEvaluate.slice(0, -1);
    }

    // If after stripping, expression is empty or just an operator (e.g. "+" then "=") -> Error
    if (expressionToEvaluate === '' || (['+', '-', '*', '/'].includes(expressionToEvaluate) && expressionToEvaluate.length ===1) ) {
        currentExpression = 'Error';
        updateDisplay();
        justEvaluated = true;
        return;
    }

    try {
        // Tokenize: numbers (including negative) and operators
        const tokens = expressionToEvaluate.match(/-?\d+\.?\d*|[+\-*\/]/g);

        if (!tokens) {
            currentExpression = 'Error'; // Should be caught by earlier checks
            updateDisplay();
            justEvaluated = true;
            return;
        }

        // Handle case of single number e.g. "5" then "=" -> "5"
        if (tokens.length === 1) {
            if (!isNaN(parseFloat(tokens[0]))) {
                currentExpression = tokens[0];
                justEvaluated = true;
                updateDisplay();
                return;
            } else {
                currentExpression = 'Error'; // Single token is not a number
                updateDisplay();
                justEvaluated = true;
                return;
            }
        }
        
        // Validate token sequence: num op num op num ...
        let isValidSequence = true;
        if (isNaN(parseFloat(tokens[0]))) isValidSequence = false; // Must start with number
        if (isValidSequence) {
            for (let i = 1; i < tokens.length; i++) {
                if (i % 2 === 1) { // Operator position
                    if (!['+', '-', '*', '/'].includes(tokens[i])) {
                        isValidSequence = false; break;
                    }
                } else { // Number position
                    if (isNaN(parseFloat(tokens[i]))) {
                        isValidSequence = false; break;
                    }
                }
            }
        }
        // Expression must be like num op num (length 3 min) or num. Odd length overall.
        if (!isValidSequence || tokens.length % 2 === 0 ) {
             currentExpression = 'Error'; updateDisplay(); justEvaluated = true; return;
        }

        let result = parseFloat(tokens[0]);
        for (let i = 1; i < tokens.length; i += 2) {
            const operator = tokens[i];
            const nextNumber = parseFloat(tokens[i + 1]);

            // This check should be redundant due to pre-validation loop
            // if (isNaN(nextNumber)) { currentExpression = 'Error'; updateDisplay(); justEvaluated = true; return; }

            if (operator === '+') result += nextNumber;
            else if (operator === '-') result -= nextNumber;
            else if (operator === '*') result *= nextNumber;
            else if (operator === '/') {
                if (nextNumber === 0) {
                    currentExpression = 'Error'; // Division by zero
                    updateDisplay();
                    justEvaluated = true;
                    return;
                }
                result /= nextNumber;
            }
        }
        
        // Format result: avoid overly long decimals e.g. 1/3, and remove trailing zeros from toFixed
        if (result.toString().includes('.') && result.toString().split('.')[1].length > 8) {
             currentExpression = parseFloat(result.toFixed(8)).toString();
        } else {
             currentExpression = result.toString();
        }

    } catch (e) {
        currentExpression = 'Error';
    }
    justEvaluated = true;
    updateDisplay();
}

function clearAll() {
    currentExpression = '0';
    justEvaluated = false;
    updateDisplay();
}

// Event listeners for buttons
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.dataset.value; // Number or operator
        const id = button.id; // 'clear', 'equals'

        if (id === 'clear') {
            clearAll();
        } else if (id === 'equals') {
            calculate();
        } else if (button.classList.contains('operator')) {
            handleOperator(value);
        } else { // Number or decimal point
            appendNumber(value);
        }
    });
});

// Initial display update
updateDisplay(); 