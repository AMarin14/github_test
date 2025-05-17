const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let currentInput = '';
let operator = '';
let previousInput = '';
let shouldResetDisplay = false;

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.dataset.value;
        const id = button.id;

        if (id === 'clear') {
            clearAll();
        } else if (id === 'equals') {
            calculate();
        } else if (button.classList.contains('operator')) {
            handleOperator(value);
        } else {
            appendNumber(value);
        }
    });
});

function appendNumber(number) {
    if (shouldResetDisplay) {
        display.textContent = '';
        shouldResetDisplay = false;
    }
    if (display.textContent === '0' && number !== '.') {
        display.textContent = number;
    } else {
        // Prevent multiple decimal points
        if (number === '.' && display.textContent.includes('.')) return;
        display.textContent += number;
    }
    currentInput = display.textContent;
}

function handleOperator(op) {
    if (currentInput === '' && previousInput === '') return;
    if (operator !== '' && !shouldResetDisplay) {
        calculate(); // Calculate if there's a pending operation
    }
    operator = op;
    previousInput = display.textContent;
    shouldResetDisplay = true;
}

function calculate() {
    if (previousInput === '' || operator === '' || currentInput === '') return;

    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) {
        display.textContent = 'Error';
        resetCalculatorState();
        return;
    }

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                display.textContent = 'Error'; // Division by zero
                resetCalculatorState();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    display.textContent = result;
    currentInput = result.toString();
    operator = '';
    previousInput = '';
    shouldResetDisplay = true; // Allow new input after calculation
}

function clearAll() {
    display.textContent = '0';
    resetCalculatorState();
}

function resetCalculatorState() {
    currentInput = '';
    operator = '';
    previousInput = '';
    shouldResetDisplay = false;
} 