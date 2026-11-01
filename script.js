const loanAmount = document.getElementById("loanAmount");
const interestRate = document.getElementById("interestRate");
const loanYears = document.getElementById("loanYears");
const scheduleModeSelect = document.getElementById("scheduleMode");

const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const errorMessage = document.getElementById("errorMessage");

const currencyFormatter = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const money = (amount) => currencyFormatter.format(amount);

function calculateLoan() {
    const principal = parseFloat(loanAmount.value);
    const annualRate = parseFloat(interestRate.value);
    const years = parseInt(loanYears.value, 10);

    errorMessage.textContent = "";

    if (
        isNaN(principal) || principal <= 0 ||
        isNaN(annualRate) || annualRate < 0 ||
        isNaN(years) || years < 1 || years > 50
    ) {
        errorMessage.textContent = "Please enter valid loan details (Tenure: 1–50 years).";
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;

    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = principal / totalMonths;
    } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = Math.max(0, totalPayment - principal);

    // Update KPI Displays
    document.getElementById("monthlyPayment").textContent = money(monthlyPayment);
    document.getElementById("resultLoan").textContent = money(principal);
    document.getElementById("totalInterest").textContent = money(totalInterest);
    document.getElementById("totalPayment").textContent = money(totalPayment);
    document.getElementById("resultDuration").textContent = `${years} ${years === 1 ? "Year" : "Years"}`;

    // Ratio Bar
    const principalPercentage = (principal / totalPayment) * 100;
    const interestPercentage = (totalInterest / totalPayment) * 100;

    document.getElementById("principalBar").style.width = `${principalPercentage}%`;
    document.getElementById("interestBar").style.width = `${interestPercentage}%`;
    document.getElementById("principalPercent").textContent = `${principalPercentage.toFixed(1)}%`;
    document.getElementById("interestPercent").textContent = `${interestPercentage.toFixed(1)}%`;

    // Render Schedule
    renderSchedule(principal, monthlyRate, monthlyPayment, totalMonths);
}

function renderSchedule(principal, monthlyRate, monthlyPayment, totalMonths) {
    const scheduleBody = document.getElementById("scheduleBody");
    const mode = scheduleModeSelect ? scheduleModeSelect.value : "yearly";
    const fragment = document.createDocumentFragment();

    let balance = principal;
    let accumulatedInterestYear = 0;
    let accumulatedPrincipalYear = 0;
    let accumulatedPaymentYear = 0;

    for (let month = 1; month <= totalMonths; month++) {
        const interest = balance * monthlyRate;
        let principalPaid = monthlyPayment - interest;
        let payment = monthlyPayment;

        if (month === totalMonths || principalPaid >= balance) {
            principalPaid = balance;
            payment = principalPaid + interest;
        }

        balance = Math.max(0, balance - principalPaid);

        accumulatedInterestYear += interest;
        accumulatedPrincipalYear += principalPaid;
        accumulatedPaymentYear += payment;

        if (mode === "monthly") {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${month}</td>
                <td>${money(payment)}</td>
                <td>${money(principalPaid)}</td>
                <td>${money(interest)}</td>
                <td>${money(balance)}</td>
            `;
            fragment.appendChild(tr);
        } else if (mode === "yearly" && (month % 12 === 0 || month === totalMonths)) {
            const currentYear = Math.ceil(month / 12);
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>Year ${currentYear}</td>
                <td>${money(accumulatedPaymentYear)}</td>
                <td>${money(accumulatedPrincipalYear)}</td>
                <td>${money(accumulatedInterestYear)}</td>
                <td>${money(balance)}</td>
            `;
            fragment.appendChild(tr);

            accumulatedInterestYear = 0;
            accumulatedPrincipalYear = 0;
            accumulatedPaymentYear = 0;
        }
    }

    scheduleBody.replaceChildren(fragment);
}

function resetCalculator() {
    loanAmount.value = 100000;
    interestRate.value = 4.5;
    loanYears.value = 5;
    errorMessage.textContent = "";
    calculateLoan();
}

// Live calculation triggers
[loanAmount, interestRate, loanYears].forEach((input) => {
    input.addEventListener("input", calculateLoan);
});

if (scheduleModeSelect) {
    scheduleModeSelect.addEventListener("change", calculateLoan);
}

calculateBtn.addEventListener("click", calculateLoan);
resetBtn.addEventListener("click", resetCalculator);

// Initial calculation
calculateLoan();