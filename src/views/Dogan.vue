<script setup lang="ts">
import { ref, computed } from 'vue';

interface PrimalConstraint {
    coefficients: number[];
    relation: string;
    value: number;
}

// State management
const constraintsCount = ref(2);
const variablesCount = ref(2);
const objectiveType = ref<'maximize' | 'minimize'>('maximize');
const objectiveCoefficients = ref<number[]>([]);
const constraints = ref<PrimalConstraint[]>([]);

// Initialize objective coefficients
const initializeObjectiveCoefficients = () => {
    objectiveCoefficients.value = Array(variablesCount.value).fill(0);
};

// Initialize constraints
const initializeConstraints = () => {
    constraints.value = Array(constraintsCount.value).fill(null).map(() => ({
        coefficients: Array(variablesCount.value).fill(0),
        relation: '<=',
        value: 0
    }));
};

// Initialize data
initializeObjectiveCoefficients();
initializeConstraints();

// Methods to handle count changes
const updateConstraintsCount = (increment: boolean) => {
    if (increment) {
        constraintsCount.value++;
        constraints.value.push({
            coefficients: Array(variablesCount.value).fill(0),
            relation: '<=',
            value: 0
        });
    } else if (constraintsCount.value > 1) {
        constraintsCount.value--;
        constraints.value.pop();
    }
};

const updateVariablesCount = (increment: boolean) => {
    if (increment) {
        variablesCount.value++;
        objectiveCoefficients.value.push(0);
        constraints.value.forEach(constraint => {
            constraint.coefficients.push(0);
        });
    } else if (variablesCount.value > 1) {
        variablesCount.value--;
        objectiveCoefficients.value.pop();
        constraints.value.forEach(constraint => {
            constraint.coefficients.pop();
        });
    }
};

// Computed property for dual problem
const dualProblem = computed(() => {
    // Swap minimize/maximize
    const dualObjectiveType = objectiveType.value === 'maximize' ? 'minimize' : 'maximize';

    // In dual problem:
    // - Primal constraints coefficients become dual variables coefficients
    // - Primal objective coefficients become dual constraint values
    // - Primal constraint values become dual objective coefficients
    // - Inequality signs are flipped if we transform from max to min

    const dualVariablesCount = constraintsCount.value;
    const dualConstraintsCount = variablesCount.value;

    // Create dual objective coefficients (from primal constraint values)
    const dualObjectiveCoefficients = constraints.value.map(c => c.value);

    // Create dual constraints
    const dualConstraints = [];
    for (let i = 0; i < dualConstraintsCount; i++) {
        const coefficients = constraints.value.map(c => c.coefficients[i]);
        let relation = objectiveType.value === 'maximize' ? '>=' : '<=';

        dualConstraints.push({
            coefficients,
            relation,
            value: objectiveCoefficients.value[i]
        });
    }

    return {
        objectiveType: dualObjectiveType,
        objectiveCoefficients: dualObjectiveCoefficients,
        constraints: dualConstraints,
        variablesCount: dualVariablesCount,
        constraintsCount: dualConstraintsCount
    };
});

// Format number for display
const formatNumber = (num: number) => {
    return Number(num.toFixed(3));
};
</script>

<template>
    <div class="flex flex-col gap-8 p-6">
        <!-- Original Problem Display -->
        <div class="flex flex-col items-center gap-4">
            <h2 class="text-2xl font-bold text-gray-200">Primal Problem</h2>
            <div class="flex flex-col gap-4 text-gray-300">
                <!-- Objective Function -->
                <div class="flex items-center gap-2">
                    <span>{{ objectiveType === 'maximize' ? 'Max' : 'Min' }} Z =</span>
                    <template v-for="(coef, index) in objectiveCoefficients" :key="index">
                        <span>{{ formatNumber(coef) }}X<sub>{{ index + 1 }}</sub></span>
                        <span v-if="index < objectiveCoefficients.length - 1">+</span>
                    </template>
                </div>

                <!-- Constraints -->
                <div class="flex flex-col gap-2">
                    <p>Subject to:</p>
                    <div v-for="(constraint, cIndex) in constraints" :key="cIndex" class="flex items-center gap-2">
                        <template v-for="(coef, vIndex) in constraint.coefficients" :key="vIndex">
                            <span>{{ formatNumber(coef) }}X<sub>{{ vIndex + 1 }}</sub></span>
                            <span v-if="vIndex < constraint.coefficients.length - 1">+</span>
                        </template>
                        <span>{{ constraint.relation }}</span>
                        <span>{{ formatNumber(constraint.value) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dual Problem Display -->
        <div class="flex flex-col items-center gap-4">
            <h2 class="text-2xl font-bold text-gray-200">Dual Problem</h2>
            <div class="flex flex-col gap-4 text-gray-300">
                <!-- Dual Objective Function -->
                <div class="flex items-center gap-2">
                    <span>{{ dualProblem.objectiveType === 'maximize' ? 'Max' : 'Min' }} W =</span>
                    <template v-for="(coef, index) in dualProblem.objectiveCoefficients" :key="index">
                        <span>{{ formatNumber(coef) }}Y<sub>{{ index + 1 }}</sub></span>
                        <span v-if="index < dualProblem.objectiveCoefficients.length - 1">+</span>
                    </template>
                </div>

                <!-- Dual Constraints -->
                <div class="flex flex-col gap-2">
                    <p>Subject to:</p>
                    <div v-for="(constraint, cIndex) in dualProblem.constraints" :key="cIndex"
                        class="flex items-center gap-2">
                        <template v-for="(coef, vIndex) in constraint.coefficients" :key="vIndex">
                            <span>{{ formatNumber(coef) }}Y<sub>{{ vIndex + 1 }}</sub></span>
                            <span v-if="vIndex < constraint.coefficients.length - 1">+</span>
                        </template>
                        <span>{{ constraint.relation }}</span>
                        <span>{{ formatNumber(constraint.value) }}</span>
                    </div>
                </div>

                <!-- Non-negativity constraints -->
                <div>
                    <p>Where:</p>
                    <div class="flex gap-4">
                        <span v-for="i in dualProblem.variablesCount" :key="i">
                            Y<sub>{{ i }}</sub> {{ objectiveType === 'maximize' ? '≥' : '≤' }} 0
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls -->
        <div class="flex md:flex-row flex-col justify-center gap-8">
            <div class="flex flex-col items-center gap-4 p-4 border rounded-lg border-gray-700">
                <h3 class="text-xl font-bold text-gray-400">Constraints</h3>
                <div class="flex gap-2">
                    <button class="btn btn-outline btn-success" @click="updateConstraintsCount(true)">
                        Add
                    </button>
                    <button class="btn btn-outline btn-error" @click="updateConstraintsCount(false)">
                        Remove
                    </button>
                </div>
                <p class="text-sm text-gray-400">Count: {{ constraintsCount }}</p>
            </div>

            <div class="flex flex-col items-center gap-4 p-4 border rounded-lg border-gray-700">
                <h3 class="text-xl font-bold text-gray-400">Variables</h3>
                <div class="flex gap-2">
                    <button class="btn btn-outline btn-success" @click="updateVariablesCount(true)">
                        Add
                    </button>
                    <button class="btn btn-outline btn-error" @click="updateVariablesCount(false)">
                        Remove
                    </button>
                </div>
                <p class="text-sm text-gray-400">Count: {{ variablesCount }}</p>
            </div>
        </div>

        <!-- Input Section -->
        <div class="flex flex-col gap-8">
            <!-- Objective Function -->
            <div class="flex flex-col items-center gap-4">
                <h2 class="text-2xl font-bold text-gray-200">Objective Function</h2>
                <div class="flex items-center gap-4 text-gray-300 flex-col lg:flex-row">
                    <select v-model="objectiveType" class="px-4 py-2 rounded">
                        <option value="maximize">Maximize</option>
                        <option value="minimize">Minimize</option>
                    </select>

                    <div class="flex gap-2 flex-col lg:flex-row">
                        <div v-for="(coef, index) in objectiveCoefficients" :key="index"
                            class="flex items-center gap-2">
                            <input v-model.number="objectiveCoefficients[index]" type="number"
                                class="w-14 px-2 py-1 rounded text-center" />
                            <span>X<sub>{{ index + 1 }}</sub></span>
                            <span v-if="index < objectiveCoefficients.length - 1">+</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Constraints -->
            <div class="flex flex-col items-center gap-4">
                <h2 class="text-2xl font-bold text-gray-200">Constraints</h2>
                <div class="flex flex-col gap-12 text-gray-300">
                    <div v-for="(constraint, cIndex) in constraints" :key="cIndex"
                        class="flex lg:items-center items-baseline gap-4 flex-col lg:flex-row">
                        <div v-for="(coef, vIndex) in constraint.coefficients" :key="vIndex"
                            class="flex items-center gap-2">
                            <input v-model.number="constraints[cIndex].coefficients[vIndex]" type="number"
                                class="w-14 px-2 py-1 rounded text-center" />
                            <span>X<sub>{{ vIndex + 1 }}</sub></span>
                            <span v-if="vIndex < constraint.coefficients.length - 1">+</span>
                        </div>

                        <select v-model="constraints[cIndex].relation" class="px-4 py-2 rounded">
                            <option value="<=">≤</option>
                            <option value="=">=</option>
                            <option value=">=">≥</option>
                        </select>

                        <input v-model.number="constraints[cIndex].value" type="number"
                            class="w-14 px-2 py-1 rounded text-center" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>