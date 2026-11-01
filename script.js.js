
const loanAmount = document.getElementById("loanAmount");
const interestRate = document.getElementById("interestRate");
const loanYears = document.getElementById("loanYears");

const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");

const errorMessage = document.getElementById("errorMessage");

const money = (amount) =>
    "RM " + amount.toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

// Calculate loan
function calculateLoan() {

    const principal = Number(loanAmount.value);
    const annualRate = Number(interestRate.value);
    const years = Number(loanYears.value);

    errorMessage.textContent = "";

    // Validation
    if (
        loanAmount.value.trim() === "" ||
        interestRate.value.trim() === "" ||
        loanYears.value.trim() === "" ||
        !Number.isFinite(principal) ||
        !Number.isFinite(annualRate) ||
        !Number.isFinite(years) ||
        principal <= 0 ||
        annualRate < 0 ||
        years <= 0 ||
        !Number.isInteger(years) ||
        years > 50
    ) {
        errorMessage.textContent =
            "Please enter valid loan details. Tenure must be between 1 and 50 years.";
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;

    let monthlyPayment;

    // Monthly repayment formula
    if (monthlyRate === 0) {
        monthlyPayment = principal / totalMonths;
    } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);

        monthlyPayment =
            principal * monthlyRate * factor / (factor - 1);
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - principal;

    // Display summary
    document.getElementById("monthlyPayment").textContent =
        money(monthlyPayment);

    document.getElementById("resultLoan").textContent =
        money(principal);

    document.getElementById("totalInterest").textContent =
        money(totalInterest);

    document.getElementById("totalPayment").textContent =
        money(totalPayment);

    document.getElementById("resultDuration").textContent =
        years + (years === 1 ? " Year" : " Years");

    // Payment breakdown
    const principalPercentage = principal / totalPayment * 100;
    const interestPercentage = totalInterest / totalPayment * 100;

    document.getElementById("principalBar").style.width =
        principalPercentage + "%";

    document.getElementById("interestBar").style.width =
        interestPercentage + "%";

    document.getElementById("principalPercent").textContent =
        principalPercentage.toFixed(1) + "%";

    document.getElementById("interestPercent").textContent =
        interestPercentage.toFixed(1) + "%";

    // Generate monthly schedule
    generateSchedule(
        principal,
        monthlyRate,
        monthlyPayment,
        totalMonths
    );
}

// Generate amortization schedule
function generateSchedule(
    principal,
    monthlyRate,
    monthlyPayment,
    totalMonths
) {

    const scheduleBody = document.getElementById("scheduleBody");

    scheduleBody.innerHTML = "";

    let balance = principal;

    for (let month = 1; month <= totalMonths; month++) {

        const interest = balance * monthlyRate;

        let principalPaid = monthlyPayment - interest;

        // Correct final payment for rounding
        let payment = monthlyPayment;

        if (month === totalMonths || principalPaid >= balance) {
            principalPaid = balance;
            payment = principalPaid + interest;
        }

        balance = Math.max(0, balance - principalPaid);

        const row = document.createElement("tr");

        const values = [
            month,
            money(payment),
            money(principalPaid),
            money(interest),
            money(balance)
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        scheduleBody.appendChild(row);
    }
}

// Reset calculator
function resetCalculator() {

    loanAmount.value = 100000;
    interestRate.value = 4.5;
    loanYears.value = 5;

    errorMessage.textContent = "";

    calculateLoan();
}

// Event listeners
calculateBtn.addEventListener("click", calculateLoan);

resetBtn.addEventListener("click", resetCalculator);

// Calculate automatically when page opens
calculateLoan();
