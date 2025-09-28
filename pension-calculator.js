// מחשבון חיסכון פנסיוני - JavaScript

class PensionCalculator {
    constructor() {
        this.form = document.getElementById('pensionForm');
        this.resultsSection = document.getElementById('results');
        this.personalResult = document.getElementById('personalResult');
        this.ageComparison = document.getElementById('ageComparison');
        this.chart = null;
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateAndDisplayResults();
        });

        // עדכון אוטומטי בזמן הקלדה
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.isFormValid()) {
                    this.calculateAndDisplayResults();
                }
            });
        });
    }

    isFormValid() {
        const formData = new FormData(this.form);
        const currentAge = parseInt(formData.get('currentAge'));
        const targetAmount = parseInt(formData.get('targetAmount'));
        const annualReturn = parseFloat(formData.get('annualReturn'));
        const retirementAge = parseInt(formData.get('retirementAge'));

        return currentAge && targetAmount && annualReturn !== null && retirementAge &&
               currentAge >= 18 && currentAge < retirementAge && targetAmount > 0 && annualReturn >= 0;
    }

    calculateAndDisplayResults() {
        if (!this.isFormValid()) return;

        const formData = new FormData(this.form);
        const currentAge = parseInt(formData.get('currentAge'));
        const targetAmount = parseInt(formData.get('targetAmount'));
        const annualReturn = parseFloat(formData.get('annualReturn')) / 100;
        const retirementAge = parseInt(formData.get('retirementAge'));

        // חישוב התוצאה האישית
        const personalResult = this.calculateMonthlyPayment(currentAge, retirementAge, targetAmount, annualReturn);
        
        // הצגת התוצאה האישית
        this.displayPersonalResult(personalResult, currentAge, retirementAge, targetAmount);
        
        // יצירת טבלת השוואה לפי גילאים
        this.displayAgeComparison(retirementAge, targetAmount, annualReturn, currentAge);
        
        // יצירת גרף
        this.createChart(currentAge, retirementAge, personalResult.monthlyPayment, annualReturn);
        
        // הצגת הקטע תוצאות
        this.resultsSection.classList.remove('hidden');
        
        // גלילה לתוצאות
        setTimeout(() => {
            this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }

    calculateMonthlyPayment(startAge, endAge, targetAmount, annualReturn) {
        const years = endAge - startAge;
        const months = years * 12;
        const monthlyReturn = annualReturn / 12;

        let monthlyPayment;
        if (monthlyReturn === 0) {
            // אם אין תשואה, חישוב פשוט
            monthlyPayment = targetAmount / months;
        } else {
            // נוסחת התשלום החודשי עבור קרן עתידית
            // FV = PMT * [((1 + r)^n - 1) / r]
            // PMT = FV / [((1 + r)^n - 1) / r]
            monthlyPayment = targetAmount / (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn));
        }

        const totalPayments = monthlyPayment * months;
        const totalEarnings = targetAmount - totalPayments;
        const returnRate = (totalEarnings / totalPayments) * 100;

        return {
            monthlyPayment: Math.round(monthlyPayment),
            totalPayments: Math.round(totalPayments),
            totalEarnings: Math.round(totalEarnings),
            returnRate: returnRate.toFixed(1),
            years: years,
            months: months
        };
    }

    displayPersonalResult(result, currentAge, retirementAge, targetAmount) {
        this.personalResult.innerHTML = `
            <div class="text-center">
                <div class="text-6xl font-bold mb-4">
                    ₪${this.formatNumber(result.monthlyPayment)}
                </div>
                <div class="text-2xl mb-6">לחודש במשך ${result.years} שנים</div>
                
                <div class="grid md:grid-cols-3 gap-6 text-lg">
                    <div class="bg-white bg-opacity-20 rounded-lg p-4">
                        <div class="font-semibold">סה"כ הפקדות</div>
                        <div class="text-2xl">₪${this.formatNumber(result.totalPayments)}</div>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-4">
                        <div class="font-semibold">רווח מתשואות</div>
                        <div class="text-2xl">₪${this.formatNumber(result.totalEarnings)}</div>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-4">
                        <div class="font-semibold">יעד החיסכון</div>
                        <div class="text-2xl">₪${this.formatNumber(targetAmount)}</div>
                    </div>
                </div>
                
                <div class="mt-6 text-lg opacity-90">
                    <i class="fas fa-info-circle mr-2"></i>
                    אם תתחיל לחסוך בגיל ${currentAge}, תצטרך להפקיד <strong>₪${this.formatNumber(result.monthlyPayment)}</strong> מדי חודש עד גיל ${retirementAge}
                </div>
            </div>
        `;
    }

    displayAgeComparison(retirementAge, targetAmount, annualReturn, currentAge) {
        const ages = [25, 30, 35, 40, 45, 50, 55];
        const validAges = ages.filter(age => age < retirementAge);
        
        this.ageComparison.innerHTML = '';

        validAges.forEach(age => {
            const result = this.calculateMonthlyPayment(age, retirementAge, targetAmount, annualReturn);
            const isCurrentAge = age === currentAge;
            
            const ageRow = document.createElement('div');
            ageRow.className = `age-row flex justify-between items-center ${isCurrentAge ? 'highlight-row' : ''}`;
            
            ageRow.innerHTML = `
                <div class="flex items-center space-x-4 space-x-reverse">
                    <div class="text-2xl font-bold">גיל ${age}</div>
                    ${isCurrentAge ? '<div class="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">הגיל שלך</div>' : ''}
                </div>
                <div class="text-left">
                    <div class="text-2xl font-bold">₪${this.formatNumber(result.monthlyPayment)}</div>
                    <div class="text-sm opacity-75">לחודש</div>
                </div>
            `;
            
            this.ageComparison.appendChild(ageRow);
        });

        // הוספת הודעת עידוד
        const encouragementDiv = document.createElement('div');
        encouragementDiv.className = 'bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl p-6 mt-6 text-center';
        encouragementDiv.innerHTML = `
            <div class="text-xl font-bold mb-2">
                <i class="fas fa-trophy mr-2"></i>
                זכרו: התחלה מוקדמת = חיסכון גדול!
            </div>
            <div class="text-lg">
                כל עשור של דחייה כמעט מכפיל את הסכום החודשי הנדרש
            </div>
        `;
        
        this.ageComparison.appendChild(encouragementDiv);
    }

    createChart(currentAge, retirementAge, monthlyPayment, annualReturn) {
        const ctx = document.getElementById('savingsChart').getContext('2d');
        
        // הכנת נתונים לגרף
        const years = retirementAge - currentAge;
        const labels = [];
        const totalSavingsData = [];
        const paymentsData = [];
        const earningsData = [];
        
        for (let year = 0; year <= years; year++) {
            const age = currentAge + year;
            labels.push(age.toString());
            
            const months = year * 12;
            const totalPayments = monthlyPayment * months;
            
            let totalValue;
            if (annualReturn === 0) {
                totalValue = totalPayments;
            } else {
                const monthlyReturn = annualReturn / 12;
                if (months === 0) {
                    totalValue = 0;
                } else {
                    totalValue = monthlyPayment * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn));
                }
            }
            
            const earnings = totalValue - totalPayments;
            
            paymentsData.push(Math.round(totalPayments));
            earningsData.push(Math.round(earnings));
            totalSavingsData.push(Math.round(totalValue));
        }
        
        // מחיקת גרף קיים
        if (this.chart) {
            this.chart.destroy();
        }
        
        // יצירת גרף חדש
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'סה"כ חיסכון',
                        data: totalSavingsData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'סה"כ הפקדות',
                        data: paymentsData,
                        borderColor: '#f093fb',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'רווחים מתשואות',
                        data: earningsData,
                        borderColor: '#48bb78',
                        backgroundColor: 'rgba(72, 187, 120, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'צמיחת החיסכון לאורך השנים',
                        font: {
                            size: 18,
                            family: 'Heebo'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Heebo'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'גיל',
                            font: {
                                family: 'Heebo'
                            }
                        },
                        ticks: {
                            font: {
                                family: 'Heebo'
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'סכום (₪)',
                            font: {
                                family: 'Heebo'
                            }
                        },
                        ticks: {
                            font: {
                                family: 'Heebo'
                            },
                            callback: function(value) {
                                return '₪' + value.toLocaleString('he-IL');
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                hover: {
                    animationDuration: 300
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    formatNumber(num) {
        return new Intl.NumberFormat('he-IL').format(num);
    }
}

// אתחול המחשבון כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    new PensionCalculator();
});

// פונקציות נוספות לשיפור החווית המשתמש

// אנימציה חלקה למספרים
function animateValue(element, start, end, duration) {
    const startTimestamp = performance.now();
    
    const step = (timestamp) => {
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = new Intl.NumberFormat('he-IL').format(current);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    
    requestAnimationFrame(step);
}

// טיפים והדרכות אינטראקטיביות
const tips = [
    "💡 טיप: ככל שמתחילים מוקדם יותר, כך פחות צריך לחסוך מדי חודש",
    "📈 עובדה: תשואה של 8% שנתית מכפילה את הכסף כל 9 שנים בערך",
    "⏰ זכרו: זמן הוא החבר הכי טוב של החוסך לפנסיה",
    "💪 התחילו היום: גם 100 שקל בחודש יכולים להפוך למאות אלפי שקלים",
    "🎯 מטרה: לא צריך להגיע בדיוק ליעד - כל חיסכון הוא טוב מאפס"
];

// הצגת טיפים רנדומליים
function showRandomTip() {
    const tipElement = document.createElement('div');
    tipElement.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50 transform translate-x-full transition-transform duration-500';
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipElement.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="pr-2">${randomTip}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(tipElement);
    
    // אנימציה להצגה
    setTimeout(() => {
        tipElement.classList.remove('translate-x-full');
    }, 100);
    
    // הסרה אוטומטית אחרי 5 שניות
    setTimeout(() => {
        tipElement.classList.add('translate-x-full');
        setTimeout(() => {
            if (tipElement.parentElement) {
                tipElement.remove();
            }
        }, 500);
    }, 5000);
}

// הצגת טיפים כל 30 שניות
setInterval(showRandomTip, 30000);