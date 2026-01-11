/* =======  BMI CALCULATOR & SMART DIET LOGIC  ======= */
const heightInput = document.getElementById('heightRange');
const weightInput = document.getElementById('weightRange');
const heightVal = document.getElementById('heightVal');
const weightVal = document.getElementById('weightVal');
const bmiResult = document.getElementById('bmiResult');
const bmiCategory = document.getElementById('bmiCategory');
const bmiGlow = document.getElementById('bmiGlow');
const dietBtn = document.getElementById('dietBtn'); // The new button

/* Modal Elements */
const dietModal = document.getElementById('dietModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const modalCategory = document.getElementById('modalCategory');
const dietStrategy = document.getElementById('dietStrategy');
const dietList = document.getElementById('dietList');

// Data: Diet Plans based on Category
const dietPlans = {
    Underweight: {
        strategy: "Focus on Caloric Surplus. You need to eat more calories than you burn. Prioritize nutrient-dense foods and protein for muscle repair.",
        foods: [
            "Avocados, Nuts & Nut Butters",
            "Whole Milk, Cheese & Yogurt",
            "Red Meat & Oily Fish (Salmon)",
            "Oats, Brown Rice & Quinoa",
            "Protein Shakes with Bananas"
        ]
    },
    "Normal Weight": {
        strategy: "Focus on Maintenance & Performance. Keep a balanced diet to support workouts. 40% Protein, 35% Carbs, 25% Fats.",
        foods: [
            "Lean Chicken Breast & Turkey",
            "Egg Whites & Whole Eggs",
            "Sweet Potatoes & Green Veggies",
            "Berries & Citric Fruits",
            "Greek Yogurt & Cottage Cheese"
        ]
    },
    Overweight: {
        strategy: "Focus on Slight Caloric Deficit. High protein to preserve muscle, lower carbs to reduce fat storage. Drink 3-4L water.",
        foods: [
            "Grilled Chicken & White Fish",
            "Leafy Greens (Spinach, Kale)",
            "Legumes & Lentils (Dals)",
            "Green Tea & Black Coffee",
            "Low-Sugar Fruits (Apples)"
        ]
    },
    Obese: {
        strategy: "Focus on Aggressive Fat Loss (medical supervision advised). Eliminate sugar and processed carbs. Intermittent fasting recommended.",
        foods: [
            "High Fiber Vegetables",
            "Lean Protein Sources Only",
            "Boiled egg whites",
            "Cucumber & Watermelon",
            "Zero Sugary Drinks"
        ]
    }
};

let currentCategory = "Normal Weight";

function calculateBMI() {
    if (!heightInput || !weightInput) return;

    const h = parseInt(heightInput.value);
    const w = parseInt(weightInput.value);

    // Update digital displays
    heightVal.textContent = `${h} cm`;
    weightVal.textContent = `${w} kg`;

    // Calculate BMI
    // Formula: kg / m^2
    const hM = h / 100; // convert cm to meters
    const bmi = (w / (hM * hM)).toFixed(1);

    bmiResult.textContent = bmi;

    // Determine Category & Color
    let color = '';

    if (bmi < 18.5) {
        currentCategory = 'Underweight';
        color = '#3b82f6'; // Blue
    } else if (bmi >= 18.5 && bmi < 24.9) {
        currentCategory = 'Normal Weight';
        color = '#32CD32'; // Neon Green
    } else if (bmi >= 25 && bmi < 29.9) {
        currentCategory = 'Overweight';
        color = '#FFD700'; // Gold/Yellow
    } else {
        currentCategory = 'Obese';
        color = '#FF4500'; // Neon Orange/Red
    }

    bmiCategory.textContent = currentCategory;

    // Update Styles
    bmiCategory.style.backgroundColor = color;
    bmiCategory.style.color = (currentCategory === 'Underweight' || currentCategory === 'Obese') ? 'white' : 'black';

    // Update Glow
    bmiGlow.style.backgroundColor = color;
    bmiResult.style.color = 'white';

    // --- NEW: Ideal Weight & Difference Logic ---
    // Reverse BMI Formula: Weight = BMI * (Height_m * Height_m)
    // Ideal BMI Range: 18.5 to 24.9
    const minIdealWeight = (18.5 * hM * hM).toFixed(1);
    const maxIdealWeight = (24.9 * hM * hM).toFixed(1);

    let feedbackMsg = '';

    if (bmi < 18.5) {
        // Needs to gain
        const gainNeeded = (minIdealWeight - w).toFixed(1);
        feedbackMsg = `Goal: Gain <span style="color:#3b82f6; font-weight:bold">${gainNeeded} kg</span> to reach normal range.`;
    } else if (bmi > 24.9) {
        // Needs to lose
        const lossNeeded = (w - maxIdealWeight).toFixed(1);
        feedbackMsg = `Goal: Lose <span style="color:${color}; font-weight:bold">${lossNeeded} kg</span> to reach normal range.`;
    } else {
        feedbackMsg = `<span style="color:#32CD32; font-weight:bold">Perfect!</span> Keep maintaining this weight.`;
    }

    // Update or Create Feedback Element
    let feedbackEl = document.getElementById('bmiFeedback');
    if (!feedbackEl) {
        feedbackEl = document.createElement('p');
        feedbackEl.id = 'bmiFeedback';
        feedbackEl.className = 'text-gray-400 text-xs mt-4 font-mono';
        // Insert after category
        bmiCategory.parentNode.insertBefore(feedbackEl, dietBtn);
    }
    feedbackEl.innerHTML = `Ideal for ${h}cm: <span class="text-white">${minIdealWeight}-${maxIdealWeight}kg</span><br>${feedbackMsg}`;

    // Show Diet Button
    if (dietBtn) {
        dietBtn.classList.remove('hidden');
        dietBtn.classList.add('flex'); // Ensure layout
    }
}

// Open Modal Logic
function openDietModal() {
    if (!dietModal) return;

    // Populate Data
    const plan = dietPlans[currentCategory] || dietPlans["Normal Weight"];

    modalCategory.textContent = `BASED ON YOUR BMI: ${currentCategory.toUpperCase()}`;
    modalCategory.style.color = bmiCategory.style.backgroundColor;

    dietStrategy.textContent = plan.strategy;

    // Clear list & animate items
    dietList.innerHTML = '';
    plan.foods.forEach(food => {
        const li = document.createElement('li');
        li.className = "flex items-center gap-2";
        li.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-[#FF4500]"></span> ${food}`;
        dietList.appendChild(li);
    });

    // Show Modal
    dietModal.classList.remove('hidden');
    dietModal.classList.add('flex');
    // Animation Frame
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// Close Modal Logic
function closeDietModalFunc() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        dietModal.classList.add('hidden');
        dietModal.classList.remove('flex');
    }, 300);
}


// Event Listeners
if (heightInput && weightInput) {
    heightInput.addEventListener('input', calculateBMI);
    weightInput.addEventListener('input', calculateBMI);

    // Initial Calc
    calculateBMI();
}

if (dietBtn) {
    dietBtn.addEventListener('click', openDietModal);
}

if (closeModal) {
    closeModal.addEventListener('click', closeDietModalFunc);
}

// Close on outside click
if (dietModal) {
    dietModal.addEventListener('click', (e) => {
        if (e.target === dietModal) closeDietModalFunc();
    });
}
