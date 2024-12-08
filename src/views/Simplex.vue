<script setup lang="ts">
import { ref, computed } from 'vue';

interface Constraint {
    coefficients: number[];
    relation: string;
    value: number;
}

// State management
const constraintsCount = ref(2);
const variablesCount = ref(2);
const objectiveType = ref<'maximize' | 'minimize'>('maximize');
const objectiveCoefficients = ref<number[]>([]);
const constraints = ref<Constraint[]>([]);

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

// Simplex method implementation
const solveSimplexMethod = () => {
    // Convert problem to standard form
    const tableau = createInitialTableau();

    // Perform simplex iterations
    while (canImprove(tableau)) {
        const pivotColumn = findPivotColumn(tableau);
        const pivotRow = findPivotRow(tableau, pivotColumn);

        if (pivotRow === -1) {
            return { status: 'unbounded' };
        }

        performPivot(tableau, pivotRow, pivotColumn);
    }

    return extractSolution(tableau);
};

const createInitialTableau = () => {
    const rows = constraintsCount.value + 1;
    const cols = variablesCount.value + constraintsCount.value + 1;
    const tableau: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));

    // Set objective function coefficients
    for (let i = 0; i < variablesCount.value; i++) {
        tableau[0][i] = objectiveType.value === 'maximize' ?
            -objectiveCoefficients.value[i] :
            objectiveCoefficients.value[i];
    }

    // Set constraints
    for (let i = 0; i < constraintsCount.value; i++) {
        // Set coefficients
        for (let j = 0; j < variablesCount.value; j++) {
            tableau[i + 1][j] = constraints.value[i].coefficients[j];
        }

        // Set slack variables
        tableau[i + 1][variablesCount.value + i] = 1;

        // Set constants
        tableau[i + 1][cols - 1] = constraints.value[i].value;
    }

    return tableau;
};

const canImprove = (tableau: number[][]) => {
    return tableau[0].slice(0, -1).some(value => value < 0);
};

const findPivotColumn = (tableau: number[][]) => {
    return tableau[0].slice(0, -1).findIndex(value => value < 0);
};

const findPivotRow = (tableau: number[][], pivotColumn: number) => {
    let minRatio = Infinity;
    let pivotRow = -1;

    for (let i = 1; i < tableau.length; i++) {
        if (tableau[i][pivotColumn] <= 0) continue;

        const ratio = tableau[i][tableau[0].length - 1] / tableau[i][pivotColumn];
        if (ratio < minRatio) {
            minRatio = ratio;
            pivotRow = i;
        }
    }

    return pivotRow;
};

const performPivot = (tableau: number[][], pivotRow: number, pivotColumn: number) => {
    const pivotValue = tableau[pivotRow][pivotColumn];

    // Normalize pivot row
    for (let j = 0; j < tableau[0].length; j++) {
        tableau[pivotRow][j] /= pivotValue;
    }

    // Update other rows
    for (let i = 0; i < tableau.length; i++) {
        if (i === pivotRow) continue;

        const factor = tableau[i][pivotColumn];
        for (let j = 0; j < tableau[0].length; j++) {
            tableau[i][j] -= factor * tableau[pivotRow][j];
        }
    }
};

const extractSolution = (tableau: number[][]) => {
    const solution = Array(variablesCount.value).fill(0);
    const cols = tableau[0].length;

    for (let j = 0; j < variablesCount.value; j++) {
        let hasOne = false;
        let oneRow = -1;

        for (let i = 1; i < tableau.length; i++) {
            if (tableau[i][j] === 1) {
                if (hasOne) {
                    oneRow = -1;
                    break;
                }
                hasOne = true;
                oneRow = i;
            } else if (tableau[i][j] !== 0) {
                oneRow = -1;
                break;
            }
        }

        if (oneRow !== -1) {
            solution[j] = tableau[oneRow][cols - 1];
        }
    }

    return {
        status: 'optimal',
        solution,
        objectiveValue: objectiveType.value === 'maximize' ?
            -tableau[0][tableau[0].length - 1] :
            tableau[0][tableau[0].length - 1]
    };
};

// Computed property for solution
const solution = ref<any>(null);

const calculateSolution = () => {
    solution.value = solveSimplexMethod();
};
</script>

<template>
    <div class="flex flex-col gap-8 p-6">
        <!-- Controls -->
        <div class="flex justify-center gap-8">
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

        <!-- Objective Function -->
        <div class="flex flex-col items-center gap-4">
            <h2 class="text-2xl font-bold text-gray-200">Objective Function</h2>
            <div class="flex items-center gap-4 text-gray-300">
                <select v-model="objectiveType" class="px-4 py-2 rounded">
                    <option value="maximize">Maximize</option>
                    <option value="minimize">Minimize</option>
                </select>

                <div class="flex gap-2">
                    <div v-for="(coef, index) in objectiveCoefficients" :key="index" class="flex items-center gap-2">
                        <input v-model.number="objectiveCoefficients[index]" type="number"
                            class="w-20 px-2 py-1 rounded" />
                        <span>X<sub>{{ index + 1 }}</sub></span>
                        <span v-if="index < objectiveCoefficients.length - 1">+</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Constraints -->
        <div class="flex flex-col items-center gap-4">
            <h2 class="text-2xl font-bold text-gray-200">Constraints</h2>
            <div class="flex flex-col gap-4 text-gray-300">
                <div v-for="(constraint, cIndex) in constraints" :key="cIndex" class="flex items-center gap-4">
                    <div v-for="(coef, vIndex) in constraint.coefficients" :key="vIndex"
                        class="flex items-center gap-2">
                        <input v-model.number="constraints[cIndex].coefficients[vIndex]" type="number"
                            class="w-20 px-2 py-1 rounded" />
                        <span>X<sub>{{ vIndex + 1 }}</sub></span>
                        <span v-if="vIndex < constraint.coefficients.length - 1">+</span>
                    </div>

                    <select v-model="constraints[cIndex].relation" class="px-4 py-2 rounded">
                        <option value="<=">≤</option>
                        <option value="=">=</option>
                        <option value=">=">≥</option>
                    </select>

                    <input v-model.number="constraints[cIndex].value" type="number" class="w-20 px-2 py-1 rounded" />
                </div>
            </div>
        </div>

        <!-- Solve Button -->
        <div class="flex justify-center">
            <button @click="calculateSolution" class="px-6 py-3 bg-blue-600 rounded-lg font-bold">
                Solve
            </button>
        </div>

        <!-- Solution -->
        <div v-if="solution" class="flex flex-col items-center gap-4 text-gray-200">
            <h2 class="text-2xl font-bold">Solution</h2>
            <div v-if="solution.status === 'optimal'" class="flex flex-col gap-2">
                <p>Status: Optimal solution found</p>
                <p>Objective Value: {{ solution.objectiveValue }}</p>
                <div class="flex gap-4">
                    <div v-for="(value, index) in solution.solution" :key="index">
                        X<sub>{{ index + 1 }}</sub> = {{ value }}
                    </div>
                </div>
            </div>
            <div v-else-if="solution.status === 'unbounded'" class="text-red-500">
                Problem is unbounded
            </div>
        </div>
    </div>
</template>